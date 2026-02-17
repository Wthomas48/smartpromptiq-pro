import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get user's teams
router.get('/', authenticate, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: req.user!.id }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        },
        _count: {
          select: { members: true, projects: true }
        }
      }
    });

    res.json({
      success: true,
      data: { teams }
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create team
router.post('/', authenticate, [
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape()
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

    const { name, description } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.user!.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add team member
router.post('/:teamId/members', authenticate, [
  body('email').isEmail().normalizeEmail()
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

    const { email } = req.body;
    const { teamId } = req.params;

    // Check if user has permission to add members
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: req.user!.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Find user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userToAdd.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Add member
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member: newMember }
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============================================
// TEAM ACTIVITY FEED (REST fallback)
// ============================================

router.get('/:teamId/activity', authenticate, async (req, res) => {
  try {
    const { teamId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Verify membership
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: req.user!.id },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const [activities, total] = await Promise.all([
      prisma.teamActivity.findMany({
        where: { teamId },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.teamActivity.count({ where: { teamId } }),
    ]);

    res.json({
      success: true,
      data: {
        activities: activities.map(a => ({
          id: a.id,
          action: a.action,
          targetType: a.targetType,
          targetId: a.targetId,
          targetName: a.targetName,
          createdAt: a.createdAt.toISOString(),
          user: {
            id: a.user.id,
            name: `${a.user.firstName} ${a.user.lastName}`.trim() || a.user.email,
            email: a.user.email,
          },
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get team activity error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================
// TEAM SHARED PROMPTS
// ============================================

// List prompts shared with this team
router.get('/:teamId/prompts', authenticate, async (req, res) => {
  try {
    const { teamId } = req.params;

    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: req.user!.id },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const prompts = await prisma.prompt.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        prompts: prompts.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          category: p.category,
          version: p.version,
          updatedAt: p.updatedAt.toISOString(),
          owner: {
            id: p.user.id,
            name: `${p.user.firstName} ${p.user.lastName}`.trim() || p.user.email,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Get team prompts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Share a prompt to a team
router.post('/:teamId/prompts/:promptId/share', authenticate, async (req, res) => {
  try {
    const { teamId, promptId } = req.params;

    // Verify team membership
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: req.user!.id },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    // Verify prompt ownership
    const prompt = await prisma.prompt.findFirst({
      where: { id: promptId, userId: req.user!.id },
    });
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found or not owned by you' });
    }

    // Share it
    const updated = await prisma.prompt.update({
      where: { id: promptId },
      data: { teamId },
    });

    res.json({
      success: true,
      message: 'Prompt shared with team',
      data: { promptId: updated.id, teamId: updated.teamId },
    });
  } catch (error) {
    console.error('Share prompt error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Unshare a prompt from a team
router.delete('/:teamId/prompts/:promptId/unshare', authenticate, async (req, res) => {
  try {
    const { teamId, promptId } = req.params;

    // Verify team membership (OWNER/ADMIN can unshare anyone's, MEMBER can only unshare own)
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: req.user!.id },
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const prompt = await prisma.prompt.findFirst({
      where: { id: promptId, teamId },
    });
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found in this team' });
    }

    // Only owner or team admin can unshare
    if (prompt.userId !== req.user!.id && !['OWNER', 'ADMIN'].includes(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    await prisma.prompt.update({
      where: { id: promptId },
      data: { teamId: null },
    });

    res.json({ success: true, message: 'Prompt unshared from team' });
  } catch (error) {
    console.error('Unshare prompt error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
