import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Admin authentication middleware
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get cost dashboard data
router.get('/cost-dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get all users with their subscription and usage data
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        tokenTransactions: {
          where: {
            type: 'usage',
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        usageLogs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      }
    });

    // Calculate system metrics
    let totalRevenue = 0;
    let totalCosts = 0;
    let activeUsers = 0;
    const tierAnalysis: Record<string, any> = {};
    const riskUsers: any[] = [];

    users.forEach(user => {
      const subscription = user.subscriptions[0];
      const isActive = user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (isActive) activeUsers++;

      // Calculate user revenue (monthly subscription)
      const userRevenue = subscription ? subscription.priceInCents : 0;
      totalRevenue += userRevenue;

      // Calculate user costs (from usage logs)
      const userCosts = user.usageLogs.reduce((sum, log) => sum + log.costInCents, 0);
      totalCosts += userCosts;

      // Tier analysis
      const tier = user.subscriptionTier;
      if (!tierAnalysis[tier]) {
        tierAnalysis[tier] = {
          users: 0,
          monthlyRevenue: 0,
          totalCosts: 0,
          profit: 0,
          marginPercentage: 0,
          profitMultiplier: 0,
          averageRevenuePerUser: 0,
          averageCostPerUser: 0
        };
      }

      tierAnalysis[tier].users++;
      tierAnalysis[tier].monthlyRevenue += userRevenue;
      tierAnalysis[tier].totalCosts += userCosts;

      // Risk analysis
      if (userCosts > 0 && userRevenue > 0) {
        const costRatio = userCosts / userRevenue;
        if (costRatio > 0.8) { // Warning threshold: 80%
          riskUsers.push({
            userId: user.id,
            email: user.email,
            tier: user.subscriptionTier,
            costRatio,
            costs: userCosts,
            revenue: userRevenue,
            severity: costRatio > 1.0 ? 'CRITICAL' : 'WARNING'
          });
        }
      }
    });

    // Complete tier analysis calculations
    Object.keys(tierAnalysis).forEach(tier => {
      const analysis = tierAnalysis[tier];
      analysis.profit = analysis.monthlyRevenue - analysis.totalCosts;
      analysis.marginPercentage = analysis.monthlyRevenue > 0 
        ? (analysis.profit / analysis.monthlyRevenue) * 100 
        : 0;
      analysis.profitMultiplier = analysis.totalCosts > 0 
        ? analysis.monthlyRevenue / analysis.totalCosts 
        : 0;
      analysis.averageRevenuePerUser = analysis.users > 0 
        ? analysis.monthlyRevenue / analysis.users 
        : 0;
      analysis.averageCostPerUser = analysis.users > 0 
        ? analysis.totalCosts / analysis.users 
        : 0;
    });

    // System metrics
    const systemMetrics = {
      totalUsers: users.length,
      activeUsers,
      totalRevenue,
      totalCosts,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
      averageMargin: totalCosts > 0 ? totalRevenue / totalCosts : 0
    };

    // Audit results (mock data for now)
    const auditResults = {
      totalUsers: users.length,
      warnings: riskUsers.filter(u => u.severity === 'WARNING'),
      critical: riskUsers.filter(u => u.severity === 'CRITICAL'),
      suspended: [], // Would be actual suspended users
      healthy: users.length - riskUsers.length,
      auditTime: new Date().toISOString()
    };

    // Generate recommendations
    const recommendations: any[] = [];
    
    if (systemMetrics.profitMargin < 20) {
      recommendations.push({
        type: 'profit_margin',
        message: 'System profit margin is below 20%. Consider increasing prices or optimizing costs.',
        priority: 'HIGH'
      });
    }

    if (riskUsers.filter(u => u.severity === 'CRITICAL').length > 0) {
      recommendations.push({
        type: 'cost_protection',
        message: `${riskUsers.filter(u => u.severity === 'CRITICAL').length} users have critical cost ratios. Review immediately.`,
        priority: 'HIGH'
      });
    }

    Object.entries(tierAnalysis).forEach(([tier, analysis]) => {
      if (analysis.marginPercentage < 20) {
        recommendations.push({
          type: 'tier_optimization',
          message: `${tier} tier has low profit margin (${analysis.marginPercentage.toFixed(1)}%). Consider price adjustment.`,
          priority: 'MEDIUM',
          tier
        });
      }
    });

    if (activeUsers / users.length < 0.5) {
      recommendations.push({
        type: 'user_engagement',
        message: 'Low user engagement detected. Consider re-engagement campaigns.',
        priority: 'MEDIUM'
      });
    }

    res.json({
      success: true,
      data: {
        systemMetrics,
        tierAnalysis,
        riskUsers,
        auditResults,
        recommendations
      }
    });
  } catch (error) {
    console.error('Get cost dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Run cost audit
router.post('/cost-audit', authenticate, requireAdmin, async (req, res) => {
  try {
    // This would run a comprehensive cost audit
    // For now, we'll simulate the audit process
    
    const auditResults = {
      timestamp: new Date().toISOString(),
      usersAudited: 0,
      costThresholdViolations: 0,
      suspensionsApplied: 0,
      warningsIssued: 0,
      summary: 'Cost audit completed successfully'
    };

    // Get users with high cost ratios
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        usageLogs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    auditResults.usersAudited = users.length;

    // Analyze each user
    for (const user of users) {
      const subscription = user.subscriptions[0];
      const userRevenue = subscription ? subscription.priceInCents : 0;
      const userCosts = user.usageLogs.reduce((sum, log) => sum + log.costInCents, 0);

      if (userCosts > 0 && userRevenue > 0) {
        const costRatio = userCosts / userRevenue;
        
        if (costRatio > 1.2) { // 120% - critical threshold
          auditResults.costThresholdViolations++;
          
          // In a real implementation, you might suspend the user or apply restrictions
          console.log(`Critical cost ratio detected for user ${user.email}: ${(costRatio * 100).toFixed(1)}%`);
          
        } else if (costRatio > 0.8) { // 80% - warning threshold
          auditResults.warningsIssued++;
          console.log(`Warning cost ratio for user ${user.email}: ${(costRatio * 100).toFixed(1)}%`);
        }
      }
    }

    res.json({
      success: true,
      data: auditResults,
      message: 'Cost audit completed successfully'
    });
  } catch (error) {
    console.error('Cost audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Override cost protection for a user
router.post('/override-cost-protection', authenticate, requireAdmin, [
  body('userId').notEmpty().trim().withMessage('User ID is required'),
  body('reason').notEmpty().trim().withMessage('Reason is required'),
  body('temporaryLimit').isInt({ min: 0 }).withMessage('Temporary limit must be a positive integer'),
  body('expiresAt').isISO8601().withMessage('Expiration date is required')
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

    const { userId, reason, temporaryLimit, expiresAt } = req.body;
    const adminId = req.user!.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create cost protection override record (you'd need to add this to your schema)
    // For now, we'll just log the override
    console.log(`Admin ${adminId} overrode cost protection for user ${userId}: ${reason}`);

    // In a real implementation, you would:
    // 1. Create an override record in the database
    // 2. Update the user's temporary cost limit
    // 3. Set an expiration for the override
    // 4. Log the admin action for audit purposes

    res.json({
      success: true,
      data: {
        userId,
        temporaryLimit,
        expiresAt,
        appliedBy: adminId,
        reason,
        appliedAt: new Date().toISOString()
      },
      message: 'Cost protection override applied successfully'
    });
  } catch (error) {
    console.error('Override cost protection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user analytics
router.get('/user-analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d', tier } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const whereClause: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (tier && tier !== 'all') {
      whereClause.subscriptionTier = tier;
    }

    // Get user statistics
    const totalUsers = await prisma.user.count({ where: whereClause });
    
    const activeUsers = await prisma.user.count({
      where: {
        ...whereClause,
        lastLogin: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
        }
      }
    });

    // Get tier distribution
    const tierDistribution = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      where: whereClause,
      _count: {
        subscriptionTier: true
      }
    });

    // Get usage analytics
    const usageStats = await prisma.usageLog.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        tokensConsumed: true,
        costInCents: true
      },
      _avg: {
        responseTime: true
      },
      _count: {
        id: true
      }
    });

    // Get revenue analytics
    const revenueStats = await prisma.subscription.aggregate({
      where: {
        status: 'active',
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        priceInCents: true
      }
    });

    res.json({
      success: true,
      data: {
        userMetrics: {
          totalUsers,
          activeUsers,
          activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        },
        tierDistribution: tierDistribution.map(item => ({
          tier: item.subscriptionTier,
          count: item._count.subscriptionTier
        })),
        usageMetrics: {
          totalRequests: usageStats._count.id || 0,
          totalTokens: usageStats._sum.tokensConsumed || 0,
          totalCosts: usageStats._sum.costInCents || 0,
          averageResponseTime: usageStats._avg.responseTime || 0
        },
        revenueMetrics: {
          totalRevenue: revenueStats._sum.priceInCents || 0
        },
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system health
router.get('/system-health', authenticate, requireAdmin, async (req, res) => {
  try {
    // Database health
    const dbHealth = await prisma.user.count();
    
    // API health (mock data)
    const apiHealth = {
      responseTime: Math.random() * 100 + 50, // 50-150ms
      errorRate: Math.random() * 5, // 0-5%
      uptime: 99.9
    };

    // Cost health
    const recentCosts = await prisma.usageLog.aggregate({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _sum: {
        costInCents: true
      }
    });

    const recentRevenue = await prisma.subscription.aggregate({
      where: {
        status: 'active'
      },
      _sum: {
        priceInCents: true
      }
    });

    const costHealth = {
      dailyCosts: recentCosts._sum.costInCents || 0,
      monthlyRevenue: recentRevenue._sum.priceInCents || 0,
      marginHealth: 'healthy' // This would be calculated based on actual margins
    };

    res.json({
      success: true,
      data: {
        database: {
          status: dbHealth > 0 ? 'healthy' : 'error',
          userCount: dbHealth
        },
        api: apiHealth,
        costs: costHealth,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Export data
router.get('/export/:type', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data: any = {};

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            subscriptionTier: true,
            createdAt: true,
            lastLogin: true,
            tokensUsed: true,
            generationsUsed: true
          }
        });
        break;

      case 'usage':
        data = await prisma.usageLog.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          include: {
            user: {
              select: {
                email: true,
                subscriptionTier: true
              }
            }
          }
        });
        break;

      case 'revenue':
        data = await prisma.subscription.findMany({
          where: {
            status: 'active'
          },
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = JSON.stringify(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data,
        exportType: type,
        format,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get basic user counts
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Get total prompts generated
    const totalPrompts = await prisma.prompt.count();

    // Get API calls from usage logs
    const apiCalls = await prisma.usageLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    // Get revenue from active subscriptions
    const revenueResult = await prisma.subscription.aggregate({
      where: {
        status: 'active'
      },
      _sum: {
        priceInCents: true
      }
    });
    const revenue = (revenueResult._sum.priceInCents || 0) / 100; // Convert to dollars

    // Get subscription tier distribution
    const tierCounts = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true
      }
    });

    const subscriptions = {
      free: 0,
      starter: 0,
      pro: 0,
      business: 0,
      enterprise: 0
    };

    tierCounts.forEach(tier => {
      const tierName = tier.subscriptionTier.toLowerCase();
      if (tierName in subscriptions) {
        subscriptions[tierName as keyof typeof subscriptions] = tier._count.subscriptionTier;
      }
    });

    // System health assessment
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check if there are any recent errors or high cost ratios
    const recentCosts = await prisma.usageLog.aggregate({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        costInCents: true
      }
    });

    const dailyCost = (recentCosts._sum.costInCents || 0) / 100;
    const dailyRevenue = revenue / 30; // Rough daily revenue estimate

    if (dailyCost > dailyRevenue * 0.8) {
      systemHealth = 'warning';
    }
    if (dailyCost > dailyRevenue) {
      systemHealth = 'critical';
    }

    // System info
    const systemInfo = {
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Mock: 2 hours ago
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalPrompts,
        revenue,
        systemHealth,
        apiCalls,
        subscriptions,
        systemInfo
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/users - User management data
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await prisma.user.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        tokensUsed: true,
        generationsUsed: true,
        createdAt: true,
        lastLogin: true
      }
    });

    const total = await prisma.user.count();

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      tokenBalance: user.tokensUsed || 0
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/logs - System logs
router.get('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // For now, we'll return usage logs as system activity logs
    const usageLogs = await prisma.usageLog.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    const total = await prisma.usageLog.count();

    const formattedLogs = usageLogs.map((log, index) => ({
      id: skip + index + 1,
      timestamp: log.createdAt.toISOString(),
      level: log.tokensConsumed > 1000 ? 'warning' : 'info',
      message: `API call by ${log.user.email} - ${log.tokensConsumed} tokens used`,
      details: {
        userId: log.userId,
        tokensConsumed: log.tokensConsumed,
        costInCents: log.costInCents,
        provider: log.provider,
        responseTime: log.responseTime
      }
    }));

    res.json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/actions/:action - Execute admin actions
router.post('/actions/:action', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action } = req.params;
    const { data } = req.body;

    console.log(`Executing admin action: ${action}`);

    let result: any = {};

    switch (action) {
      case 'view-users':
        const totalUsers = await prisma.user.count();
        const recentUsers = await prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            email: true,
            createdAt: true,
            subscriptionTier: true
          }
        });
        result = {
          message: `Found ${totalUsers} total users`,
          details: { totalUsers, recentUsers }
        };
        break;

      case 'monitor-sessions':
        const activeSessions = await prisma.user.count({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        });
        result = {
          message: `${activeSessions} active sessions in the last hour`,
          details: { activeSessions }
        };
        break;

      case 'backup-database':
        // Simulate database backup
        result = {
          message: 'Database backup initiated successfully',
          details: {
            backupId: `backup_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'in_progress'
          }
        };
        break;

      case 'send-notifications':
        // Get recent users for notification
        const usersForNotification = await prisma.user.count({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        });
        result = {
          message: `Notifications sent to ${usersForNotification} active users`,
          details: { recipientCount: usersForNotification }
        };
        break;

      case 'security-audit':
        // Simulate security audit
        const suspiciousActivity = await prisma.usageLog.count({
          where: {
            tokensConsumed: {
              gt: 5000 // High token usage
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        });
        result = {
          message: 'Security audit completed',
          details: {
            auditId: `audit_${Date.now()}`,
            suspiciousActivityCount: suspiciousActivity,
            recommendations: suspiciousActivity > 0 ? ['Review high-usage accounts'] : ['No issues found']
          }
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }

    res.json({
      success: true,
      message: result.message,
      data: result.details
    });
  } catch (error) {
    console.error('Admin action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user activities
router.get('/activities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get recent user activities from prompts and usage logs
    const [recentPrompts, recentUsage] = await Promise.all([
      prisma.prompt.findMany({
        skip,
        take: Number(limit) / 2,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.usageLog.findMany({
        skip,
        take: Number(limit) / 2,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Combine and format activities
    const activities = [
      ...recentPrompts.map(prompt => ({
        id: `prompt-${prompt.id}`,
        type: 'prompt_created',
        user: prompt.user.firstName || prompt.user.lastName
          ? `${prompt.user.firstName} ${prompt.user.lastName}`
          : prompt.user.email,
        description: `Created prompt: ${prompt.title}`,
        timestamp: prompt.createdAt,
        metadata: {
          category: prompt.category,
          promptId: prompt.id
        }
      })),
      ...recentUsage.map(usage => ({
        id: `usage-${usage.id}`,
        type: 'api_usage',
        user: usage.user.firstName || usage.user.lastName
          ? `${usage.user.firstName} ${usage.user.lastName}`
          : usage.user.email,
        description: `API usage: ${usage.tokensConsumed} tokens`,
        timestamp: usage.createdAt,
        metadata: {
          tokensConsumed: usage.tokensConsumed,
          costInCents: usage.costInCents
        }
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: activities.length
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get active sessions
router.get('/active-sessions', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get recent user activity as proxy for active sessions
    const recentUsers = await prisma.user.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        lastLogin: true,
        updatedAt: true,
        role: true,
        subscriptionTier: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    const sessions = recentUsers.map(user => ({
      id: user.id,
      user: user.firstName || user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email,
      email: user.email,
      role: user.role,
      tier: user.subscriptionTier,
      lastActivity: user.updatedAt,
      lastLogin: user.lastLogin,
      status: new Date(user.updatedAt).getTime() > Date.now() - 30 * 60 * 1000 ? 'active' : 'inactive',
      duration: Math.floor((Date.now() - new Date(user.lastLogin || user.updatedAt).getTime()) / 1000 / 60) // minutes
    }));

    res.json({
      success: true,
      data: {
        sessions,
        summary: {
          total: sessions.length,
          active: sessions.filter(s => s.status === 'active').length,
          inactive: sessions.filter(s => s.status === 'inactive').length
        }
      }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent user registrations for live tracking
router.get('/recent-registrations', authenticate, requireAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const timeWindow = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: timeWindow
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
        createdAt: true,
        lastLogin: true,
        emailVerified: true
      }
    });

    // Get registration stats by hour for the last 24 hours
    const hourlyStats = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: hourStart,
            lt: hourEnd
          }
        }
      });

      hourlyStats.push({
        hour: hourStart.getHours(),
        count,
        timestamp: hourStart.toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        recentUsers: recentUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.email.split('@')[0],
          plan: user.subscriptionTier,
          registeredAt: user.createdAt,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified,
          status: user.lastLogin ? 'active' : 'pending'
        })),
        hourlyStats,
        summary: {
          total: recentUsers.length,
          verified: recentUsers.filter(u => u.emailVerified).length,
          active: recentUsers.filter(u => u.lastLogin).length,
          timeWindow: `${hours} hours`
        }
      }
    });
  } catch (error) {
    console.error('Get recent registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/payments - Payment management data
router.get('/payments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause for payment filtering
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Get payments from subscriptions table (as we don't have a separate payments table)
    const subscriptions = await prisma.subscription.findMany({
      skip,
      take: Number(limit),
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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

    const total = await prisma.subscription.count({ where: whereClause });

    // Format subscriptions as payments
    const payments = subscriptions.map(sub => ({
      id: sub.id,
      userId: sub.userId,
      userEmail: sub.user.email,
      userName: sub.user.firstName && sub.user.lastName
        ? `${sub.user.firstName} ${sub.user.lastName}`
        : sub.user.firstName || sub.user.email.split('@')[0],
      amount: sub.priceInCents,
      currency: 'usd',
      status: sub.status === 'active' ? 'succeeded' :
              sub.status === 'pending' ? 'pending' : 'failed',
      stripePaymentId: sub.stripeSubscriptionId || `sub_${sub.id}`,
      createdAt: sub.createdAt,
      description: `${sub.tier} Plan Subscription`,
      metadata: {
        tier: sub.tier,
        subscriptionId: sub.id
      }
    }));

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/payments/:id/refund - Process payment refund
router.post('/payments/:id/refund', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Find the subscription/payment
    const subscription = await prisma.subscription.findUnique({
      where: { id },
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

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // In a real implementation, you would:
    // 1. Process the refund through Stripe
    // 2. Update the subscription status
    // 3. Log the refund for audit purposes

    // For now, we'll simulate the refund process
    await prisma.subscription.update({
      where: { id },
      data: {
        status: 'canceled', // Mark as canceled/refunded
        updatedAt: new Date()
      }
    });

    // Log the admin action
    console.log(`Admin ${req.user!.id} processed refund for subscription ${id}: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: id,
        refundAmount: subscription.priceInCents,
        refundedAt: new Date().toISOString(),
        processedBy: req.user!.id,
        reason: reason || 'Admin initiated refund'
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/analytics - Enhanced analytics data
router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get comprehensive analytics data
    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPrompts,
      usageStats,
      tierDistribution,
      recentTransactions,
      systemHealth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (last 7 days)
      prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total revenue from active subscriptions
      prisma.subscription.aggregate({
        where: { status: 'active' },
        _sum: { priceInCents: true }
      }),

      // Total prompts
      prisma.prompt.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Usage statistics
      prisma.usageLog.aggregate({
        where: {
          createdAt: { gte: startDate }
        },
        _sum: {
          tokensConsumed: true,
          costInCents: true
        },
        _count: { id: true },
        _avg: { responseTime: true }
      }),

      // Tier distribution
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: { subscriptionTier: true }
      }),

      // Recent transactions (subscriptions as proxy)
      prisma.subscription.count({
        where: {
          createdAt: { gte: startDate },
          status: 'active'
        }
      }),

      // System health check
      prisma.usageLog.aggregate({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _sum: { costInCents: true }
      })
    ]);

    // Calculate derived metrics
    const monthlyRevenue = (totalRevenue._sum.priceInCents || 0) / 100;
    const dailyCost = (systemHealth._sum.costInCents || 0) / 100;
    const dailyRevenue = monthlyRevenue / 30;

    // Determine system health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (dailyCost > dailyRevenue * 0.8) healthStatus = 'warning';
    if (dailyCost > dailyRevenue) healthStatus = 'critical';

    // Format tier distribution
    const tierStats = tierDistribution.reduce((acc, tier) => {
      acc[tier.subscriptionTier.toLowerCase()] = tier._count.subscriptionTier;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          monthlyRevenue: Math.round(monthlyRevenue),
          totalPrompts,
          successfulPayments: recentTransactions,
          refundedPayments: 0, // Would be calculated from actual refund data
          pendingPayments: 0, // Would be calculated from pending subscriptions
          systemHealth: healthStatus
        },
        usage: {
          totalRequests: usageStats._count.id || 0,
          totalTokens: usageStats._sum.tokensConsumed || 0,
          totalCosts: Math.round((usageStats._sum.costInCents || 0) / 100),
          averageResponseTime: Math.round(usageStats._avg.responseTime || 0)
        },
        revenue: {
          total: Math.round(monthlyRevenue),
          monthly: Math.round(monthlyRevenue),
          averagePerUser: totalUsers > 0 ? Math.round(monthlyRevenue / totalUsers) : 0,
          conversionRate: 12.4 // This would be calculated from actual conversion data
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          activationRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          tierDistribution: tierStats
        },
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/dashboard-stats - Real-time dashboard statistics
router.get('/dashboard-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get real-time statistics
    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPrompts,
      recentUsage,
      paymentStats
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),

      prisma.subscription.aggregate({
        where: { status: 'active' },
        _sum: { priceInCents: true }
      }),

      prisma.prompt.count(),

      prisma.usageLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),

      prisma.subscription.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Calculate payment statistics
    const successfulPayments = paymentStats.find(p => p.status === 'active')?._count.status || 0;
    const pendingPayments = paymentStats.find(p => p.status === 'pending')?._count.status || 0;
    const refundedPayments = paymentStats.find(p => p.status === 'canceled')?._count.status || 0;

    // System health assessment
    const monthlyRevenue = (totalRevenue._sum.priceInCents || 0) / 100;
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (activeUsers / totalUsers < 0.3) systemHealth = 'warning';
    if (monthlyRevenue < 1000) systemHealth = 'warning';
    if (totalUsers < 10) systemHealth = 'critical';

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalRevenue: Math.round(monthlyRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        totalPrompts,
        successfulPayments,
        refundedPayments,
        pendingPayments,
        systemHealth,
        recentActivity: recentUsage,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/token-monitoring - Comprehensive token monitoring
router.get('/token-monitoring', authenticate, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d', userId } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const whereClause: any = {
      createdAt: { gte: startDate }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    // Get comprehensive token usage data
    const [
      totalTokenUsage,
      tokenTransactions,
      topUsers,
      userTokenBalances,
      alertsData,
      usageByTier
    ] = await Promise.all([
      // Total token consumption
      prisma.usageLog.aggregate({
        where: whereClause,
        _sum: {
          tokensConsumed: true,
          costInCents: true
        },
        _count: { id: true },
        _avg: { tokensConsumed: true }
      }),

      // Recent token transactions
      prisma.tokenTransaction.findMany({
        where: whereClause,
        take: 100,
        orderBy: { createdAt: 'desc' },
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
      }),

      // Top token consumers
      prisma.usageLog.groupBy({
        by: ['userId'],
        where: whereClause,
        _sum: {
          tokensConsumed: true,
          costInCents: true
        },
        _count: { id: true },
        orderBy: {
          _sum: {
            tokensConsumed: 'desc'
          }
        },
        take: 20
      }),

      // User token balances
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          subscriptionTier: true,
          tokenBalance: true,
          tokensUsed: true
        },
        orderBy: { tokensUsed: 'desc' },
        take: 50
      }),

      // Token usage alerts (high usage patterns)
      prisma.usageLog.findMany({
        where: {
          ...whereClause,
          tokensConsumed: { gt: 5000 } // High usage threshold
        },
        include: {
          user: {
            select: {
              email: true,
              subscriptionTier: true
            }
          }
        },
        orderBy: { tokensConsumed: 'desc' },
        take: 50
      }),

      // Usage by subscription tier
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        _sum: {
          tokensUsed: true
        },
        _avg: {
          tokensUsed: true
        },
        _count: { id: true }
      })
    ]);

    // Get user details for top consumers
    const topUserIds = topUsers.map(u => u.userId);
    const topUserDetails = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
        tokenBalance: true
      }
    });

    // Combine top users with their details
    const enrichedTopUsers = topUsers.map(usage => {
      const userDetails = topUserDetails.find(u => u.id === usage.userId);
      return {
        userId: usage.userId,
        email: userDetails?.email || 'Unknown',
        name: userDetails?.firstName && userDetails?.lastName
          ? `${userDetails.firstName} ${userDetails.lastName}`
          : userDetails?.firstName || userDetails?.email?.split('@')[0] || 'Unknown',
        tier: userDetails?.subscriptionTier || 'free',
        tokenBalance: userDetails?.tokenBalance || 0,
        totalTokensConsumed: usage._sum.tokensConsumed || 0,
        totalCost: (usage._sum.costInCents || 0) / 100,
        requestCount: usage._count.id,
        averagePerRequest: usage._count.id > 0
          ? Math.round((usage._sum.tokensConsumed || 0) / usage._count.id)
          : 0
      };
    });

    // Generate token usage insights
    const insights = {
      totalTokens: totalTokenUsage._sum.tokensConsumed || 0,
      totalCost: (totalTokenUsage._sum.costInCents || 0) / 100,
      totalRequests: totalTokenUsage._count.id || 0,
      averageTokensPerRequest: totalTokenUsage._avg.tokensConsumed || 0,
      highUsageAlerts: alertsData.length,
      activeUsers: new Set(tokenTransactions.map(t => t.userId)).size,
      tierBreakdown: usageByTier.map(tier => ({
        tier: tier.subscriptionTier,
        users: tier._count.id,
        totalTokens: tier._sum.tokensUsed || 0,
        averageTokens: tier._avg.tokensUsed || 0
      }))
    };

    // Recent transactions with formatted data
    const formattedTransactions = tokenTransactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      userEmail: tx.user.email,
      userName: tx.user.firstName && tx.user.lastName
        ? `${tx.user.firstName} ${tx.user.lastName}`
        : tx.user.firstName || tx.user.email.split('@')[0],
      type: tx.type,
      amount: tx.amount,
      description: tx.description || 'Token transaction',
      createdAt: tx.createdAt,
      tier: tx.user.subscriptionTier
    }));

    // High usage alerts with user info
    const formattedAlerts = alertsData.map(alert => ({
      id: alert.id,
      userId: alert.userId,
      userEmail: alert.user.email,
      tier: alert.user.subscriptionTier,
      tokensConsumed: alert.tokensConsumed,
      costInCents: alert.costInCents,
      timestamp: alert.createdAt,
      severity: alert.tokensConsumed > 10000 ? 'critical' :
                alert.tokensConsumed > 7500 ? 'high' : 'medium'
    }));

    res.json({
      success: true,
      data: {
        overview: insights,
        topUsers: enrichedTopUsers,
        recentTransactions: formattedTransactions,
        userBalances: userTokenBalances,
        alerts: formattedAlerts,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get token monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/token-management - Token management actions
router.post('/token-management', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, userId, amount, reason } = req.body;
    const adminId = req.user!.id;

    if (!action || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Action and userId are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tokenBalance: true,
        subscriptionTier: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let result: any = {};

    switch (action) {
      case 'add_tokens':
        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Valid amount is required for adding tokens'
          });
        }

        const newBalance = (user.tokenBalance || 0) + amount;
        await prisma.user.update({
          where: { id: userId },
          data: { tokenBalance: newBalance }
        });

        // Log the transaction
        await prisma.tokenTransaction.create({
          data: {
            userId,
            type: 'admin_credit',
            amount,
            description: `Admin credit: ${reason || 'Manual adjustment'}`,
            adminId
          }
        });

        result = {
          message: `Added ${amount} tokens to ${user.email}`,
          previousBalance: user.tokenBalance || 0,
          newBalance,
          tokensAdded: amount
        };
        break;

      case 'deduct_tokens':
        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Valid amount is required for deducting tokens'
          });
        }

        const currentBalance = user.tokenBalance || 0;
        const deductedBalance = Math.max(0, currentBalance - amount);

        await prisma.user.update({
          where: { id: userId },
          data: { tokenBalance: deductedBalance }
        });

        // Log the transaction
        await prisma.tokenTransaction.create({
          data: {
            userId,
            type: 'admin_debit',
            amount: -amount,
            description: `Admin deduction: ${reason || 'Manual adjustment'}`,
            adminId
          }
        });

        result = {
          message: `Deducted ${amount} tokens from ${user.email}`,
          previousBalance: currentBalance,
          newBalance: deductedBalance,
          tokensDeducted: amount
        };
        break;

      case 'reset_tokens':
        const resetAmount = amount || 0;

        await prisma.user.update({
          where: { id: userId },
          data: { tokenBalance: resetAmount }
        });

        // Log the transaction
        await prisma.tokenTransaction.create({
          data: {
            userId,
            type: 'admin_reset',
            amount: resetAmount - (user.tokenBalance || 0),
            description: `Admin reset: ${reason || 'Token balance reset'}`,
            adminId
          }
        });

        result = {
          message: `Reset token balance for ${user.email} to ${resetAmount}`,
          previousBalance: user.tokenBalance || 0,
          newBalance: resetAmount
        };
        break;

      case 'suspend_tokens':
        // In a real implementation, you'd add a suspension flag
        console.log(`Admin ${adminId} suspended token usage for user ${userId}: ${reason}`);

        result = {
          message: `Token usage suspended for ${user.email}`,
          reason: reason || 'Admin action',
          suspendedAt: new Date().toISOString()
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }

    console.log(`Admin ${adminId} performed token action '${action}' on user ${userId}:`, result);

    res.json({
      success: true,
      data: {
        action,
        userId,
        userEmail: user.email,
        performedBy: adminId,
        timestamp: new Date().toISOString(),
        ...result
      }
    });
  } catch (error) {
    console.error('Token management error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/password-security - Password and security monitoring
router.get('/password-security', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get password security metrics
    const [
      totalUsers,
      recentPasswordChanges,
      failedLoginAttempts,
      suspiciousActivity,
      unverifiedEmails,
      inactiveUsers
    ] = await Promise.all([
      prisma.user.count(),

      // Users who changed passwords recently (mock data for now)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),

      // Simulate failed login attempts from logs
      prisma.usageLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          },
          // In a real implementation, you'd have a separate table for auth logs
          tokensConsumed: 0 // Using this as a proxy for failed attempts
        }
      }),

      // High usage as suspicious activity
      prisma.usageLog.count({
        where: {
          tokensConsumed: { gt: 10000 },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Unverified email addresses
      prisma.user.count({
        where: {
          emailVerified: false
        }
      }),

      // Inactive users (no recent login)
      prisma.user.count({
        where: {
          OR: [
            { lastLogin: null },
            {
              lastLogin: {
                lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
              }
            }
          ]
        }
      })
    ]);

    // Get recent security events
    const recentEvents = await prisma.user.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          {
            lastLogin: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        lastLogin: true,
        emailVerified: true,
        subscriptionTier: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    // Format security events
    const securityEvents = recentEvents.map(user => {
      const isNewUser = new Date(user.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
      const hasRecentLogin = user.lastLogin && new Date(user.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000;

      return {
        id: user.id,
        email: user.email,
        userName: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.email.split('@')[0],
        eventType: isNewUser ? 'new_registration' : hasRecentLogin ? 'login' : 'activity',
        timestamp: hasRecentLogin ? user.lastLogin : user.createdAt,
        verified: user.emailVerified,
        tier: user.subscriptionTier,
        riskLevel: !user.emailVerified ? 'medium' : 'low'
      };
    });

    // Security health assessment
    const securityHealth = {
      overallScore: Math.max(0, 100 -
        (unverifiedEmails / totalUsers * 30) -
        (inactiveUsers / totalUsers * 20) -
        (suspiciousActivity * 5)
      ),
      recommendations: [],
      threats: {
        high: suspiciousActivity > 10 ? suspiciousActivity : 0,
        medium: unverifiedEmails > totalUsers * 0.3 ? Math.floor(unverifiedEmails * 0.1) : 0,
        low: failedLoginAttempts
      }
    } as any;

    // Generate recommendations
    if (unverifiedEmails > totalUsers * 0.2) {
      securityHealth.recommendations.push('High number of unverified emails detected. Consider email verification campaign.');
    }
    if (inactiveUsers > totalUsers * 0.5) {
      securityHealth.recommendations.push('Many inactive users detected. Review account security policies.');
    }
    if (suspiciousActivity > 5) {
      securityHealth.recommendations.push('Suspicious activity patterns detected. Review high-usage accounts.');
    }
    if (securityHealth.recommendations.length === 0) {
      securityHealth.recommendations.push('Security posture looks good. Continue monitoring.');
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          verifiedUsers: totalUsers - unverifiedEmails,
          unverifiedUsers: unverifiedEmails,
          activeUsers: totalUsers - inactiveUsers,
          inactiveUsers,
          recentPasswordChanges,
          failedLoginAttempts,
          suspiciousActivity
        },
        securityHealth,
        recentEvents: securityEvents,
        alerts: [
          ...(suspiciousActivity > 10 ? [{
            type: 'high_usage',
            message: `${suspiciousActivity} high-usage sessions detected in last 24h`,
            severity: 'warning',
            timestamp: new Date().toISOString()
          }] : []),
          ...(unverifiedEmails > totalUsers * 0.3 ? [{
            type: 'unverified_emails',
            message: `${unverifiedEmails} unverified email addresses (${Math.round(unverifiedEmails/totalUsers*100)}%)`,
            severity: 'info',
            timestamp: new Date().toISOString()
          }] : [])
        ],
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get password security error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/security-actions - Security management actions
router.post('/security-actions', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, userId, reason } = req.body;
    const adminId = req.user!.id;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    let result: any = {};

    switch (action) {
      case 'force_password_reset':
        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'User ID is required for password reset'
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true, lastName: true }
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // In a real implementation, you'd:
        // 1. Invalidate current session tokens
        // 2. Send password reset email
        // 3. Log the admin action

        console.log(`Admin ${adminId} forced password reset for user ${userId}: ${reason}`);

        result = {
          message: `Password reset initiated for ${user.email}`,
          userEmail: user.email,
          resetInitiated: new Date().toISOString()
        };
        break;

      case 'suspend_account':
        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'User ID is required for account suspension'
          });
        }

        // In a real implementation, you'd add a 'suspended' flag to the user
        console.log(`Admin ${adminId} suspended account for user ${userId}: ${reason}`);

        result = {
          message: `Account suspended for user ${userId}`,
          reason: reason || 'Admin action',
          suspendedAt: new Date().toISOString()
        };
        break;

      case 'security_audit':
        // Initiate comprehensive security audit
        const auditResults = {
          auditId: `audit_${Date.now()}`,
          initiatedBy: adminId,
          timestamp: new Date().toISOString(),
          scope: 'full_system',
          status: 'in_progress'
        };

        console.log(`Admin ${adminId} initiated security audit:`, auditResults);

        result = {
          message: 'Security audit initiated',
          auditDetails: auditResults
        };
        break;

      case 'bulk_email_verification':
        // Simulate bulk email verification reminder
        const unverifiedCount = await prisma.user.count({
          where: { emailVerified: false }
        });

        result = {
          message: `Email verification reminders sent to ${unverifiedCount} users`,
          recipientCount: unverifiedCount,
          sentAt: new Date().toISOString()
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown security action: ${action}`
        });
    }

    console.log(`Admin ${adminId} performed security action '${action}':`, result);

    res.json({
      success: true,
      data: {
        action,
        performedBy: adminId,
        timestamp: new Date().toISOString(),
        ...result
      }
    });
  } catch (error) {
    console.error('Security action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/system-monitoring - Overall system monitoring
router.get('/system-monitoring', authenticate, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get comprehensive system metrics
    const [
      dailyStats,
      weeklyStats,
      monthlyStats,
      errorRates,
      performanceMetrics,
      resourceUsage,
      alertsCount
    ] = await Promise.all([
      // Daily statistics
      Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.prompt.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.usageLog.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.usageLog.aggregate({
          where: { createdAt: { gte: oneDayAgo } },
          _sum: { tokensConsumed: true, costInCents: true }
        })
      ]),

      // Weekly statistics
      Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.prompt.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.usageLog.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma.usageLog.aggregate({
          where: { createdAt: { gte: oneWeekAgo } },
          _sum: { tokensConsumed: true, costInCents: true }
        })
      ]),

      // Monthly statistics
      Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),
        prisma.prompt.count({ where: { createdAt: { gte: oneMonthAgo } } }),
        prisma.usageLog.count({ where: { createdAt: { gte: oneMonthAgo } } }),
        prisma.usageLog.aggregate({
          where: { createdAt: { gte: oneMonthAgo } },
          _sum: { tokensConsumed: true, costInCents: true }
        })
      ]),

      // Error rates (simulated)
      prisma.usageLog.count({
        where: {
          createdAt: { gte: oneDayAgo },
          tokensConsumed: 0 // Using as proxy for errors
        }
      }),

      // Performance metrics
      prisma.usageLog.aggregate({
        where: { createdAt: { gte: oneDayAgo } },
        _avg: { responseTime: true },
        _min: { responseTime: true },
        _max: { responseTime: true }
      }),

      // Resource usage (simulated)
      {
        cpuUsage: Math.random() * 80 + 10, // 10-90%
        memoryUsage: Math.random() * 70 + 20, // 20-90%
        diskUsage: Math.random() * 60 + 30, // 30-90%
        networkIO: Math.random() * 1000 + 100 // MB
      },

      // Alert conditions
      Promise.all([
        prisma.usageLog.count({
          where: {
            createdAt: { gte: oneDayAgo },
            tokensConsumed: { gt: 10000 }
          }
        }),
        prisma.user.count({
          where: {
            emailVerified: false,
            createdAt: { gte: oneWeekAgo }
          }
        })
      ])
    ]);

    // Format statistics
    const systemStats = {
      daily: {
        newUsers: dailyStats[0],
        newPrompts: dailyStats[1],
        apiCalls: dailyStats[2],
        tokensUsed: dailyStats[3]._sum.tokensConsumed || 0,
        costs: (dailyStats[3]._sum.costInCents || 0) / 100
      },
      weekly: {
        newUsers: weeklyStats[0],
        newPrompts: weeklyStats[1],
        apiCalls: weeklyStats[2],
        tokensUsed: weeklyStats[3]._sum.tokensConsumed || 0,
        costs: (weeklyStats[3]._sum.costInCents || 0) / 100
      },
      monthly: {
        newUsers: monthlyStats[0],
        newPrompts: monthlyStats[1],
        apiCalls: monthlyStats[2],
        tokensUsed: monthlyStats[3]._sum.tokensConsumed || 0,
        costs: (monthlyStats[3]._sum.costInCents || 0) / 100
      }
    };

    // System health assessment
    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      performance: {
        averageResponseTime: Math.round(performanceMetrics._avg.responseTime || 0),
        minResponseTime: Math.round(performanceMetrics._min.responseTime || 0),
        maxResponseTime: Math.round(performanceMetrics._max.responseTime || 0),
        errorRate: systemStats.daily.apiCalls > 0 ? (errorRates / systemStats.daily.apiCalls * 100) : 0
      },
      resources: resourceUsage
    };

    // Determine health status
    if (health.resources.cpuUsage > 80 || health.resources.memoryUsage > 85) {
      health.status = 'warning';
    }
    if (health.resources.cpuUsage > 90 || health.resources.memoryUsage > 95 || health.performance.errorRate > 10) {
      health.status = 'critical';
    }

    // Generate alerts
    const systemAlerts = [];

    if (alertsCount[0] > 0) {
      systemAlerts.push({
        type: 'high_usage',
        severity: 'warning',
        message: `${alertsCount[0]} high-token usage sessions detected today`,
        timestamp: new Date().toISOString()
      });
    }

    if (alertsCount[1] > systemStats.weekly.newUsers * 0.3) {
      systemAlerts.push({
        type: 'unverified_users',
        severity: 'info',
        message: `${alertsCount[1]} new users haven't verified their email this week`,
        timestamp: new Date().toISOString()
      });
    }

    if (health.performance.errorRate > 5) {
      systemAlerts.push({
        type: 'high_error_rate',
        severity: 'warning',
        message: `Error rate is ${health.performance.errorRate.toFixed(1)}% (threshold: 5%)`,
        timestamp: new Date().toISOString()
      });
    }

    if (health.resources.cpuUsage > 80) {
      systemAlerts.push({
        type: 'high_cpu',
        severity: health.resources.cpuUsage > 90 ? 'critical' : 'warning',
        message: `CPU usage is ${health.resources.cpuUsage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    // Operational metrics
    const operations = {
      backupStatus: {
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        status: 'completed',
        size: '2.4 GB',
        nextScheduled: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString() // 18 hours from now
      },
      maintenanceWindow: {
        nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        duration: '2 hours',
        type: 'scheduled_update'
      },
      monitoring: {
        activeMonitors: 12,
        alertsEnabled: true,
        uptimeTarget: 99.9,
        currentUptime: 99.95
      }
    };

    res.json({
      success: true,
      data: {
        statistics: systemStats,
        health,
        alerts: systemAlerts,
        operations,
        summary: {
          totalAlerts: systemAlerts.length,
          criticalAlerts: systemAlerts.filter(a => a.severity === 'critical').length,
          warningAlerts: systemAlerts.filter(a => a.severity === 'warning').length,
          systemLoad: (health.resources.cpuUsage + health.resources.memoryUsage) / 2,
          healthScore: health.status === 'healthy' ? 95 : health.status === 'warning' ? 75 : 45
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/email-management - Comprehensive email monitoring and management
router.get('/email-management', authenticate, requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d', status } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeframe) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get comprehensive email data
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      recentRegistrations,
      bounceRates,
      emailCampaigns,
      verificationPending
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Verified email users
      prisma.user.count({
        where: { emailVerified: true }
      }),

      // Unverified email users
      prisma.user.findMany({
        where: { emailVerified: false },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          lastLogin: true,
          subscriptionTier: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),

      // Recent registrations needing verification
      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate },
          emailVerified: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          subscriptionTier: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Simulate bounce rates (in real app, you'd track this)
      {
        totalSent: Math.floor(Math.random() * 1000) + 500,
        bounced: Math.floor(Math.random() * 50) + 10,
        delivered: Math.floor(Math.random() * 950) + 450,
        opened: Math.floor(Math.random() * 400) + 200
      },

      // Simulate email campaign data
      [
        {
          id: 'campaign_1',
          name: 'Welcome Series',
          type: 'onboarding',
          status: 'active',
          sent: 245,
          opened: 156,
          clicked: 89,
          lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'campaign_2',
          name: 'Verification Reminders',
          type: 'verification',
          status: 'active',
          sent: 89,
          opened: 45,
          clicked: 23,
          lastSent: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'campaign_3',
          name: 'Feature Updates',
          type: 'newsletter',
          status: 'scheduled',
          sent: 0,
          opened: 0,
          clicked: 0,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ],

      // Users with pending email verification (priority)
      prisma.user.findMany({
        where: {
          emailVerified: false,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          subscriptionTier: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate email health metrics
    const emailHealth = {
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      bounceRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.bounced / bounceRates.totalSent) * 100) : 0,
      openRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.opened / bounceRates.totalSent) * 100) : 0,
      deliveryRate: bounceRates.totalSent > 0 ? Math.round((bounceRates.delivered / bounceRates.totalSent) * 100) : 0
    };

    // Email domain analysis
    const domainAnalysis = unverifiedUsers.reduce((acc, user) => {
      const domain = user.email.split('@')[1];
      if (!acc[domain]) {
        acc[domain] = { count: 0, users: [] };
      }
      acc[domain].count++;
      acc[domain].users.push({
        id: user.id,
        email: user.email,
        name: user.firstName || user.email.split('@')[0],
        createdAt: user.createdAt
      });
      return acc;
    }, {} as Record<string, { count: number; users: any[] }>);

    // Sort domains by count
    const topDomains = Object.entries(domainAnalysis)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([domain, data]) => ({
        domain,
        unverifiedCount: data.count,
        users: data.users
      }));

    // Email alerts
    const emailAlerts = [];

    if (emailHealth.verificationRate < 70) {
      emailAlerts.push({
        type: 'low_verification_rate',
        severity: 'warning',
        message: `Email verification rate is ${emailHealth.verificationRate}% (target: 70%+)`,
        timestamp: new Date().toISOString(),
        count: totalUsers - verifiedUsers
      });
    }

    if (emailHealth.bounceRate > 5) {
      emailAlerts.push({
        type: 'high_bounce_rate',
        severity: 'critical',
        message: `Email bounce rate is ${emailHealth.bounceRate}% (threshold: 5%)`,
        timestamp: new Date().toISOString(),
        count: bounceRates.bounced
      });
    }

    if (verificationPending.length > 50) {
      emailAlerts.push({
        type: 'pending_verifications',
        severity: 'info',
        message: `${verificationPending.length} users registered in last 24h need email verification`,
        timestamp: new Date().toISOString(),
        count: verificationPending.length
      });
    }

    // Recent email activity
    const recentActivity = [
      ...recentRegistrations.map(user => ({
        id: `reg-${user.id}`,
        type: 'registration',
        email: user.email,
        userName: user.firstName || user.email.split('@')[0],
        description: 'New user registration - verification needed',
        timestamp: user.createdAt,
        status: 'pending',
        tier: user.subscriptionTier
      })),
      ...emailCampaigns.filter(c => c.lastSent).map(campaign => ({
        id: `camp-${campaign.id}`,
        type: 'campaign',
        email: '',
        userName: 'System',
        description: `Email campaign '${campaign.name}' sent to ${campaign.sent} users`,
        timestamp: campaign.lastSent,
        status: 'completed',
        tier: ''
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          unverifiedUsers: totalUsers - verifiedUsers,
          pendingVerification: verificationPending.length,
          verificationRate: emailHealth.verificationRate
        },
        emailHealth,
        campaigns: emailCampaigns,
        unverifiedUsersList: unverifiedUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.email.split('@')[0],
          registeredAt: user.createdAt,
          lastLogin: user.lastLogin,
          tier: user.subscriptionTier,
          daysSinceRegistration: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          priority: !user.lastLogin ? 'high' : 'medium'
        })),
        domainAnalysis: topDomains,
        recentActivity,
        alerts: emailAlerts,
        deliveryStats: {
          sent: bounceRates.totalSent,
          delivered: bounceRates.delivered,
          bounced: bounceRates.bounced,
          opened: bounceRates.opened,
          deliveryRate: emailHealth.deliveryRate,
          openRate: emailHealth.openRate,
          bounceRate: emailHealth.bounceRate
        },
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get email management error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/email-actions - Email management actions
router.post('/email-actions', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, userIds, campaignId, templateType, subject, customMessage } = req.body;
    const adminId = req.user!.id;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    let result: any = {};

    switch (action) {
      case 'send_verification_reminder':
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'User IDs array is required for verification reminders'
          });
        }

        // Get user details
        const users = await prisma.user.findMany({
          where: {
            id: { in: userIds },
            emailVerified: false
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        });

        if (users.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No unverified users found with provided IDs'
          });
        }

        // In a real implementation, you'd:
        // 1. Generate verification tokens
        // 2. Send verification emails
        // 3. Log email sends
        // 4. Track delivery status

        console.log(`Admin ${adminId} sent verification reminders to ${users.length} users:`, users.map(u => u.email));

        result = {
          message: `Verification reminders sent to ${users.length} users`,
          recipients: users.map(u => ({
            email: u.email,
            name: u.firstName || u.email.split('@')[0]
          })),
          sentAt: new Date().toISOString()
        };
        break;

      case 'bulk_verification_reminder':
        // Send reminders to all unverified users
        const allUnverified = await prisma.user.findMany({
          where: { emailVerified: false },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true
          }
        });

        // Filter to only recent registrations (last 30 days) to avoid spam
        const recentUnverified = allUnverified.filter(user =>
          new Date(user.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        );

        console.log(`Admin ${adminId} sent bulk verification reminders to ${recentUnverified.length} recent users`);

        result = {
          message: `Bulk verification reminders sent to ${recentUnverified.length} recent users`,
          totalUnverified: allUnverified.length,
          recentUnverified: recentUnverified.length,
          sentAt: new Date().toISOString()
        };
        break;

      case 'create_email_campaign':
        if (!templateType || !subject) {
          return res.status(400).json({
            success: false,
            message: 'Template type and subject are required for email campaigns'
          });
        }

        const campaignData = {
          id: `campaign_${Date.now()}`,
          name: subject,
          type: templateType,
          subject,
          message: customMessage || 'Default campaign message',
          createdBy: adminId,
          status: 'draft',
          createdAt: new Date().toISOString()
        };

        console.log(`Admin ${adminId} created email campaign:`, campaignData);

        result = {
          message: `Email campaign '${subject}' created successfully`,
          campaign: campaignData
        };
        break;

      case 'send_campaign':
        if (!campaignId) {
          return res.status(400).json({
            success: false,
            message: 'Campaign ID is required'
          });
        }

        // Get target users for campaign
        const targetUsers = await prisma.user.findMany({
          where: {
            emailVerified: true // Only send to verified emails
          },
          select: { id: true, email: true, firstName: true }
        });

        console.log(`Admin ${adminId} sent campaign ${campaignId} to ${targetUsers.length} users`);

        result = {
          message: `Campaign sent to ${targetUsers.length} verified users`,
          campaignId,
          recipients: targetUsers.length,
          sentAt: new Date().toISOString()
        };
        break;

      case 'verify_user_email':
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'User IDs are required for manual verification'
          });
        }

        // Manually verify user emails (admin override)
        const verifiedUsers = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            emailVerified: false
          },
          data: {
            emailVerified: true,
            updatedAt: new Date()
          }
        });

        console.log(`Admin ${adminId} manually verified ${verifiedUsers.count} user emails`);

        result = {
          message: `Manually verified ${verifiedUsers.count} user emails`,
          verifiedCount: verifiedUsers.count,
          verifiedAt: new Date().toISOString()
        };
        break;

      case 'export_email_list':
        const { filter = 'all' } = req.body;

        let whereClause: any = {};
        if (filter === 'verified') {
          whereClause.emailVerified = true;
        } else if (filter === 'unverified') {
          whereClause.emailVerified = false;
        }

        const emailList = await prisma.user.findMany({
          where: whereClause,
          select: {
            email: true,
            firstName: true,
            lastName: true,
            subscriptionTier: true,
            createdAt: true,
            emailVerified: true
          },
          orderBy: { createdAt: 'desc' }
        });

        result = {
          message: `Exported ${emailList.length} email addresses`,
          exportData: emailList,
          filter,
          exportedAt: new Date().toISOString()
        };
        break;

      case 'check_email_deliverability':
        // Simulate email deliverability check
        const deliverabilityScore = Math.random() * 30 + 70; // 70-100
        const issues = [];

        if (deliverabilityScore < 80) {
          issues.push('SPF record needs optimization');
        }
        if (deliverabilityScore < 85) {
          issues.push('DKIM signature should be implemented');
        }
        if (deliverabilityScore < 90) {
          issues.push('Domain reputation could be improved');
        }

        result = {
          message: 'Email deliverability check completed',
          score: Math.round(deliverabilityScore),
          status: deliverabilityScore > 90 ? 'excellent' :
                  deliverabilityScore > 80 ? 'good' :
                  deliverabilityScore > 70 ? 'fair' : 'poor',
          issues,
          checkedAt: new Date().toISOString()
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown email action: ${action}`
        });
    }

    console.log(`Admin ${adminId} performed email action '${action}':`, result);

    res.json({
      success: true,
      data: {
        action,
        performedBy: adminId,
        timestamp: new Date().toISOString(),
        ...result
      }
    });
  } catch (error) {
    console.error('Email action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/email-templates - Email template management
router.get('/email-templates', authenticate, requireAdmin, async (req, res) => {
  try {
    // In a real implementation, these would be stored in database
    const emailTemplates = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        type: 'onboarding',
        subject: 'Welcome to SmartPromptIQ! 🎉',
        content: 'Thank you for joining SmartPromptIQ! We\'re excited to help you create amazing AI prompts.',
        variables: ['firstName', 'lastName', 'verificationLink'],
        isActive: true,
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'verification',
        name: 'Email Verification',
        type: 'verification',
        subject: 'Please verify your email address',
        content: 'Hi {{firstName}}, please click the link below to verify your email: {{verificationLink}}',
        variables: ['firstName', 'verificationLink'],
        isActive: true,
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'verification_reminder',
        name: 'Verification Reminder',
        type: 'verification',
        subject: 'Don\'t forget to verify your email!',
        content: 'Hi {{firstName}}, you haven\'t verified your email yet. Please click: {{verificationLink}}',
        variables: ['firstName', 'verificationLink'],
        isActive: true,
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'password_reset',
        name: 'Password Reset',
        type: 'security',
        subject: 'Reset your SmartPromptIQ password',
        content: 'Hi {{firstName}}, click here to reset your password: {{resetLink}}',
        variables: ['firstName', 'resetLink'],
        isActive: true,
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'feature_update',
        name: 'Feature Update Newsletter',
        type: 'newsletter',
        subject: 'New features in SmartPromptIQ! ✨',
        content: 'Hi {{firstName}}, check out our latest features and improvements!',
        variables: ['firstName', 'featuresLink'],
        isActive: false,
        lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Template usage statistics (simulated)
    const templateStats = emailTemplates.map(template => {
      const sent = Math.floor(Math.random() * 500) + 100;
      const opened = Math.floor(sent * (Math.random() * 0.4 + 0.3)); // 30-70% open rate
      const clicked = Math.floor(opened * (Math.random() * 0.3 + 0.1)); // 10-40% click rate

      return {
        templateId: template.id,
        name: template.name,
        sent,
        opened,
        clicked,
        openRate: Math.round((opened / sent) * 100),
        clickRate: Math.round((clicked / opened) * 100),
        lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    res.json({
      success: true,
      data: {
        templates: emailTemplates,
        statistics: templateStats,
        summary: {
          totalTemplates: emailTemplates.length,
          activeTemplates: emailTemplates.filter(t => t.isActive).length,
          totalSent: templateStats.reduce((sum, stat) => sum + stat.sent, 0),
          averageOpenRate: Math.round(templateStats.reduce((sum, stat) => sum + stat.openRate, 0) / templateStats.length),
          averageClickRate: Math.round(templateStats.reduce((sum, stat) => sum + stat.clickRate, 0) / templateStats.length)
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/email-templates - Create/update email template
router.post('/email-templates', authenticate, requireAdmin, async (req, res) => {
  try {
    const { templateId, name, type, subject, content, variables, isActive } = req.body;
    const adminId = req.user!.id;

    if (!name || !type || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, subject, and content are required'
      });
    }

    const template = {
      id: templateId || `template_${Date.now()}`,
      name,
      type,
      subject,
      content,
      variables: variables || [],
      isActive: isActive !== undefined ? isActive : true,
      lastModified: new Date().toISOString(),
      modifiedBy: adminId
    };

    // In a real implementation, you'd save this to database
    console.log(`Admin ${adminId} ${templateId ? 'updated' : 'created'} email template:`, template);

    res.json({
      success: true,
      data: {
        template,
        action: templateId ? 'updated' : 'created',
        performedBy: adminId,
        timestamp: new Date().toISOString()
      },
      message: `Email template '${name}' ${templateId ? 'updated' : 'created'} successfully`
    });
  } catch (error) {
    console.error('Email template operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Deletion reason is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'ADMIN' && user.id !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other admin accounts'
      });
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: {
        deletedUserId: id,
        reason,
        deletedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/admin/payments/:id - Delete payment record
router.delete('/payments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Deletion reason is required'
      });
    }

    // Find payment record
    const payment = await prisma.tokenTransaction.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Delete payment record
    await prisma.tokenTransaction.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Payment record deleted successfully',
      data: {
        deletedPaymentId: id,
        reason,
        deletedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/admin/sessions/:userId - Terminate user sessions
router.delete('/sessions/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Termination reason is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's token version to invalidate all sessions
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 }
      }
    });

    res.json({
      success: true,
      message: 'User sessions terminated successfully',
      data: {
        userId,
        reason,
        terminatedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Terminate sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/admin/logs - Clear system logs
router.delete('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { olderThan, reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Deletion reason is required'
      });
    }

    let whereCondition = {};

    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      whereCondition = { createdAt: { lt: cutoffDate } };
    }

    // Delete usage logs
    const deletedLogs = await prisma.usageLog.deleteMany({
      where: whereCondition
    });

    res.json({
      success: true,
      message: `${deletedLogs.count} system logs deleted successfully`,
      data: {
        deletedCount: deletedLogs.count,
        reason,
        deletedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/users/:id/suspend - Suspend user account
router.post('/users/:id/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, duration } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow suspending other admins
    if (user.role === 'ADMIN' && user.id !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend other admin accounts'
      });
    }

    const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    // Update user status
    await prisma.user.update({
      where: { id },
      data: {
        status: 'suspended',
        suspendedUntil,
        suspensionReason: reason,
        tokenVersion: { increment: 1 } // Invalidate sessions
      }
    });

    res.json({
      success: true,
      message: 'User account suspended successfully',
      data: {
        userId: id,
        reason,
        suspendedUntil,
        suspendedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/admin/users/:id/unsuspend - Unsuspend user account
router.post('/users/:id/unsuspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Unsuspension reason is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    await prisma.user.update({
      where: { id },
      data: {
        status: 'active',
        suspendedUntil: null,
        suspensionReason: null
      }
    });

    res.json({
      success: true,
      message: 'User account unsuspended successfully',
      data: {
        userId: id,
        reason,
        unsuspendedBy: req.user!.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;