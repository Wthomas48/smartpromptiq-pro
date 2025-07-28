import express from 'express';
import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { 
  db, 
  prompts, 
  promptTemplates, 
  promptCategories, 
  apiUsage,
  users,
  subscriptions,
  subscriptionPlans 
} from '../db/index';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { aiConfig } from '../config/env';

const router = express.Router();

// Initialize AI clients
const openai = aiConfig.openai.enabled ? new OpenAI({
  apiKey: aiConfig.openai.apiKey,
}) : null;

const anthropic = aiConfig.anthropic.enabled ? new Anthropic({
  apiKey: aiConfig.anthropic.apiKey,
}) : null;

// Validation schemas
const generatePromptSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(4000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku']),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(4000).optional().default(1000),
  templateId: z.string().uuid().optional(),
});

const savePromptSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  isPublic: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  templateId: z.string().uuid().optional(),
});

// Check user's API usage limits
async function checkUsageLimits(userId: string): Promise<{ allowed: boolean; usage: number; limit: number }> {
  try {
    // Get user's current subscription
    const [userSubscription] = await db
      .select({
        limits: subscriptionPlans.limits,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!userSubscription || userSubscription.status !== 'active') {
      return { allowed: false, usage: 0, limit: 0 };
    }

    const limits = userSubscription.limits as any;
    const monthlyLimit = limits?.promptsPerMonth || 10; // Default free plan limit

    // Count usage this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const [usageCount] = await db
      .select({ count: sql`count(*)` })
      .from(apiUsage)
      .where(
        and(
          eq(apiUsage.userId, userId),
          sql`${apiUsage.createdAt} >= ${startOfMonth}`)
      );

    const currentUsage = usageCount?.count || 0;

    return {
      allowed: currentUsage < monthlyLimit,
      usage: currentUsage,
      limit: monthlyLimit,
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return { allowed: false, usage: 0, limit: 0 };
  }
}

// Generate AI prompt
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, model, temperature, maxTokens, templateId } = generatePromptSchema.parse(req.body);
    const userId = req.user!.id;

    // Check usage limits
    const usageCheck = await checkUsageLimits(userId);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Monthly prompt limit exceeded',
        code: 'USAGE_LIMIT_EXCEEDED',
        usage: usageCheck.usage,
        limit: usageCheck.limit,
      });
    }

    let generatedOutput = '';
    let tokensUsed = 0;
    let cost = 0;
    let aiProvider = '';
    let success = true;
    let errorMessage = '';

    const startTime = Date.now();

    try {
      if (model.startsWith('gpt-') && openai) {
        aiProvider = 'openai';
        const completion = await openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });

        generatedOutput = completion.choices[0]?.message?.content || '';
        tokensUsed = completion.usage?.total_tokens || 0;
        
        // Rough cost calculation (adjust based on actual OpenAI pricing)
        cost = model === 'gpt-4' ? tokensUsed * 0.00006 : tokensUsed * 0.000002;

      } else if (model.startsWith('claude-') && anthropic) {
        aiProvider = 'anthropic';
        const completion = await anthropic.messages.create({
          model: model.replace('claude-3-', 'claude-3-'),
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        });

        generatedOutput = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
        tokensUsed = completion.usage?.input_tokens + completion.usage?.output_tokens || 0;
        
        // Rough cost calculation (adjust based on actual Anthropic pricing)
        cost = tokensUsed * 0.000008;

      } else {
        throw new Error(`AI provider not available for model: ${model}`);
      }

    } catch (aiError) {
      success = false;
      errorMessage = aiError instanceof Error ? aiError.message : 'AI generation failed';
      console.error('AI generation error:', aiError);
    }

    const requestDuration = Date.now() - startTime;

    // Save prompt to database
    const [savedPrompt] = await db
      .insert(prompts)
      .values({
        userId,
        templateId,
        title: `Generated Prompt - ${new Date().toISOString()}`,
        content: prompt,
        aiModel: model,
        generatedOutput: success ? generatedOutput : null,
        inputVariables: {},
        metadata: {
          temperature,
          maxTokens,
          tokensUsed,
          cost,
          requestDuration,
        },
      })
      .returning();

    // Log API usage
    await db.insert(apiUsage).values({
      userId,
      promptId: savedPrompt.id,
      aiProvider,
      model,
      tokensUsed,
      cost,
      requestDuration,
      success,
      errorMessage: success ? null : errorMessage,
    });

    if (!success) {
      return res.status(500).json({
        error: 'AI generation failed',
        code: 'AI_ERROR',
        details: errorMessage,
      });
    }

    res.json({
      message: 'Prompt generated successfully',
      prompt: savedPrompt,
      generatedOutput,
      metadata: {
        tokensUsed,
        cost: cost.toFixed(6),
        requestDuration,
        usage: usageCheck.usage + 1,
        limit: usageCheck.limit,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    console.error('Generate prompt error:', error);
    res.status(500).json({
      error: 'Failed to generate prompt',
      code: 'GENERATION_ERROR'
    });
  }
});

