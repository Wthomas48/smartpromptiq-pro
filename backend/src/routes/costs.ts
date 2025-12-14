/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - COST MANAGEMENT API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * API endpoints for cost tracking, usage stats, and admin cost management.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  API_COSTS,
  TOKEN_COSTS,
  TOKEN_PACKAGES,
  SUBSCRIPTION_TOKENS,
  USAGE_LIMITS,
  COST_ALERTS,
  COST_CONTROL_FLAGS,
  getTokenCost,
  checkUsageLimit,
  getSubscriptionTier,
  formatCost,
  estimateMonthlyAPICost,
} from '../config/costs';
import { getUserUsageStats, getSystemCostStats } from '../middleware/costTracking';
import { sendCostAlert, checkAndSendCostAlerts } from '../services/costAlertService';

const router = express.Router();
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/costs/pricing
 * Get public pricing information
 */
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        tokenPackages: TOKEN_PACKAGES,
        subscriptionTokens: SUBSCRIPTION_TOKENS,
        tokenCosts: TOKEN_COSTS,
      },
    });
  } catch (error) {
    console.error('Error getting pricing:', error);
    res.status(500).json({ error: 'Failed to get pricing' });
  }
});

/**
 * GET /api/costs/token-costs
 * Get token costs for all features
 */
router.get('/token-costs', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: TOKEN_COSTS,
    });
  } catch (error) {
    console.error('Error getting token costs:', error);
    res.status(500).json({ error: 'Failed to get token costs' });
  }
});

/**
 * GET /api/costs/limits
 * Get usage limits for all tiers
 */
