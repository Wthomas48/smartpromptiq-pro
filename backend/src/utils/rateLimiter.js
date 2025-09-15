/**
 * Rate Limiter - Implements tier-based rate limiting and abuse prevention
 */

const rateLimit = require('express-rate-limit');
const { SUBSCRIPTION_TIERS } = require('../../../shared/pricing/pricingConfig');
const prisma = require('../config/database');

class SmartRateLimiter {
  constructor() {
    this.limits = new Map(); // Store per-user limits
    this.setupCleanup();
  }

  /**
   * Create rate limiter middleware for different endpoints
   */
  createLimiter(type) {
    return rateLimit({
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id || req.ip;
      },
      windowMs: this.getWindowMs(type),
      max: async (req) => {
        return this.getLimit(req, type);
      },
      message: (req) => ({
        success: false,
        error: 'Rate limit exceeded',
        message: this.getRateLimitMessage(req, type),
        retryAfter: this.getRetryAfter(type)
      }),
      standardHeaders: true,
      legacyHeaders: false,
      onLimitReached: (req) => {
        this.logRateLimitExceeded(req, type);
      }
    });
  }

  /**
   * Get window duration for different limit types
   */
  getWindowMs(type) {
    const windows = {
      prompts_per_hour: 60 * 60 * 1000,      // 1 hour
      prompts_per_day: 24 * 60 * 60 * 1000,  // 24 hours
      api_calls_per_minute: 60 * 1000,       // 1 minute
      login_attempts: 15 * 60 * 1000,        // 15 minutes
      registration: 60 * 60 * 1000,          // 1 hour
      password_reset: 60 * 60 * 1000         // 1 hour
    };
    return windows[type] || 60 * 1000; // Default 1 minute
  }

  /**
   * Get rate limit based on user tier and request type
   */
  async getLimit(req, type) {
    // Default limits for non-authenticated users
    const defaultLimits = {
      prompts_per_hour: 1,
      prompts_per_day: 2,
      api_calls_per_minute: 0,
      login_attempts: 5,
      registration: 3,
      password_reset: 3
    };

    // If no user is authenticated, use default limits
    if (!req.user) {
      return defaultLimits[type] || 5;
    }

    // Get user's subscription tier
    const userTier = req.user.subscriptionTier || 'free';
    const tierInfo = SUBSCRIPTION_TIERS[userTier];

    if (!tierInfo) {
      return defaultLimits[type] || 5;
    }

    // Map rate limit types to tier limits
    const tierLimits = {
      prompts_per_hour: tierInfo.rateLimits.promptsPerHour,
      prompts_per_day: tierInfo.rateLimits.promptsPerDay,
      api_calls_per_minute: tierInfo.rateLimits.apiCallsPerMinute || 0,
      login_attempts: 10, // Higher for paid users
      registration: 1,    // Once per hour regardless of tier
      password_reset: 3   // Same for all tiers
    };

    const limit = tierLimits[type];
    return limit === -1 ? Number.MAX_SAFE_INTEGER : limit;
  }

  /**
   * Get retry after duration in seconds
   */
  getRetryAfter(type) {
    const retryTimes = {
      prompts_per_hour: 3600,      // 1 hour
      prompts_per_day: 86400,      // 24 hours
      api_calls_per_minute: 60,    // 1 minute
      login_attempts: 900,         // 15 minutes
      registration: 3600,          // 1 hour
      password_reset: 3600         // 1 hour
    };
    return retryTimes[type] || 60;
  }

  /**
   * Get user-friendly rate limit message
   */
  getRateLimitMessage(req, type) {
    const userTier = req.user?.subscriptionTier || 'free';
    
    const messages = {
      prompts_per_hour: `You've reached your hourly prompt limit. ${userTier === 'free' ? 'Upgrade to Pro for higher limits.' : 'Please wait before generating more prompts.'}`,
      prompts_per_day: `You've reached your daily prompt limit. ${userTier === 'free' ? 'Upgrade to Pro for higher limits.' : 'Your limit will reset tomorrow.'}`,
      api_calls_per_minute: 'API rate limit exceeded. Please slow down your requests.',
      login_attempts: 'Too many login attempts. Please wait before trying again.',
      registration: 'Too many registration attempts. Please wait before trying again.',
      password_reset: 'Too many password reset attempts. Please wait before trying again.'
    };

    return messages[type] || 'Rate limit exceeded. Please try again later.';
  }

  /**
   * Custom middleware for prompt generation with token checking
   */
  async promptGenerationLimiter(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to generate prompts'
      });
    }

    const userId = req.user.id;
    const userTier = req.user.subscriptionTier || 'free';
    const tierInfo = SUBSCRIPTION_TIERS[userTier];

    try {
      // Check if user has enough tokens
      if (req.user.tokenBalance <= 0 && userTier !== 'enterprise') {
        return res.status(402).json({
          success: false,
          error: 'Insufficient tokens',
          message: 'Please purchase more tokens or upgrade your subscription',
          upgradeUrl: '/billing'
        });
      }

      // Check daily and hourly limits
      const now = new Date();
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Count recent usage
      const [hourlyUsage, dailyUsage] = await Promise.all([
        this.getUserUsage(userId, hourStart),
        this.getUserUsage(userId, dayStart)
      ]);

      // Check hourly limit
      if (tierInfo.rateLimits.promptsPerHour !== -1 && 
          hourlyUsage >= tierInfo.rateLimits.promptsPerHour) {
        return res.status(429).json({
          success: false,
          error: 'Hourly limit exceeded',
          message: this.getRateLimitMessage(req, 'prompts_per_hour'),
          retryAfter: 3600 - (Math.floor((now - hourStart) / 1000)),
          upgradeUrl: userTier === 'free' ? '/billing' : null
        });
      }

      // Check daily limit
      if (tierInfo.rateLimits.promptsPerDay !== -1 && 
          dailyUsage >= tierInfo.rateLimits.promptsPerDay) {
        return res.status(429).json({
          success: false,
          error: 'Daily limit exceeded',
          message: this.getRateLimitMessage(req, 'prompts_per_day'),
          retryAfter: 86400 - (Math.floor((now - dayStart) / 1000)),
          upgradeUrl: userTier === 'free' ? '/billing' : null
        });
      }

      // Check if CAPTCHA is required for free tier
      if (tierInfo.rateLimits.requireCaptcha && !req.body.captchaToken) {
        return res.status(400).json({
          success: false,
          error: 'CAPTCHA required',
          message: 'Please complete the CAPTCHA verification'
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Allow request to proceed on error
    }
  }

  /**
   * Get user usage count for a time period
   */
  async getUserUsage(userId, since) {
    try {
      const count = await prisma.generation.count({
        where: {
          userId,
          createdAt: {
            gte: since
          }
        }
      });
      return count;
    } catch (error) {
      console.error('Error getting user usage:', error);
      return 0;
    }
  }

  /**
   * Log rate limit violations for monitoring
   */
  async logRateLimitExceeded(req, type) {
    const logData = {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      limitType: type,
      tier: req.user?.subscriptionTier || 'anonymous',
      timestamp: new Date()
    };

    console.warn('Rate limit exceeded:', logData);

    // Store in analytics for abuse detection
    if (req.user) {
      try {
        await prisma.analytics.create({
          data: {
            userId: req.user.id,
            event: 'rate_limit_exceeded',
            category: 'security',
            value: 1,
            metadata: JSON.stringify({
              limitType: type,
              endpoint: req.path
            })
          }
        });
      } catch (error) {
        console.error('Error logging rate limit violation:', error);
      }
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(userId) {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const rateLimitViolations = await prisma.analytics.count({
        where: {
          userId,
          event: 'rate_limit_exceeded',
          timestamp: { gte: last24Hours }
        }
      });

      const suspiciousThreshold = 10; // More than 10 rate limit violations in 24h
      
      if (rateLimitViolations > suspiciousThreshold) {
        // Log suspicious activity
        await prisma.analytics.create({
          data: {
            userId,
            event: 'suspicious_activity_detected',
            category: 'security',
            value: rateLimitViolations,
            metadata: JSON.stringify({
              reason: 'excessive_rate_limit_violations',
              count: rateLimitViolations
            })
          }
        });

        return {
          isSuspicious: true,
          reason: 'excessive_rate_limit_violations',
          violationCount: rateLimitViolations
        };
      }

      return { isSuspicious: false };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return { isSuspicious: false };
    }
  }

  /**
   * Setup periodic cleanup of rate limit data
   */
  setupCleanup() {
    // Clean up old rate limit logs every 24 hours
    setInterval(async () => {
      try {
        const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        
        await prisma.analytics.deleteMany({
          where: {
            event: 'rate_limit_exceeded',
            timestamp: { lt: cutoffDate }
          }
        });

        console.log('Rate limit cleanup completed');
      } catch (error) {
        console.error('Rate limit cleanup error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  /**
   * Get current rate limit status for a user
   */
  async getRateLimitStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier || 'free'];
    const now = new Date();
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [hourlyUsage, dailyUsage] = await Promise.all([
      this.getUserUsage(userId, hourStart),
      this.getUserUsage(userId, dayStart)
    ]);

    return {
      tier: user.subscriptionTier || 'free',
      limits: {
        hourly: tierInfo.rateLimits.promptsPerHour,
        daily: tierInfo.rateLimits.promptsPerDay,
        apiCallsPerMinute: tierInfo.rateLimits.apiCallsPerMinute
      },
      usage: {
        hourly: hourlyUsage,
        daily: dailyUsage
      },
      remaining: {
        hourly: Math.max(0, tierInfo.rateLimits.promptsPerHour - hourlyUsage),
        daily: Math.max(0, tierInfo.rateLimits.promptsPerDay - dailyUsage)
      },
      resetTimes: {
        hourly: new Date(hourStart.getTime() + 60 * 60 * 1000),
        daily: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      }
    };
  }
}

const rateLimiter = new SmartRateLimiter();

module.exports = {
  rateLimiter,
  promptLimiter: rateLimiter.promptGenerationLimiter.bind(rateLimiter),
  apiLimiter: rateLimiter.createLimiter('api_calls_per_minute'),
  loginLimiter: rateLimiter.createLimiter('login_attempts'),
  registrationLimiter: rateLimiter.createLimiter('registration'),
  passwordResetLimiter: rateLimiter.createLimiter('password_reset')
};