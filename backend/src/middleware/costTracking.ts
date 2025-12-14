/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - COST TRACKING MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Middleware to track API costs, enforce usage limits, and prevent overspending.
 * This is CRITICAL for maintaining profitability!
 *
 * Features:
 * - Real-time cost tracking per request
 * - Usage limit enforcement
 * - Token deduction
 * - Cost alerts
 * - Abuse detection
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  API_COSTS,
  TOKEN_COSTS,
  USAGE_LIMITS,
  COST_ALERTS,
  COST_CONTROL_FLAGS,
  calculateAPICost,
  getTokenCost,
  checkUsageLimit,
  getSubscriptionTier,
  formatCost,
} from '../config/costs';
import { checkAndSendCostAlerts, sendUserHighUsageAlert } from '../services/costAlertService';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CostTrackingOptions {
  category: keyof typeof TOKEN_COSTS;
  feature: string;
  provider?: string;
  model?: string;
  estimatedCost?: number;
  skipTokenDeduction?: boolean;
}

interface UsageRecord {
  userId: string;
  feature: string;
  tokensUsed: number;
  apiCost: number;
  timestamp: Date;
}

// In-memory cache for daily/monthly usage (for performance)
const usageCache: Map<string, { daily: number; monthly: number; lastReset: Date }> = new Map();

// Daily cost accumulator
let dailyCostTotal = 0;
let dailyCostResetDate = new Date().toDateString();

// ═══════════════════════════════════════════════════════════════════════════════
// COST TRACKING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main cost tracking middleware factory
 */
export function trackCost(options: CostTrackingOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // 1. Get user and subscription info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          tokenBalance: true,
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tier = getSubscriptionTier(user.subscriptionTier || 'free');
      const tokenCost = getTokenCost(options.category, options.feature);

      // 2. Check if user has enough tokens
      if (!options.skipTokenDeduction && user.tokenBalance < tokenCost) {
        return res.status(402).json({
          error: 'Insufficient tokens',
          required: tokenCost,
          balance: user.tokenBalance,
          message: `This action requires ${tokenCost} tokens. You have ${user.tokenBalance} tokens.`,
        });
      }

      // 3. Check usage limits
      const usageCacheKey = `${userId}-${options.feature}`;
      const cachedUsage = usageCache.get(usageCacheKey) || { daily: 0, monthly: 0, lastReset: new Date() };

      // Reset daily counter if new day
      if (cachedUsage.lastReset.toDateString() !== new Date().toDateString()) {
        cachedUsage.daily = 0;
        cachedUsage.lastReset = new Date();
      }

      const dailyLimit = checkUsageLimit(tier, options.feature, cachedUsage.daily, 'daily');
      if (!dailyLimit.allowed) {
        return res.status(429).json({
          error: 'Daily limit reached',
          limit: dailyLimit.limit,
          used: cachedUsage.daily,
          resetIn: getTimeUntilMidnight(),
          message: `You've reached your daily limit of ${dailyLimit.limit} ${options.feature}. Upgrade your plan for more.`,
        });
      }

      // 4. Check cost control flags
      if (!checkCostControlFlags(options)) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'This feature is temporarily disabled due to high demand. Please try again later.',
        });
      }

      // 5. Check daily cost threshold
      if (COST_CONTROL_FLAGS.enableCostThrottling) {
        resetDailyCostIfNeeded();
        if (dailyCostTotal >= COST_ALERTS.daily.shutdown) {
          console.error('🚨 CRITICAL: Daily cost limit reached! Shutting down paid features.');
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'We are experiencing high demand. Please try again later.',
          });
        }
      }

      // 6. Store pre-request data for post-processing
      (req as any).costTracking = {
        userId,
        tier,
        tokenCost,
        options,
        startTime,
        cachedUsage,
        usageCacheKey,
      };

      // 7. Hook into response to track actual costs
      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        // Process cost after response
        processCostAfterResponse(req, body).catch(console.error);
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cost tracking middleware error:', error);
      next(error);
    }
  };
}

/**
 * Process cost tracking after the response is sent
 */
