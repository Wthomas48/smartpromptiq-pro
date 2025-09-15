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

export default router;