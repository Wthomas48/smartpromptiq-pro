import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import emailService from '../utils/emailService';

const router = express.Router();

// Get user's prompts
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.prompt.count({ where });

    res.json({
      success: true,
      data: {
        prompts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new prompt
router.post('/', authenticate, [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('category').notEmpty().trim()
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

    const { title, content, category, questionnaire, customization, isFavorite } = req.body;

    const prompt = await prisma.prompt.create({
      data: {
        title,
        content,
        category,
        questionnaire: questionnaire || {},
        customization: customization || {},
        isFavorite: isFavorite || false,
        userId: req.user!.id
      }
    });

    // Send prompt generation email notification (optional - don't block the response)
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      });

      if (user) {
        // Calculate basic prompt stats
        const wordCount = content.split(' ').length;
        const sections = content.split('\n## ').length - 1;
        const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

        await emailService.sendTemplateEmail(user.email, 'promptGenerated', {
          name: user.firstName || user.name || 'User',
          email: user.email,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          promptTitle: title,
          promptPreview: content.substring(0, 200),
          wordCount: wordCount,
          sections: Math.max(sections, 1),
          readTime: Math.max(readTime, 1),
          promptId: prompt.id
        });
        console.log(`📧 Prompt generation email sent to ${user.email}`);
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error('Failed to send prompt generation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: { prompt }
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single prompt
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prompt = await prisma.prompt.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      data: { prompt }
    });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update prompt
router.put('/:id', authenticate, [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('category').notEmpty().trim()
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

    const { title, content, category, questionnaire, customization, isFavorite } = req.body;

    const prompt = await prisma.prompt.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        title,
        content,
        category,
        questionnaire: questionnaire || {},
        customization: customization || {},
        isFavorite: isFavorite || false,
        updatedAt: new Date()
      }
    });

    if (prompt.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      message: 'Prompt updated successfully'
    });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete prompt
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const prompt = await prisma.prompt.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (prompt.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      message: 'Prompt deleted successfully'
    });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle favorite
router.patch('/:id/favorite', authenticate, async (req, res) => {
  try {
    const { isFavorite } = req.body;

    const prompt = await prisma.prompt.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        isFavorite: Boolean(isFavorite),
        updatedAt: new Date()
      }
    });

    if (prompt.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      message: 'Favorite status updated successfully'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get prompts statistics
    const totalPrompts = await prisma.prompt.count({
      where: { userId }
    });

    const favoritePrompts = await prisma.prompt.count({
      where: { userId, isFavorite: true }
    });

    const avgQuality = await prisma.prompt.aggregate({
      where: { userId },
      _avg: { quality: true }
    });

    // Get prompts from this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const promptsThisWeek = await prisma.prompt.count({
      where: {
        userId,
        createdAt: { gte: weekAgo }
      }
    });

    // Get total tokens used (if tracked)
    const totalTokensUsed = await prisma.prompt.aggregate({
      where: { userId },
      _sum: { tokensUsed: true }
    });

    // Get categories explored
    const categoriesExplored = await prisma.prompt.groupBy({
      by: ['category'],
      where: { userId },
      _count: { category: true }
    });

    res.json({
      success: true,
      data: {
        totalPrompts,
        favoritePrompts,
        avgQualityRating: avgQuality._avg.quality || 0,
        promptsThisWeek,
        totalTokensUsed: totalTokensUsed._sum.tokensUsed || 0,
        categoriesExplored: categoriesExplored.length
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

// Get user activity
router.get('/activity', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get recent prompts as activity
    const recentPrompts = await prisma.prompt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
        status: true
      }
    });

    // Transform to activity format
    const activities = recentPrompts.map(prompt => ({
      id: prompt.id,
      type: 'prompt_created',
      title: `Created "${prompt.title}"`,
      category: prompt.category,
      timestamp: prompt.createdAt,
      status: prompt.status
    }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity'
    });
  }
});

// Get user achievements (placeholder)
router.get('/achievements', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user stats for achievements
    const totalPrompts = await prisma.prompt.count({
      where: { userId }
    });

    const favoritePrompts = await prisma.prompt.count({
      where: { userId, isFavorite: true }
    });

    // Calculate achievements
    const achievements = [];

    if (totalPrompts >= 1) {
      achievements.push({
        id: 'first_prompt',
        title: 'First Steps',
        description: 'Created your first prompt',
        icon: '🚀',
        unlockedAt: new Date()
      });
    }

    if (totalPrompts >= 10) {
      achievements.push({
        id: 'prompt_master',
        title: 'Prompt Master',
        description: 'Created 10 prompts',
        icon: '🎯',
        unlockedAt: new Date()
      });
    }

    if (favoritePrompts >= 5) {
      achievements.push({
        id: 'curator',
        title: 'Curator',
        description: 'Favorited 5 prompts',
        icon: '⭐',
        unlockedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user achievements'
    });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get current prompt
    const prompt = await prisma.prompt.findFirst({
      where: { id, userId }
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Toggle favorite status
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: { isFavorite: !prompt.isFavorite }
    });

    res.json({
      success: true,
      data: {
        id: updatedPrompt.id,
        isFavorite: updatedPrompt.isFavorite
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite status'
    });
  }
});

export default router;