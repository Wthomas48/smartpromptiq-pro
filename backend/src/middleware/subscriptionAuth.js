/**
 * Subscription Authentication Middleware - Enhanced auth with subscription and cost checks
 */

const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const costProtection = require('../utils/costProtection');
const tokenManager = require('../utils/tokenManager');
const { SUBSCRIPTION_TIERS } = require('../../../shared/pricing/pricingConfig');

/**
 * Enhanced authentication middleware that includes subscription validation
 */
async function authenticateWithSubscription(req, res, next) {
  try {
    // First, run standard authentication
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        tokenBalance: true,
        monthlyTokensUsed: true,
        monthlyResetDate: true,
        isActive: true,
        suspensionReason: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.',
        code: 'INVALID_USER'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account suspended',
        message: user.suspensionReason || 'Your account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Check email verification for free tier users
    const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;
    if (tierInfo.rateLimits.requireEmailVerification && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email verification required',
        message: 'Please verify your email address to continue using the service.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check subscription status
    if (user.subscriptionStatus && ['past_due', 'unpaid', 'incomplete'].includes(user.subscriptionStatus)) {
      return res.status(402).json({
        success: false,
        error: 'Payment required',
        message: 'Your subscription payment is overdue. Please update your payment method.',
        code: 'PAYMENT_REQUIRED',
        redirectUrl: '/billing'
      });
    }

    // Check subscription expiration
    if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
      // Auto-downgrade to free tier if subscription expired
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: 'free',
          subscriptionStatus: 'expired'
        }
      });
      
      user.subscriptionTier = 'free';
      user.subscriptionStatus = 'expired';
    }

    // Handle monthly token reset for subscription users
    if (user.subscriptionTier !== 'free' && user.monthlyResetDate < new Date()) {
      await tokenManager.handleMonthlyRollover(user.id);
      
      // Refresh user data after rollover
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          monthlyTokensUsed: true,
          monthlyResetDate: true,
          tokenBalance: true
        }
      });
      
      Object.assign(user, updatedUser);
    }

    // Attach user and subscription info to request
    req.user = user;
    req.subscription = {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      limits: tierInfo,
      tokenBalance: user.tokenBalance,
      monthlyUsage: user.monthlyTokensUsed
    };

    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Middleware to require specific subscription tiers
 */
function requireTier(...allowedTiers) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedTiers.includes(req.user.subscriptionTier)) {
      const tierInfo = SUBSCRIPTION_TIERS[req.user.subscriptionTier] || SUBSCRIPTION_TIERS.free;
      
      return res.status(403).json({
        success: false,
        error: 'Subscription upgrade required',
        message: `This feature requires a ${allowedTiers.join(' or ')} subscription. You currently have ${req.user.subscriptionTier}.`,
        code: 'TIER_UPGRADE_REQUIRED',
        currentTier: req.user.subscriptionTier,
        requiredTiers: allowedTiers,
        upgradeUrl: '/billing'
      });
    }

    next();
  };
}

/**
 * Middleware to check token availability before operations
 */
function requireTokens(tokensNeeded = 1, complexity = 'standard') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const availability = await tokenManager.checkTokenAvailability(
        req.user.id, 
        tokensNeeded, 
        complexity
      );

      if (!availability.available) {
        return res.status(402).json({
          success: false,
          error: availability.error,
          message: getTokenErrorMessage(availability),
          code: 'INSUFFICIENT_TOKENS',
          details: availability,
          upgradeUrl: '/billing'
        });
      }

      // Store token requirement for later use
      req.tokenRequirement = {
        tokens: availability.tokensNeeded,
        complexity,
        userBalance: availability.userBalance
      };

      next();

    } catch (error) {
      console.error('Token check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check token availability',
        code: 'TOKEN_CHECK_ERROR'
      });
    }
  };
}

/**
 * Middleware to perform cost protection checks before expensive operations
 */
function checkCostProtection(complexity = 'standard', model = 'gpt3_5_turbo') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const safetyCheck = await costProtection.checkOperationSafety(req.user.id, {
        complexity,
        model,
        estimatedTokens: req.tokenRequirement?.tokens
      });

      if (!safetyCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: safetyCheck.reason,
          message: safetyCheck.message,
          recommendation: safetyCheck.recommendation,
          code: 'COST_PROTECTION',
          details: safetyCheck.data
        });
      }

      // Store cost data for logging
      req.costProtection = {
        operationCost: safetyCheck.costData?.operationCost,
        warning: safetyCheck.warning,
        costRatio: safetyCheck.costData?.costRatio
      };

      next();

    } catch (error) {
      console.error('Cost protection error:', error);
      // Allow operation to proceed on error, but log it
      req.costProtection = { error: error.message };
      next();
    }
  };
}

/**
 * Middleware for admin-only routes
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
}

/**
 * Middleware to track API usage
 */
function trackApiUsage(req, res, next) {
  const startTime = Date.now();
  
  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Track usage asynchronously
    if (req.user) {
      const usageAnalytics = require('../utils/usageAnalytics');
      usageAnalytics.trackAPIUsage(req.user.id, {
        endpoint: req.path,
        method: req.method,
        responseTime,
        success,
        errorCode: success ? null : res.statusCode
      }).catch(error => {
        console.error('Error tracking API usage:', error);
      });
    }
    
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Helper function to generate user-friendly token error messages
 */
function getTokenErrorMessage(availability) {
  switch (availability.error) {
    case 'Insufficient tokens':
      return `You need ${availability.needed} tokens but only have ${availability.current}. Purchase more tokens or upgrade your plan.`;
    
    case 'Monthly token limit exceeded':
      const resetDate = new Date(availability.resetDate).toLocaleDateString();
      return `You've used ${availability.monthlyUsed} of your ${availability.monthlyLimit} monthly tokens. Your limit resets on ${resetDate}.`;
    
    case 'Account is suspended':
      return 'Your account has been suspended. Please contact support for assistance.';
    
    default:
      return availability.error || 'Token check failed';
  }
}

/**
 * Create a combined middleware stack for prompt generation endpoints
 */
function createPromptMiddleware(complexity = 'standard', model = 'gpt3_5_turbo') {
  return [
    authenticateWithSubscription,
    trackApiUsage,
    requireTokens(1, complexity),
    checkCostProtection(complexity, model)
  ];
}

module.exports = {
  authenticateWithSubscription,
  requireTier,
  requireTokens,
  checkCostProtection,
  requireAdmin,
  trackApiUsage,
  createPromptMiddleware
};