import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

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

export default router;