/**
 * Token Manager - Handles token operations, expiration, and rollover
 */

const prisma = require('../config/database');
const { SUBSCRIPTION_TIERS, TOKEN_CONSUMPTION } = require('../../../shared/pricing/pricingConfig');
const usageAnalytics = require('./usageAnalytics');

class TokenManager {
  constructor() {
    this.setupPeriodicCleanup();
  }

  /**
   * Check if user has sufficient tokens for an operation
   */
  async checkTokenAvailability(userId, tokensNeeded, complexity = 'standard') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          tokenBalance: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          monthlyTokensUsed: true,
          monthlyResetDate: true,
          isActive: true
        }
      });

      if (!user) {
        return { 
          available: false, 
          error: 'User not found' 
        };
      }

      if (!user.isActive) {
        return { 
          available: false, 
          error: 'Account is suspended' 
        };
      }

      // Calculate actual tokens needed based on complexity
      const actualTokensNeeded = TOKEN_CONSUMPTION[complexity] || tokensNeeded;
      const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;

      // Check if user has enough tokens
      if (user.tokenBalance < actualTokensNeeded) {
        return {
          available: false,
          error: 'Insufficient tokens',
          needed: actualTokensNeeded,
          current: user.tokenBalance,
          shortfall: actualTokensNeeded - user.tokenBalance
        };
      }

      // Check monthly limits for subscription users
      if (tierInfo.tokensPerMonth !== -1) {
        const monthlyRemaining = tierInfo.tokensPerMonth - user.monthlyTokensUsed;
        
        if (monthlyRemaining < actualTokensNeeded) {
          return {
            available: false,
            error: 'Monthly token limit exceeded',
            monthlyLimit: tierInfo.tokensPerMonth,
            monthlyUsed: user.monthlyTokensUsed,
            monthlyRemaining,
            resetDate: user.monthlyResetDate
          };
        }
      }

      return {
        available: true,
        tokensNeeded: actualTokensNeeded,
        userBalance: user.tokenBalance,
        monthlyRemaining: tierInfo.tokensPerMonth === -1 ? -1 : tierInfo.tokensPerMonth - user.monthlyTokensUsed
      };

    } catch (error) {
      console.error('Error checking token availability:', error);
      return { 
        available: false, 
        error: 'Failed to check token availability' 
      };
    }
  }

  /**
   * Consume tokens for an operation
   */
  async consumeTokens(userId, operation) {
    const {
      complexity = 'standard',
      category,
      model,
      description,
      metadata = {}
    } = operation;

    try {
      // Get current user state
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const tokensToConsume = TOKEN_CONSUMPTION[complexity];
      const availability = await this.checkTokenAvailability(userId, tokensToConsume, complexity);

      if (!availability.available) {
        throw new Error(availability.error);
      }

      // Create transaction record
      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          type: 'usage',
          tokens: -tokensToConsume, // Negative for consumption
          balanceBefore: user.tokenBalance,
          balanceAfter: user.tokenBalance - tokensToConsume,
          promptComplexity: complexity,
          model,
          category,
          description: description || `Used ${tokensToConsume} tokens for ${complexity} prompt`,
          metadata: JSON.stringify(metadata)
        }
      });

      // Update user balance and monthly usage
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { decrement: tokensToConsume },
          tokensUsed: { increment: tokensToConsume },
          monthlyTokensUsed: { increment: tokensToConsume }
        }
      });

      // Check if user needs a low balance warning
      const newBalance = user.tokenBalance - tokensToConsume;
      if (newBalance <= 5 && user.tokenBalance > 5) {
        await this.sendLowBalanceWarning(userId, newBalance);
      }

      return {
        success: true,
        transactionId: transaction.id,
        tokensConsumed: tokensToConsume,
        newBalance: newBalance,
        operation: {
          complexity,
          category,
          model
        }
      };

    } catch (error) {
      console.error('Error consuming tokens:', error);
      throw error;
    }
  }

  /**
   * Add tokens to user balance (purchase, bonus, rollover)
   */
  async addTokens(userId, operation) {
    const {
      tokens,
      type = 'bonus', // purchase, bonus, rollover, refund
      description,
      expiresAt,
      costInCents,
      packageType,
      stripePaymentIntentId,
      metadata = {}
    } = operation;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create transaction record
      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          type,
          tokens,
          balanceBefore: user.tokenBalance,
          balanceAfter: user.tokenBalance + tokens,
          costInCents,
          packageType,
          stripePaymentIntentId,
          expiresAt,
          description: description || `Added ${tokens} tokens (${type})`,
          metadata: JSON.stringify(metadata)
        }
      });

      // Update user balance
      const updateData = {
        tokenBalance: { increment: tokens }
      };

      if (type === 'purchase') {
        updateData.tokensPurchased = { increment: tokens };
        updateData.lastTokenPurchase = new Date();
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      return {
        success: true,
        transactionId: transaction.id,
        tokensAdded: tokens,
        newBalance: user.tokenBalance + tokens,
        expiresAt
      };

    } catch (error) {
      console.error('Error adding tokens:', error);
      throw error;
    }
  }

  /**
   * Handle monthly token rollover for subscription users
   */
  async handleMonthlyRollover(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return;

      const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier];
      if (!tierInfo || tierInfo.tokensPerMonth <= 0) return;

      const now = new Date();
      const shouldReset = user.monthlyResetDate <= now;

      if (!shouldReset) return;

      // Calculate unused tokens from current month
      const unusedTokens = Math.max(0, tierInfo.tokensPerMonth - user.monthlyTokensUsed);
      const maxRollover = tierInfo.maxTokenRollover === -1 ? unusedTokens : tierInfo.maxTokenRollover;
      const rolloverTokens = Math.min(unusedTokens, maxRollover);

      // Reset monthly usage counter
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyTokensUsed: 0,
          monthlyResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) // First of next month
        }
      });

      // Add rollover tokens if any
      if (rolloverTokens > 0) {
        await this.addTokens(userId, {
          tokens: rolloverTokens,
          type: 'rollover',
          description: `Monthly rollover: ${rolloverTokens} tokens`,
          expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

        console.log(`Monthly rollover for user ${userId}: ${rolloverTokens} tokens`);
      }

      return {
        reset: true,
        rolloverTokens,
        nextResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };

    } catch (error) {
      console.error('Error handling monthly rollover:', error);
      return { reset: false, error: error.message };
    }
  }

  /**
   * Expire old tokens
   */
  async expireTokens() {
    try {
      const now = new Date();
      
      // Find expired token transactions
      const expiredTransactions = await prisma.tokenTransaction.findMany({
        where: {
          expiresAt: { lte: now },
          isExpired: false,
          tokens: { gt: 0 } // Only positive transactions (purchases/credits)
        }
      });

      console.log(`Found ${expiredTransactions.length} expired token transactions`);

      for (const transaction of expiredTransactions) {
        // Mark as expired
        await prisma.tokenTransaction.update({
          where: { id: transaction.id },
          data: { isExpired: true }
        });

        // Remove tokens from user balance
        const user = await prisma.user.findUnique({
          where: { id: transaction.userId }
        });

        if (user && user.tokenBalance >= transaction.tokens) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: {
              tokenBalance: { decrement: transaction.tokens }
            }
          });

          // Create expiration transaction record
          await prisma.tokenTransaction.create({
            data: {
              userId: transaction.userId,
              type: 'expiration',
              tokens: -transaction.tokens,
              balanceBefore: user.tokenBalance,
              balanceAfter: user.tokenBalance - transaction.tokens,
              description: `${transaction.tokens} tokens expired from ${transaction.packageType || 'purchase'}`,
              metadata: JSON.stringify({
                originalTransactionId: transaction.id,
                expiredAt: now
              })
            }
          });

          console.log(`Expired ${transaction.tokens} tokens for user ${transaction.userId}`);
        }
      }

      return {
        success: true,
        expiredTransactions: expiredTransactions.length,
        expiredAt: now
      };

    } catch (error) {
      console.error('Error expiring tokens:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's token balance breakdown
   */
  async getTokenBalance(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          tokenBalance: true,
          subscriptionTier: true,
          monthlyTokensUsed: true,
          monthlyResetDate: true,
          tokensUsed: true,
          tokensPurchased: true,
          lastTokenPurchase: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get active (non-expired) token purchases
      const activeTokens = await prisma.tokenTransaction.findMany({
        where: {
          userId,
          type: 'purchase',
          isExpired: false,
          tokens: { gt: 0 },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        select: {
          tokens: true,
          expiresAt: true,
          packageType: true,
          createdAt: true
        },
        orderBy: { expiresAt: 'asc' }
      });

      const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;
      
      // Calculate monthly allowance remaining
      const monthlyAllowance = tierInfo.tokensPerMonth === -1 ? -1 : tierInfo.tokensPerMonth - user.monthlyTokensUsed;

      return {
        totalBalance: user.tokenBalance,
        subscriptionTier: user.subscriptionTier,
        monthly: {
          used: user.monthlyTokensUsed,
          limit: tierInfo.tokensPerMonth,
          remaining: monthlyAllowance,
          resetDate: user.monthlyResetDate
        },
        purchased: {
          active: activeTokens,
          totalPurchased: user.tokensPurchased,
          lastPurchase: user.lastTokenPurchase
        },
        lifetime: {
          used: user.tokensUsed,
          purchased: user.tokensPurchased,
          balance: user.tokenBalance
        }
      };

    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  /**
   * Send low balance warning
   */
  async sendLowBalanceWarning(userId, currentBalance) {
    try {
      await usageAnalytics.recordAnalyticsEvent(
        userId,
        'low_token_balance',
        'usage',
        currentBalance,
        {
          balance: currentBalance,
          threshold: 5,
          timestamp: new Date()
        }
      );

      // Here you could integrate with email service, push notifications, etc.
      console.log(`Low balance warning for user ${userId}: ${currentBalance} tokens remaining`);

    } catch (error) {
      console.error('Error sending low balance warning:', error);
    }
  }

  /**
   * Setup periodic cleanup tasks
   */
  setupPeriodicCleanup() {
    // Expire tokens every hour
    setInterval(async () => {
      try {
        await this.expireTokens();
        console.log('Token expiration cleanup completed');
      } catch (error) {
        console.error('Token expiration cleanup error:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    // Handle monthly rollovers every day at midnight
    setInterval(async () => {
      try {
        const users = await prisma.user.findMany({
          where: {
            subscriptionTier: { not: 'free' },
            subscriptionStatus: 'active',
            monthlyResetDate: { lte: new Date() }
          },
          select: { id: true }
        });

        for (const user of users) {
          await this.handleMonthlyRollover(user.id);
        }

        console.log(`Monthly rollover completed for ${users.length} users`);
      } catch (error) {
        console.error('Monthly rollover error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  /**
   * Calculate token cost for operation
   */
  calculateTokenCost(complexity, quantity = 1) {
    const baseTokens = TOKEN_CONSUMPTION[complexity] || TOKEN_CONSUMPTION.standard;
    return baseTokens * quantity;
  }

  /**
   * Bulk token operations for admin
   */
  async bulkTokenOperation(operations) {
    const results = [];
    
    for (const operation of operations) {
      try {
        if (operation.type === 'add') {
          const result = await this.addTokens(operation.userId, operation.data);
          results.push({ success: true, userId: operation.userId, result });
        } else if (operation.type === 'consume') {
          const result = await this.consumeTokens(operation.userId, operation.data);
          results.push({ success: true, userId: operation.userId, result });
        }
      } catch (error) {
        results.push({ 
          success: false, 
          userId: operation.userId, 
          error: error.message 
        });
      }
    }

    return results;
  }
}

module.exports = new TokenManager();