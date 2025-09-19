/**
 * Subscription Authentication Middleware - Enhanced auth with subscription and cost checks
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { SUBSCRIPTION_TIERS } from '../../../shared/pricing/pricingConfig';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionEndDate?: Date;
    tokenBalance: number;
    monthlyTokensUsed: number;
    monthlyResetDate?: Date;
    isActive: boolean;
    suspensionReason?: string;
    emailVerified: boolean;
  };
}

/**
 * Enhanced authentication middleware that includes subscription validation
 */
export async function authenticateWithSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

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
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
        reason: user.suspensionReason
      });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check subscription status
    const now = new Date();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      return res.status(403).json({
        success: false,
        error: 'Subscription expired',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Reset monthly tokens if needed
    if (user.monthlyResetDate && user.monthlyResetDate <= now) {
      const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyTokensUsed: 0,
          monthlyResetDate: nextResetDate
        }
      });
      user.monthlyTokensUsed = 0;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error: any) {
    console.error('Authentication error:', error);

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

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Middleware to require minimum tokens for an operation
 */
export function requireTokens(minTokens: number, operationType: string = 'general') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user has enough tokens
    if (user.tokenBalance < minTokens) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient token balance',
        code: 'INSUFFICIENT_TOKENS',
        required: minTokens,
        available: user.tokenBalance,
        operationType
      });
    }

    next();
  };
}

/**
 * Middleware to track API usage and deduct tokens
 */
export function trackApiUsage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Store original send method
  const originalSend = res.send;

  // Override send method to track usage after successful response
  res.send = function(body: any) {
    const user = req.user;

    // Only track if request was successful and user is authenticated
    if (res.statusCode < 400 && user) {
      // Async token deduction (don't block the response)
      setImmediate(async () => {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tokenBalance: { decrement: 1 },
              monthlyTokensUsed: { increment: 1 }
            }
          });
        } catch (error) {
          console.error('Failed to track API usage:', error);
        }
      });
    }

    // Call original send method
    return originalSend.call(this, body);
  };

  next();
}

/**
 * Middleware to check feature access based on subscription tier
 */
export function requireSubscriptionTier(requiredTier: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userTierConfig = SUBSCRIPTION_TIERS[user.subscriptionTier];
    const requiredTierConfig = SUBSCRIPTION_TIERS[requiredTier];

    if (!userTierConfig || !requiredTierConfig) {
      return res.status(500).json({
        success: false,
        error: 'Invalid subscription tier configuration',
        code: 'INVALID_TIER_CONFIG'
      });
    }

    // Check if user's tier has sufficient access level
    if (userTierConfig.priority < requiredTierConfig.priority) {
      return res.status(403).json({
        success: false,
        error: 'Subscription upgrade required',
        code: 'UPGRADE_REQUIRED',
        currentTier: user.subscriptionTier,
        requiredTier: requiredTier
      });
    }

    next();
  };
}