router.get('/limits', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: USAGE_LIMITS,
    });
  } catch (error) {
    console.error('Error getting limits:', error);
    res.status(500).json({ error: 'Failed to get limits' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER ENDPOINTS (Requires Authentication)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/costs/my-usage
 * Get current user's usage statistics
 */
router.get('/my-usage', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const stats = await getUserUsageStats(userId);
    if (!stats) {
      return res.status(500).json({ error: 'Failed to get usage stats' });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting user usage:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

/**
 * GET /api/costs/my-history
 * Get user's usage history
 */
router.get('/my-history', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { page = '1', limit = '50', startDate, endDate } = req.query;

  try {
    const where: any = { userId };

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    }

    const [history, total] = await Promise.all([
      prisma.usageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.usageLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ error: 'Failed to get usage history' });
  }
});

/**
 * POST /api/costs/check-tokens
 * Check if user has enough tokens for an action
 */
router.post('/check-tokens', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { category, feature } = req.body;

  if (!category || !feature) {
    return res.status(400).json({ error: 'Category and feature are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true, subscriptionTier: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tokenCost = getTokenCost(category, feature);
    const hasEnough = user.tokenBalance >= tokenCost;
    const tier = getSubscriptionTier(user.subscriptionTier || 'free');

    res.json({
      success: true,
      data: {
        hasEnoughTokens: hasEnough,
        tokenCost,
        currentBalance: user.tokenBalance,
        balanceAfter: hasEnough ? user.tokenBalance - tokenCost : null,
        tier,
      },
    });
  } catch (error) {
    console.error('Error checking tokens:', error);
    res.status(500).json({ error: 'Failed to check tokens' });
  }
});

/**
 * POST /api/costs/estimate
 * Estimate cost for a planned action
 */
router.post('/estimate', async (req: Request, res: Response) => {
  const { actions } = req.body;

  if (!Array.isArray(actions)) {
    return res.status(400).json({ error: 'Actions array is required' });
  }

  try {
    let totalTokens = 0;
    const breakdown: any[] = [];

    for (const action of actions) {
      const { category, feature, quantity = 1 } = action;
      const tokenCost = getTokenCost(category, feature);
      const totalForAction = tokenCost * quantity;

      breakdown.push({
        category,
        feature,
        quantity,
        tokenCostEach: tokenCost,
        totalTokens: totalForAction,
      });

      totalTokens += totalForAction;
    }

    res.json({
      success: true,
      data: {
        totalTokens,
        breakdown,
        estimatedUSD: (totalTokens * 0.035).toFixed(2), // Average token value
      },
    });
  } catch (error) {
    console.error('Error estimating cost:', error);
    res.status(500).json({ error: 'Failed to estimate cost' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/costs/admin/dashboard
 * Get admin cost dashboard data
 */
router.get('/admin/dashboard', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.isAdmin;

  if (!userId || !isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const systemStats = await getSystemCostStats();
    if (!systemStats) {
      return res.status(500).json({ error: 'Failed to get system stats' });
    }

    // Get cost breakdown by provider
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const costByProvider = await prisma.usageLog.groupBy({
      by: ['provider'],
      where: { createdAt: { gte: today } },
      _sum: { cost: true },
      _count: true,
    });

    // Get cost breakdown by feature
    const costByFeature = await prisma.usageLog.groupBy({
      by: ['action'],
      where: { createdAt: { gte: today } },
      _sum: { cost: true, tokensUsed: true },
      _count: true,
      orderBy: { _sum: { cost: 'desc' } },
      take: 20,
    });

    // Calculate profit metrics
    const revenue = systemStats.daily.totalTokens * 0.035; // Average token value
    const cost = systemStats.daily.totalCost;
    const profit = revenue - cost;
    const margin = cost > 0 ? ((profit / revenue) * 100) : 100;

    res.json({
      success: true,
      data: {
        ...systemStats,
        profitMetrics: {
          daily: {
            revenue: parseFloat(revenue.toFixed(2)),
            cost: parseFloat(cost.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            margin: parseFloat(margin.toFixed(1)),
          },
        },
        costByProvider,
        costByFeature,
        controlFlags: COST_CONTROL_FLAGS,
        apiCosts: API_COSTS,
      },
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

/**
 * GET /api/costs/admin/users/:userId
 * Get specific user's cost data (admin only)
 */
router.get('/admin/users/:userId', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { userId } = req.params;

  try {
    const stats = await getUserUsageStats(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        tokenBalance: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user,
        usage: stats,
      },
    });
  } catch (error) {
    console.error('Error getting user cost data:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

/**
 * POST /api/costs/admin/set-flags
 * Update cost control flags (admin only)
 */
router.post('/admin/set-flags', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { flags } = req.body;

  try {
    // Update flags in memory (in production, save to database)
    Object.assign(COST_CONTROL_FLAGS, flags);

    console.log('🔧 Cost control flags updated:', flags);

    res.json({
      success: true,
      message: 'Cost control flags updated',
      data: COST_CONTROL_FLAGS,
    });
  } catch (error) {
    console.error('Error setting flags:', error);
    res.status(500).json({ error: 'Failed to update flags' });
  }
});

/**
 * GET /api/costs/admin/high-spenders
 * Get users with highest API costs (potential abuse)
 */
router.get('/admin/high-spenders', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { period = 'daily' } = req.query;

  try {
    const startDate = new Date();
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(1); // Monthly
    }

    const highSpenders = await prisma.usageLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startDate } },
      _sum: { cost: true, tokensUsed: true },
      _count: true,
      orderBy: { _sum: { cost: 'desc' } },
      take: 50,
    });

    // Get user details
    const userIds = highSpenders.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true, subscriptionTier: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const enrichedData = highSpenders.map(s => ({
      ...s,
      user: userMap.get(s.userId),
      isAboveThreshold: (s._sum.cost || 0) > COST_ALERTS.perUser.daily,
    }));

    res.json({
      success: true,
      data: {
        period,
        startDate,
        threshold: COST_ALERTS.perUser,
        users: enrichedData,
      },
    });
  } catch (error) {
    console.error('Error getting high spenders:', error);
    res.status(500).json({ error: 'Failed to get high spenders' });
  }
});

/**
 * GET /api/costs/admin/trends
 * Get cost trends over time
 */
router.get('/admin/trends', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { days = '30' } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    // Get daily aggregates
    const dailyData = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        SUM(cost) as totalCost,
        SUM(tokensUsed) as totalTokens,
        COUNT(*) as totalRequests
      FROM UsageLog
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    ` as any[];

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        startDate,
        trends: dailyData,
      },
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

/**
 * POST /api/costs/admin/emergency-shutdown
 * Emergency shutdown of expensive features
 */
router.post('/admin/emergency-shutdown', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { reason } = req.body;

  try {
    // Disable all expensive features
    COST_CONTROL_FLAGS.enableGPT4 = false;
    COST_CONTROL_FLAGS.enableDALLE3 = false;
    COST_CONTROL_FLAGS.enableElevenLabs = false;
    COST_CONTROL_FLAGS.enableSuno = false;

    console.error(`🚨 EMERGENCY SHUTDOWN ACTIVATED by admin. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Emergency shutdown activated. Expensive features disabled.',
      data: COST_CONTROL_FLAGS,
    });
  } catch (error) {
    console.error('Error in emergency shutdown:', error);
    res.status(500).json({ error: 'Failed to activate emergency shutdown' });
  }
});

/**
 * POST /api/costs/admin/restore
 * Restore features after emergency shutdown
 */
router.post('/admin/restore', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Re-enable features
    COST_CONTROL_FLAGS.enableGPT4 = true;
    COST_CONTROL_FLAGS.enableDALLE3 = true;
    COST_CONTROL_FLAGS.enableElevenLabs = true;
    COST_CONTROL_FLAGS.enableSuno = true;

    console.log('✅ Features restored by admin');

    res.json({
      success: true,
      message: 'Features restored successfully.',
      data: COST_CONTROL_FLAGS,
    });
  } catch (error) {
    console.error('Error restoring features:', error);
    res.status(500).json({ error: 'Failed to restore features' });
  }
});

/**
 * POST /api/costs/admin/test-alert
 * Send a test cost alert email (admin only)
 */
router.post('/admin/test-alert', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { level = 'warning', period = 'daily' } = req.body;

  try {
    const result = await sendCostAlert({
      level: level as 'warning' | 'critical' | 'shutdown',
      period: period as 'daily' | 'monthly',
      currentCost: 150,
      threshold: 200,
      percentUsed: 75,
      topSpenders: [
        { userId: 'test-1', email: 'test@example.com', cost: 50 },
        { userId: 'test-2', email: 'user@example.com', cost: 30 },
      ],
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: result ? 'Test alert sent successfully' : 'Alert skipped (within cooldown or no admin emails)',
      alertSent: result,
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({ error: 'Failed to send test alert' });
  }
});

/**
 * POST /api/costs/admin/check-alerts
 * Manually trigger cost alert check (admin only)
 */
router.post('/admin/check-alerts', async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.isAdmin;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await checkAndSendCostAlerts();
    res.json({
      success: true,
      message: 'Cost alerts checked',
      thresholds: COST_ALERTS,
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    res.status(500).json({ error: 'Failed to check alerts' });
  }
});

export default router;
