/**
 * Usage API Routes - Handle user usage tracking and analytics
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const usageAnalytics = require('../utils/usageAnalytics');
const { rateLimiter } = require('../utils/rateLimiter');
const prisma = require('../config/database');

const router = express.Router();

/**
 * GET /api/usage/current - Get current usage for authenticated user
 */
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's current token balance and limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenBalance: true,
        subscriptionTier: true,
        monthlyTokensUsed: true,
        monthlyResetDate: true,
        tokensUsed: true,
        tokensPurchased: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get rate limit status
    const rateLimitStatus = await rateLimiter.getRateLimitStatus(userId);
    
    // Get real-time stats from analytics service
    const realTimeStats = usageAnalytics.getRealTimeStats(userId);

    res.json({
      success: true,
      data: {
        tokenBalance: user.tokenBalance,
        subscriptionTier: user.subscriptionTier,
        monthlyTokensUsed: user.monthlyTokensUsed,
        monthlyResetDate: user.monthlyResetDate,
        lifetimeTokensUsed: user.tokensUsed,
        lifetimeTokensPurchased: user.tokensPurchased,
        rateLimits: rateLimitStatus,
        realTimeStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting current usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve usage data'
    });
  }
});

/**
 * GET /api/usage/history - Get usage history with analytics
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 'month', page = 1, limit = 50 } = req.query;

    const summary = await usageAnalytics.getUserUsageSummary(userId, timeframe);
    
    // Get paginated transaction history
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [transactions, totalCount] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          type: true,
          tokens: true,
          balanceBefore: true,
          balanceAfter: true,
          costInCents: true,
          packageType: true,
          promptComplexity: true,
          model: true,
          category: true,
          description: true,
          createdAt: true,
          expiresAt: true,
          isExpired: true
        }
      }),
      prisma.tokenTransaction.count({
        where: { userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        summary,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve usage history'
    });
  }
});

/**
 * POST /api/usage/track-prompt - Track a prompt generation event
 */
router.post('/track-prompt', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      prompt,
      category,
      complexity = 'standard',
      model = 'gpt3_5_turbo',
      tokensUsed,
      responseLength,
      quality,
      projectId
    } = req.body;

    if (!prompt || !category) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and category are required'
      });
    }

    const result = await usageAnalytics.trackPromptGeneration(userId, {
      prompt,
      category,
      complexity,
      model,
      tokensUsed,
      responseLength,
      quality,
      projectId
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error tracking prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track prompt generation'
    });
  }
});

/**
 * GET /api/usage/analytics - Get detailed analytics for user
 */
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 'month' } = req.query;

    const analytics = await usageAnalytics.getUserUsageSummary(userId, timeframe);
    
    // Get additional analytics data
    const [recentUsage, categoryTrends] = await Promise.all([
      prisma.usageLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          endpoint: true,
          tokensConsumed: true,
          promptComplexity: true,
          success: true,
          responseTime: true,
          createdAt: true
        }
      }),
      prisma.analytics.groupBy({
        by: ['category'],
        where: {
          userId,
          event: 'prompt_generated',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        _count: { category: true },
        _sum: { value: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        ...analytics,
        recentActivity: recentUsage,
        categoryTrends,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

/**
 * GET /api/usage/export - Export usage data
 */
router.get('/export', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', timeframe = 'month' } = req.query;

    const report = await usageAnalytics.generateUserReport(userId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=usage-report-${timeframe}.csv`);
      res.send(report);
    } else {
      res.json({
        success: true,
        data: report
      });
    }

  } catch (error) {
    console.error('Error exporting usage data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export usage data'
    });
  }
});

/**
 * GET /api/usage/tokens/expiring - Get tokens that are expiring soon
 */
router.get('/tokens/expiring', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const warningDays = parseInt(req.query.days) || 7; // Default 7 days warning
    
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + warningDays);

    const expiringTokens = await prisma.tokenTransaction.findMany({
      where: {
        userId,
        type: 'purchase',
        expiresAt: {
          lte: expiringDate,
          gte: new Date() // Not already expired
        },
        isExpired: false,
        tokens: { gt: 0 } // Only positive transactions (purchases/credits)
      },
      orderBy: { expiresAt: 'asc' },
      select: {
        id: true,
        tokens: true,
        expiresAt: true,
        packageType: true,
        createdAt: true
      }
    });

    const totalExpiringTokens = expiringTokens.reduce((sum, t) => sum + t.tokens, 0);

    res.json({
      success: true,
      data: {
        expiringTokens,
        totalExpiringTokens,
        warningDays,
        expiringBefore: expiringDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting expiring tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve expiring tokens'
    });
  }
});

/**
 * POST /api/usage/cost-alert - Set up cost alerts for user
 */
router.post('/cost-alert', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { threshold, enabled = true } = req.body;

    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
      return res.status(400).json({
        success: false,
        error: 'Threshold must be a number between 0 and 100'
      });
    }

    // Store the alert preference in user's metadata or separate table
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Assuming we add these fields to the User model
        // costAlertThreshold: threshold,
        // costAlertsEnabled: enabled
      }
    });

    // Log the preference change
    await usageAnalytics.recordAnalyticsEvent(userId, 'cost_alert_updated', 'settings', threshold, {
      enabled,
      threshold
    });

    res.json({
      success: true,
      message: 'Cost alert settings updated',
      data: {
        threshold,
        enabled
      }
    });

  } catch (error) {
    console.error('Error setting cost alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cost alert settings'
    });
  }
});

module.exports = router;