async function processCostAfterResponse(req: Request, responseBody: any) {
  const tracking = (req as any).costTracking;
  if (!tracking) return;

  const { userId, tokenCost, options, startTime, cachedUsage, usageCacheKey } = tracking;

  try {
    // Calculate actual API cost from response metadata (if available)
    const actualCost = responseBody?.metadata?.apiCost || options.estimatedCost || 0;

    // 1. Deduct tokens from user (unless skipped)
    if (!options.skipTokenDeduction) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { decrement: tokenCost },
        },
      });
    }

    // 2. Log the usage
    await prisma.usageLog.create({
      data: {
        userId,
        action: `${options.category}:${options.feature}`,
        tokensUsed: tokenCost,
        cost: actualCost,
        provider: options.provider || 'unknown',
        model: options.model || 'unknown',
        responseTime: Date.now() - startTime,
        metadata: JSON.stringify({
          category: options.category,
          feature: options.feature,
          success: !responseBody?.error,
        }),
      },
    });

    // 3. Update usage cache
    cachedUsage.daily++;
    cachedUsage.monthly++;
    usageCache.set(usageCacheKey, cachedUsage);

    // 4. Update daily cost total
    dailyCostTotal += actualCost;

    // 5. Check for cost alerts
    checkCostAlerts(actualCost, userId);

    // 6. Log if enabled
    if (COST_CONTROL_FLAGS.logAllAPICosts) {
      console.log(`💰 Cost: ${formatCost(actualCost)} | Tokens: ${tokenCost} | User: ${userId} | Feature: ${options.feature}`);
    }
  } catch (error) {
    console.error('Error processing cost after response:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-CHECK MIDDLEWARE (Check before expensive operations)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pre-check middleware to validate tokens before expensive operations
 */
export async function preCheckTokens(
  req: Request,
  res: Response,
  next: NextFunction,
  category: keyof typeof TOKEN_COSTS,
  feature: string
) {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    const tokenCost = getTokenCost(category, feature);

    if (!user || user.tokenBalance < tokenCost) {
      return res.status(402).json({
        error: 'Insufficient tokens',
        required: tokenCost,
        balance: user?.tokenBalance || 0,
      });
    }

    (req as any).tokenCost = tokenCost;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Deduct tokens after successful operation
 */
export async function deductTokens(userId: string, amount: number): Promise<boolean> {
  try {
    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        tokenBalance: { gte: amount },
      },
      data: {
        tokenBalance: { decrement: amount },
      },
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error deducting tokens:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE TRACKING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [dailyUsage, monthlyUsage, user] = await Promise.all([
      prisma.usageLog.aggregate({
        where: {
          userId,
          createdAt: { gte: today },
        },
        _sum: { tokensUsed: true, cost: true },
        _count: true,
      }),
      prisma.usageLog.aggregate({
        where: {
          userId,
          createdAt: { gte: monthStart },
        },
        _sum: { tokensUsed: true, cost: true },
        _count: true,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true, subscriptionTier: true },
      }),
    ]);

    const tier = getSubscriptionTier(user?.subscriptionTier || 'free');
    const limits = USAGE_LIMITS[tier];

    return {
      daily: {
        tokensUsed: dailyUsage._sum.tokensUsed || 0,
        apiCost: dailyUsage._sum.cost || 0,
        requests: dailyUsage._count,
      },
      monthly: {
        tokensUsed: monthlyUsage._sum.tokensUsed || 0,
        apiCost: monthlyUsage._sum.cost || 0,
        requests: monthlyUsage._count,
      },
      balance: user?.tokenBalance || 0,
      tier,
      limits,
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
}

/**
 * Get system-wide cost stats (for admin)
 */
export async function getSystemCostStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [dailyCosts, monthlyCosts, topUsers] = await Promise.all([
      prisma.usageLog.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { cost: true, tokensUsed: true },
        _count: true,
      }),
      prisma.usageLog.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { cost: true, tokensUsed: true },
        _count: true,
      }),
      prisma.usageLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: today } },
        _sum: { cost: true },
        orderBy: { _sum: { cost: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      daily: {
        totalCost: dailyCosts._sum.cost || 0,
        totalTokens: dailyCosts._sum.tokensUsed || 0,
        totalRequests: dailyCosts._count,
        alerts: {
          warning: (dailyCosts._sum.cost || 0) >= COST_ALERTS.daily.warning,
          critical: (dailyCosts._sum.cost || 0) >= COST_ALERTS.daily.critical,
          shutdown: (dailyCosts._sum.cost || 0) >= COST_ALERTS.daily.shutdown,
        },
      },
      monthly: {
        totalCost: monthlyCosts._sum.cost || 0,
        totalTokens: monthlyCosts._sum.tokensUsed || 0,
        totalRequests: monthlyCosts._count,
        alerts: {
          warning: (monthlyCosts._sum.cost || 0) >= COST_ALERTS.monthly.warning,
          critical: (monthlyCosts._sum.cost || 0) >= COST_ALERTS.monthly.critical,
          shutdown: (monthlyCosts._sum.cost || 0) >= COST_ALERTS.monthly.shutdown,
        },
      },
      topUsers,
      thresholds: COST_ALERTS,
    };
  } catch (error) {
    console.error('Error getting system cost stats:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function checkCostControlFlags(options: CostTrackingOptions): boolean {
  const { provider, model } = options;

  // Check if expensive providers are enabled
  if (provider === 'openai' && model?.includes('gpt-4') && !COST_CONTROL_FLAGS.enableGPT4) {
    return false;
  }
  if (provider === 'openai' && model?.includes('dall-e-3') && !COST_CONTROL_FLAGS.enableDALLE3) {
    return false;
  }
  if (provider === 'elevenlabs' && !COST_CONTROL_FLAGS.enableElevenLabs) {
    return false;
  }
  if (provider === 'suno' && !COST_CONTROL_FLAGS.enableSuno) {
    return false;
  }

  return true;
}

function resetDailyCostIfNeeded() {
  const today = new Date().toDateString();
  if (dailyCostResetDate !== today) {
    dailyCostTotal = 0;
    dailyCostResetDate = today;
  }
}

async function checkCostAlerts(cost: number, userId: string) {
  if (!COST_CONTROL_FLAGS.alertOnHighCost) return;

  // Check daily threshold
  if (dailyCostTotal >= COST_ALERTS.daily.warning && dailyCostTotal < COST_ALERTS.daily.critical) {
    console.warn(`⚠️ WARNING: Daily cost threshold reached: ${formatCost(dailyCostTotal)}`);
  } else if (dailyCostTotal >= COST_ALERTS.daily.critical) {
    console.error(`🚨 CRITICAL: Daily cost critical threshold: ${formatCost(dailyCostTotal)}`);
  }

  // Trigger email alert check (async, non-blocking)
  checkAndSendCostAlerts().catch(err => {
    console.error('Error in cost alert check:', err);
  });

  // Check user-specific high usage
  if (userId && cost > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userDailyCost = await prisma.usageLog.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { cost: true },
    });

    const totalUserCost = userDailyCost._sum.cost || 0;
    if (totalUserCost >= COST_ALERTS.perUser.daily) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user) {
        sendUserHighUsageAlert(userId, user.email, totalUserCost).catch(err => {
          console.error('Error sending user high usage alert:', err);
        });
      }
    }
  }
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS MIDDLEWARE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quick middleware factories for common operations
 */
