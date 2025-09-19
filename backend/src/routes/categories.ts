import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authenticateWithSubscription, requireTokens, trackApiUsage } from '../middleware/subscriptionAuth';
import prisma from '../config/database';
import aiService from '../services/aiService';

const router = express.Router();

// Generic category prompt generation endpoint
router.post('/:category/:template', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'category-specific'),
  body('answers').optional().isObject(),
  body('preferences').optional().isObject()
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, template } = req.params;
    const { answers = {}, preferences = {} } = req.body;

    // Check user's generation limit
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user!.generationsUsed >= user!.generationsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Generation limit exceeded. Please upgrade your plan.'
      });
    }

    console.log(`🎯 Generating ${category}/${template} prompt`);

    // Generate AI prompt based on category and template
    const prompt = await aiService.generateCategoryPrompt({
      category,
      template,
      answers,
      preferences,
      userId: req.user!.id
    });

    // Save to database
    const savedPrompt = await prisma.prompt.create({
      data: {
        title: `${category} - ${template}`,
        content: prompt.content,
        category: category,
        template: template,
        userId: req.user!.id,
        metadata: {
          answers,
          preferences,
          usage: prompt.usage || {}
        }
      }
    });

    // Update user's generation count
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        prompt: savedPrompt,
        usage: prompt.usage
      },
      message: `${category} prompt generated successfully`
    });

  } catch (error) {
    console.error(`Category prompt generation error (${req.params.category}/${req.params.template}):`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prompt',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;