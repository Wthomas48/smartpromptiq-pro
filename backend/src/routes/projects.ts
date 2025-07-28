import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get all projects for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id };
    if (category) where.category = category;
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { generations: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.project.count({ where });

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new project
router.post('/', authenticate, [
  body('title').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
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

    const { title, description, category, settings } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        settings,
        userId: req.user!.id
      },
      include: {
        _count: {
          select: { generations: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        generations: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: { generations: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update project
router.put('/:id', authenticate, [
  body('title').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
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

    const { title, description, status, settings } = req.body;

    const project = await prisma.project.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        title,
        description,
        status,
        settings
      }
    });

    if (project.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (project.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
