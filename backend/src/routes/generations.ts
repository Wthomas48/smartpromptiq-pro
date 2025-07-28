import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Create new generation
router.post('/', authenticate, [
  body('projectId').notEmpty(),
  body('prompt').notEmpty().trim(),
  body('model').notEmpty().trim(),
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

    const { projectId, prompt, model, category, response, tokenCount, cost, metadata } = req.body;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Create generation and update user usage
    const [generation] = await prisma.$transaction([
      prisma.generation.create({
        data: {
          projectId,
          userId: req.user!.id,
          prompt,
          response: response || 'Processing...',
          model,
          category,
          tokenCount,
          cost,
          metadata
        }
      }),
      prisma.user.update({
        where: { id: req.user!.id },
        data: {
          generationsUsed: { increment: 1 }
        }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Generation created successfully',
      data: { generation }
    });
  } catch (error) {
    console.error('Create generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's generations
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, projectId, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id };
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;

    const generations = await prisma.generation.findMany({
      where,
      include: {
        project: {
          select: { title: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.generation.count({ where });

    res.json({
      success: true,
      data: {
        generations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single generation
router.get('/:id', authenticate, async (req, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        project: {
          select: { title: true, category: true }
        }
      }
    });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    res.json({
      success: true,
      data: { generation }
    });
  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Rate generation
router.patch('/:id/rate', authenticate, [
  body('rating').isInt({ min: 1, max: 5 })
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

    const { rating } = req.body;

    const generation = await prisma.generation.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        quality: rating
      }
    });

    if (generation.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    res.json({
      success: true,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    console.error('Rate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
