import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Submit custom category request
router.post('/request', authenticate, [
  body('categoryName').notEmpty().trim().withMessage('Category name is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('industryType').optional().trim(),
  body('useCase').optional().trim(),
  body('targetAudience').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('companyName').optional().trim(),
  body('phone').optional().trim()
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

    const {
      categoryName,
      description,
      email,
      industryType,
      useCase,
      targetAudience,
      priority = 'medium',
      companyName,
      phone
    } = req.body;

    const userId = req.user!.id;

    // Create custom category request
    const request = await prisma.customCategoryRequest.create({
      data: {
        categoryName,
        description,
        email,
        industryType: industryType || null,
        useCase: useCase || null,
        targetAudience: targetAudience || null,
        priority,
        companyName: companyName || null,
        phone: phone || null,
        userId,
        status: 'pending',
        submittedAt: new Date()
      }
    });

    // Send notification email (in production, you'd use a proper email service)
    console.log(`📧 Custom Category Request Submitted:
      ID: ${request.id}
      Category: ${categoryName}
      User: ${email}
      Industry: ${industryType}
      Priority: ${priority}
      Description: ${description}
    `);

    // Create internal notification for admins
    await prisma.notification.create({
      data: {
        type: 'custom_category_request',
        title: 'New Custom Category Request',
        message: `${companyName || 'A user'} has requested a new category: "${categoryName}" for ${industryType || 'their industry'}.`,
        data: JSON.stringify({
          requestId: request.id,
          categoryName,
          priority,
          email,
          companyName
        }),
        userId: null, // Admin notification
        isRead: false
      }
    }).catch(err => {
      // Notification creation is optional, don't fail the request
      console.log('Note: Could not create admin notification:', err.message);
    });

    res.status(201).json({
      success: true,
      data: {
        requestId: request.id,
        categoryName: request.categoryName,
        status: request.status,
        submittedAt: request.submittedAt,
        estimatedResponse: '24-48 hours'
      },
      message: 'Custom category request submitted successfully'
    });
  } catch (error) {
    console.error('Submit custom category request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's custom category requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 10 } = req.query;

    const whereClause: any = { userId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const requests = await prisma.customCategoryRequest.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        categoryName: true,
        description: true,
        industryType: true,
        priority: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        implementedAt: true,
        adminNotes: true
      }
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get custom category requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all custom category requests (admin only)
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { status, priority, industry, limit = 50 } = req.query;

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }
    if (industry && industry !== 'all') {
      whereClause.industryType = industry;
    }

    const requests = await prisma.customCategoryRequest.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { submittedAt: 'desc' }
      ],
      take: Number(limit),
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            subscriptionTier: true
          }
        }
      }
    });

    // Get statistics
    const stats = await prisma.customCategoryRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const priorityStats = await prisma.customCategoryRequest.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    });

    res.json({
      success: true,
      data: {
        requests: requests.map(req => ({
          ...req,
          userInfo: {
            name: req.user.firstName && req.user.lastName 
              ? `${req.user.firstName} ${req.user.lastName}`
              : req.user.email,
            email: req.user.email,
            tier: req.user.subscriptionTier
          }
        })),
        statistics: {
          statusBreakdown: stats.map(s => ({
            status: s.status,
            count: s._count.status
          })),
          priorityBreakdown: priorityStats.map(p => ({
            priority: p.priority,
            count: p._count.priority
          }))
        }
      }
    });
  } catch (error) {
    console.error('Get all custom category requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update custom category request status (admin only)
router.put('/admin/:id/status', authenticate, [
  body('status').isIn(['pending', 'reviewing', 'approved', 'in_development', 'completed', 'rejected']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
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

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const requestId = req.params.id;
    const { status, adminNotes } = req.body;
    const adminId = req.user!.id;

    // Update request
    const updateData: any = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'completed') {
      updateData.implementedAt = new Date();
    }

    const updatedRequest = await prisma.customCategoryRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create user notification about status change
    await prisma.notification.create({
      data: {
        type: 'custom_category_update',
        title: 'Custom Category Request Update',
        message: `Your custom category request "${updatedRequest.categoryName}" has been ${status}.`,
        data: JSON.stringify({
          requestId: updatedRequest.id,
          categoryName: updatedRequest.categoryName,
          status,
          adminNotes
        }),
        userId: updatedRequest.userId,
        isRead: false
      }
    }).catch(err => {
      console.log('Note: Could not create user notification:', err.message);
    });

    res.json({
      success: true,
      data: {
        id: updatedRequest.id,
        categoryName: updatedRequest.categoryName,
        status: updatedRequest.status,
        reviewedAt: updatedRequest.reviewedAt,
        adminNotes: updatedRequest.adminNotes
      },
      message: 'Request status updated successfully'
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get request statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // User's request stats
    const userStats = await prisma.customCategoryRequest.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    });

    const totalRequests = await prisma.customCategoryRequest.count({
      where: { userId }
    });

    // Recent requests
    const recentRequests = await prisma.customCategoryRequest.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        categoryName: true,
        status: true,
        submittedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        totalRequests,
        statusBreakdown: userStats.map(s => ({
          status: s.status,
          count: s._count.status
        })),
        recentRequests
      }
    });
  } catch (error) {
    console.error('Get request statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;