// Get user's prompts
router.get('/prompts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const userPrompts = await db
      .select({
        id: prompts.id,
        title: prompts.title,
        content: prompts.content,
        aiModel: prompts.aiModel,
        generatedOutput: prompts.generatedOutput,
        isPublic: prompts.isPublic,
        isFavorite: prompts.isFavorite,
        createdAt: prompts.createdAt,
        updatedAt: prompts.updatedAt,
        templateTitle: promptTemplates.title,
      })
      .from(prompts)
      .leftJoin(promptTemplates, eq(prompts.templateId, promptTemplates.id))
      .where(eq(prompts.userId, userId))
      .orderBy(desc(prompts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(prompts)
      .where(eq(prompts.userId, userId));

    res.json({
      prompts: userPrompts,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({
      error: 'Failed to get prompts',
      code: 'GET_PROMPTS_ERROR'
    });
  }
});

// Save/update prompt
router.post('/prompts', authenticateToken, async (req, res) => {
  try {
    const { title, content, isPublic, isFavorite, templateId } = savePromptSchema.parse(req.body);
    const userId = req.user!.id;

    const [savedPrompt] = await db
      .insert(prompts)
      .values({
        userId,
        templateId,
        title,
        content,
        isPublic,
        isFavorite,
      })
      .returning();

    res.status(201).json({
      message: 'Prompt saved successfully',
      prompt: savedPrompt,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    console.error('Save prompt error:', error);
    res.status(500).json({
      error: 'Failed to save prompt',
      code: 'SAVE_ERROR'
    });
  }
});

// Get prompt categories
router.get('/categories', optionalAuth, async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(promptCategories)
      .where(eq(promptCategories.isActive, true))
      .orderBy(promptCategories.sortOrder, promptCategories.name);

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      code: 'GET_CATEGORIES_ERROR'
    });
  }
});

// Get prompt templates
router.get('/templates', optionalAuth, async (req, res) => {
  try {
    const categoryId = req.query.categoryId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: promptTemplates.id,
        title: promptTemplates.title,
        description: promptTemplates.description,
        content: promptTemplates.content,
        isPremium: promptTemplates.isPremium,
        tags: promptTemplates.tags,
        usageCount: promptTemplates.usageCount,
        rating: promptTemplates.rating,
        categoryName: promptCategories.name,
        categoryIcon: promptCategories.icon,
        createdAt: promptTemplates.createdAt,
      })
      .from(promptTemplates)
      .leftJoin(promptCategories, eq(promptTemplates.categoryId, promptCategories.id))
      .where(eq(promptTemplates.isPublic, true));

    if (categoryId) {
      query = query.where(eq(promptTemplates.categoryId, categoryId));
    }

    const templates = await query
      .orderBy(desc(promptTemplates.usageCount), desc(promptTemplates.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      templates,
      pagination: {
        page,
        limit,
        hasMore: templates.length === limit,
      },
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Failed to get templates',
      code: 'GET_TEMPLATES_ERROR'
    });
  }
});

// Get user's API usage stats
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Get current month usage
    const [monthlyUsage] = await db
      .select({
        count: sql`count(*)`,
        totalTokens: sqlsum(),
        totalCost: sqlsum(),
      })
      .from(apiUsage)
      .where(
        and(
          eq(apiUsage.userId, userId),
          sql`${apiUsage.createdAt} >= ${startOfMonth}`)
      );

    // Get subscription limits
    const usageCheck = await checkUsageLimits(userId);

    res.json({
      currentMonth: {
        promptsUsed: monthlyUsage?.count || 0,
        tokensUsed: monthlyUsage?.totalTokens || 0,
        totalCost: parseFloat((monthlyUsage?.totalCost || 0).toFixed(6)),
      },
      limits: {
        promptsPerMonth: usageCheck.limit,
        remaining: Math.max(0, usageCheck.limit - usageCheck.usage),
      },
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: 'Failed to get usage stats',
      code: 'GET_USAGE_ERROR'
    });
  }
});

export default router;





