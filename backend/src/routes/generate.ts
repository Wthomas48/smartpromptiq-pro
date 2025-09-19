import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authenticateWithSubscription, requireTokens, trackApiUsage } from '../middleware/subscriptionAuth';
import prisma from '../config/database';
import aiService from '../services/aiService';
import emailService from '../services/emailService';

const router = express.Router();

// Generate AI prompt
router.post('/generate-prompt', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'standard'),
  body('category').notEmpty().trim(),
  body('answers').isObject(),
  body('customization').isObject()
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

    const { category, answers, customization } = req.body;

    console.log('🚀 Generating prompt with AI service:', {
      category,
      provider: aiService.getProviderStatus(),
      configured: aiService.isConfigured()
    });

    // Generate the AI prompt using the AI service
    const result = await aiService.generatePrompt(category, answers, customization);

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
        prompt: result.content,
        category,
        generatedAt: new Date(),
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refine existing prompt
router.post('/refine-prompt', [
  authenticateWithSubscription,
  trackApiUsage,
  requireTokens(1, 'standard'),
  body('currentPrompt').notEmpty().trim(),
  body('refinementQuery').notEmpty().trim(),
  body('category').notEmpty().trim()
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

    const { currentPrompt, refinementQuery, category, originalAnswers } = req.body;

    console.log('🔧 Refining prompt with AI service:', {
      category,
      provider: aiService.getProviderStatus(),
      refinementQuery: refinementQuery.substring(0, 50) + '...'
    });

    // Refine the prompt using the AI service
    const result = await aiService.refinePrompt(currentPrompt, refinementQuery, category, originalAnswers);

    // Update user's generation count for refinements
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        generationsUsed: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: {
        refinedPrompt: result.content,
        refinementApplied: refinementQuery,
        timestamp: new Date(),
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Refine prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo refinement endpoint (no auth required)
router.post('/demo-refine', [
  body('currentPrompt').notEmpty().trim(),
  body('refinementQuery').notEmpty().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPrompt, refinementQuery, category = 'general' } = req.body;

    console.log('🔧 Demo refining prompt:', {
      category,
      refinementQuery: refinementQuery.substring(0, 50) + '...'
    });

    // For demo purposes, create a simple refinement simulation
    const refinementTemplates = {
      'more detailed': 'Added comprehensive details and step-by-step breakdowns',
      'specific': 'Enhanced with specific examples and targeted recommendations',
      'conversational': 'Adjusted tone to be more conversational and engaging',
      'professional': 'Refined for professional business context',
      'simple': 'Simplified language and reduced complexity',
      'examples': 'Added real-world examples and case studies',
      'roi': 'Enhanced with ROI calculations and business value metrics',
      'timeline': 'Added timeline, milestones, and implementation schedule'
    };

    // Determine which refinement to apply based on the query
    let refinementType = 'general enhancement';
    for (const [key, description] of Object.entries(refinementTemplates)) {
      if (refinementQuery.toLowerCase().includes(key)) {
        refinementType = description;
        break;
      }
    }

    // Create a refined version (demo simulation)
    const refinedPrompt = `${currentPrompt}\n\n## Enhanced Content (${refinementType}):\n\n${generateRefinementText(refinementQuery, category)}`;

    res.json({
      success: true,
      data: {
        refinedPrompt,
        refinementApplied: refinementQuery,
        timestamp: new Date(),
        usage: { type: 'demo', tokens: 0 }
      }
    });
  } catch (error) {
    console.error('Demo refine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function for demo refinement
function generateRefinementText(refinementQuery: string, category: string): string {
  const queryLower = refinementQuery.toLowerCase();

  if (queryLower.includes('detailed') || queryLower.includes('specific')) {
    return `Based on your request for more detailed information, here are the enhanced specifications:

• Detailed implementation steps with timelines
• Specific resource requirements and budget allocations
• Risk assessment and mitigation strategies
• Success metrics and key performance indicators
• Stakeholder communication plan
• Quality assurance and testing protocols`;
  }

  if (queryLower.includes('example') || queryLower.includes('case')) {
    return `Here are real-world examples and case studies:

**Case Study 1:** Similar implementation at TechCorp
- 40% efficiency improvement in 6 months
- ROI of 250% within first year
- Key success factors and lessons learned

**Case Study 2:** Best practices from industry leaders
- Proven methodologies and frameworks
- Common pitfalls and how to avoid them
- Scalability considerations for growth`;
  }

  if (queryLower.includes('roi') || queryLower.includes('business value')) {
    return `Business Value and ROI Analysis:

**Financial Impact:**
- Initial investment: $X
- Expected returns: $Y within Z months
- Break-even point: Month X
- 3-year projected value: $Z

**Operational Benefits:**
- Time savings: X hours per week
- Efficiency gains: Y% improvement
- Risk reduction: Z% decrease in errors
- Scalability potential: Up to X% growth capacity`;
  }

  if (queryLower.includes('timeline') || queryLower.includes('schedule')) {
    return `Implementation Timeline and Milestones:

**Phase 1 (Weeks 1-2): Planning & Preparation**
- Requirements gathering and analysis
- Team formation and resource allocation
- Risk assessment and mitigation planning

**Phase 2 (Weeks 3-6): Development & Testing**
- Core implementation and development
- Quality assurance and testing cycles
- User acceptance testing and feedback

**Phase 3 (Weeks 7-8): Deployment & Optimization**
- Production deployment and monitoring
- Performance optimization and fine-tuning
- Training and knowledge transfer`;
  }

  return `Enhanced content based on your refinement request:

• Improved clarity and structure
• Additional context and background information
• Enhanced actionability with specific next steps
• Better organization and flow
• More comprehensive coverage of key topics
• Practical implementation guidance`;
}

// Get generation stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        generationsUsed: true,
        generationsLimit: true
      }
    });

    const promptsCount = await prisma.prompt.count({
      where: { userId: req.user!.id }
    });

    const recentPrompts = await prisma.prompt.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true
      }
    });

    const categoryStats = await prisma.prompt.groupBy({
      by: ['category'],
      where: { userId: req.user!.id },
      _count: {
        category: true
      }
    });

    res.json({
      success: true,
      data: {
        generationsUsed: user?.generationsUsed || 0,
        generationsLimit: user?.generationsLimit || 100,
        totalPrompts: promptsCount,
        recentPrompts,
        categoryBreakdown: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category
        })),
        aiProvider: aiService.getProviderStatus(),
        aiConfigured: aiService.isConfigured()
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test email functionality
router.post('/test-email', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send test email
    const result = await emailService.sendTestEmail(user.email);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      emailSent: result,
      emailStatus: emailService.getStatus()
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

// System status endpoint
router.get('/system-status', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    const systemStatus = {
      timestamp: new Date().toISOString(),
      services: {
        ai: {
          provider: aiService.getProviderStatus(),
          configured: aiService.isConfigured(),
          status: 'operational'
        },
        email: {
          ...emailService.getStatus(),
          status: 'operational'
        },
        database: {
          status: 'operational',
          connected: true
        }
      },
      user: {
        id: user?.id,
        email: user?.email,
        tier: user?.tier,
        generationsUsed: user?.generationsUsed,
        generationsLimit: user?.generationsLimit
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      }
    };

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status'
    });
  }
});

export default router;