export const costMiddleware = {
  // Prompt generation
  prompt: (feature: string = 'standard') => trackCost({
    category: 'prompt',
    feature,
    provider: 'openai',
    model: feature === 'premium' ? 'gpt-4' : 'gpt-4o-mini',
  }),

  // Voice generation
  voice: (provider: string = 'elevenlabs') => trackCost({
    category: 'voice',
    feature: `${provider}-standard`,
    provider,
  }),

  // Music generation
  music: (feature: string = 'instrumental') => trackCost({
    category: 'music',
    feature,
    provider: 'suno',
  }),

  // Image generation
  image: (feature: string = 'sdxl') => trackCost({
    category: 'image',
    feature,
    provider: feature.includes('dalle') ? 'openai' : 'stability',
  }),

  // BuilderIQ
  builderiq: (feature: string = 'blueprint-standard') => trackCost({
    category: 'builderiq',
    feature,
    provider: 'openai',
    model: 'gpt-4o',
  }),

  // Academy
  academy: (feature: string = 'playground-run') => trackCost({
    category: 'academy',
    feature,
    skipTokenDeduction: feature === 'playground-run',
  }),
};

export default {
  trackCost,
  preCheckTokens,
  deductTokens,
  getUserUsageStats,
  getSystemCostStats,
  costMiddleware,
};
