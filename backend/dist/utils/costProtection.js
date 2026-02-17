/**
 * Cost Protection - Real-time cost monitoring and user protection
 */

const prisma = require('../config/database');
const costCalculator = require('./costCalculator');
const usageAnalytics = require('./usageAnalytics');
const { COST_PROTECTION, SUBSCRIPTION_TIERS } = require('../../../shared/pricing/pricingConfig');

class CostProtection {
  constructor() {
    this.alertThresholds = new Map(); // Per-user alert thresholds
    this.setupMonitoring();
  }

  /**
   * Check if a user operation is safe from cost perspective
   */
  async checkOperationSafety(userId, operation) {
    try {
      const { 
        complexity = 'standard', 
        model = 'gpt3_5_turbo',
        estimatedTokens 
      } = operation;

      // Get user's current financial standing
      const userCostData = await this.getUserCostData(userId);
      
      // Estimate cost of this operation
      const operationCost = costCalculator.estimatePromptCost(complexity, model);
      
      // Project new totals
      const projectedMonthlyCosts = userCostData.monthlyCosts + operationCost.totalCostInCents;
      const monthlyRevenue = userCostData.monthlyRevenue;
      
      // Check against safety thresholds
      const safetyCheck = costCalculator.checkCostSafety(
        projectedMonthlyCosts,
        monthlyRevenue,
        userCostData.tier
      );

      // If operation would put user in danger zone
      if (safetyCheck.isCritical) {
        await this.handleCriticalCost(userId, {
          currentCosts: userCostData.monthlyCosts,
          projectedCosts: projectedMonthlyCosts,
          revenue: monthlyRevenue,
          operation
        });

        return {
          allowed: false,
          reason: 'COST_PROTECTION',
          message: 'Operation blocked: would exceed safe cost limits',
          recommendation: 'Please upgrade your plan or contact support',
          data: {
            currentCosts: userCostData.monthlyCosts,
            projectedCosts: projectedMonthlyCosts,
            costRatio: safetyCheck.costRatio,
            operationCost: operationCost.totalCostInCents
          }
        };
      }

      // If approaching warning threshold
      if (safetyCheck.isWarning) {
        await this.handleWarningLevel(userId, {
          currentCosts: userCostData.monthlyCosts,
          projectedCosts: projectedMonthlyCosts,
          revenue: monthlyRevenue,
          operation
        });
      }

      return {
        allowed: true,
        warning: safetyCheck.isWarning,
        costData: {
          operationCost: operationCost.totalCostInCents,
          monthlyCosts: projectedMonthlyCosts,
          costRatio: safetyCheck.costRatio,
          margin: safetyCheck.margin
        }
      };

    } catch (error) {
      console.error('Error checking operation safety:', error);
      
      // Fail safe - allow operation but log error
      return {
        allowed: true,
        error: 'Cost check failed, allowing operation',
        details: error.message
      };
    }
  }

  /**
   * Get comprehensive cost data for a user
   */
  async getUserCostData(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          monthlyTokensUsed: true,
          monthlyResetDate: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate monthly revenue based on subscription
      const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;
      const monthlyRevenue = tierInfo.priceInCents || 0;

      // Get monthly cost projection
      const costProjection = costCalculator.calculateMonthlyCostProjection({
        promptsGenerated: user.monthlyTokensUsed,
        averageComplexity: 'standard' // Could be calculated from user history
      }, user.subscriptionTier);

      return {
        userId,
        tier: user.subscriptionTier,
        monthlyRevenue,
        monthlyCosts: costProjection.totalCostInCents,
        monthlyTokensUsed: user.monthlyTokensUsed,
        costBreakdown: costProjection.breakdown,
        resetDate: user.monthlyResetDate
      };

    } catch (error) {
      console.error('Error getting user cost data:', error);
      throw error;
    }
  }

  /**
   * Handle critical cost level - block user operations
   */
  async handleCriticalCost(userId, costData) {
    try {
      // Log the critical cost event
      await usageAnalytics.recordAnalyticsEvent(
        userId,
        'critical_cost_threshold',
        'cost_protection',
        costData.projectedCosts,
        {
          currentCosts: costData.currentCosts,
          projectedCosts: costData.projectedCosts,
          revenue: costData.revenue,
          costRatio: costData.projectedCosts / costData.revenue,
          operation: costData.operation,
          timestamp: new Date()
        }
      );

      // Temporarily suspend user to prevent further costs
      await prisma.user.update({
        where: { id: userId },
        data: {
          suspensionReason: 'Cost protection - usage costs exceed safe limits',
          isActive: false
        }
      });

      // Send alert to admin
      await this.sendAdminAlert('CRITICAL_COST', {
        userId,
        costData,
        action: 'USER_SUSPENDED'
      });

      console.log(`CRITICAL: User ${userId} suspended due to cost protection. Costs: ${costData.projectedCosts}, Revenue: ${costData.revenue}`);

    } catch (error) {
      console.error('Error handling critical cost:', error);
    }
  }

  /**
   * Handle warning level costs
   */
  async handleWarningLevel(userId, costData) {
    try {
      // Check if we've already warned this user recently
      const lastWarning = await prisma.analytics.findFirst({
        where: {
          userId,
          event: 'cost_warning_sent',
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      });

      if (lastWarning) {
        return; // Don't spam warnings
      }

      // Log the warning
      await usageAnalytics.recordAnalyticsEvent(
        userId,
        'cost_warning_sent',
        'cost_protection',
        costData.projectedCosts,
        {
          currentCosts: costData.currentCosts,
          projectedCosts: costData.projectedCosts,
          revenue: costData.revenue,
          costRatio: costData.projectedCosts / costData.revenue,
          threshold: COST_PROTECTION.maxCostPercentageOfPayment
        }
      );

      // Here you could send email/notification to user
      console.log(`WARNING: User ${userId} approaching cost limits. Costs: ${costData.projectedCosts}, Revenue: ${costData.revenue}`);

    } catch (error) {
      console.error('Error handling warning level:', error);
    }
  }

  /**
   * Monitor system-wide cost safety
   */
  async performSystemCostAudit() {
    try {
      const users = await prisma.user.findMany({
        where: {
          subscriptionTier: { not: 'free' },
          isActive: true
        },
        select: {
          id: true,
          subscriptionTier: true,
          monthlyTokensUsed: true,
          email: true
        }
      });

      const auditResults = {
        totalUsers: users.length,
        warnings: [],
        critical: [],
        suspended: [],
        healthy: 0,
        auditTime: new Date()
      };

      for (const user of users) {
        try {
          const costData = await this.getUserCostData(user.id);
          const safetyCheck = costCalculator.checkCostSafety(
            costData.monthlyCosts,
            costData.monthlyRevenue,
            costData.tier
          );

          if (safetyCheck.isCritical) {
            auditResults.critical.push({
              userId: user.id,
              email: user.email,
              tier: user.subscriptionTier,
              costRatio: safetyCheck.costRatio,
              costs: costData.monthlyCosts,
              revenue: costData.monthlyRevenue
            });

            // Auto-suspend if not already suspended
            const userRecord = await prisma.user.findUnique({
              where: { id: user.id },
              select: { isActive: true }
            });

            if (userRecord.isActive) {
              await this.handleCriticalCost(user.id, {
                currentCosts: costData.monthlyCosts,
                projectedCosts: costData.monthlyCosts,
                revenue: costData.monthlyRevenue,
                operation: { type: 'audit_suspension' }
              });
              auditResults.suspended.push(user.id);
            }

          } else if (safetyCheck.isWarning) {
            auditResults.warnings.push({
              userId: user.id,
              email: user.email,
              tier: user.subscriptionTier,
              costRatio: safetyCheck.costRatio,
              costs: costData.monthlyCosts,
              revenue: costData.monthlyRevenue
            });
          } else {
            auditResults.healthy++;
          }

        } catch (userError) {
          console.error(`Error auditing user ${user.id}:`, userError);
        }
      }

      // Log audit results
      console.log('Cost audit completed:', {
        total: auditResults.totalUsers,
        healthy: auditResults.healthy,
        warnings: auditResults.warnings.length,
        critical: auditResults.critical.length,
        suspended: auditResults.suspended.length
      });

      // Send admin report if there are issues
      if (auditResults.warnings.length > 0 || auditResults.critical.length > 0) {
        await this.sendAdminAlert('COST_AUDIT_REPORT', auditResults);
      }

      return auditResults;

    } catch (error) {
      console.error('Error performing system cost audit:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate profit margins across user base
   */
  async calculateSystemMargins() {
    try {
      const tiers = ['starter', 'pro', 'business', 'enterprise'];
      const marginReport = {};

      for (const tier of tiers) {
        const users = await prisma.user.findMany({
          where: { subscriptionTier: tier },
          select: {
            id: true,
            monthlyTokensUsed: true
          }
        });

        if (users.length === 0) continue;

        const tierInfo = SUBSCRIPTION_TIERS[tier];
        const monthlyRevenue = tierInfo.priceInCents * users.length;
        let totalCosts = 0;

        for (const user of users) {
          const costProjection = costCalculator.calculateMonthlyCostProjection({
            promptsGenerated: user.monthlyTokensUsed
          }, tier);
          totalCosts += costProjection.totalCostInCents;
        }

        const margin = monthlyRevenue > 0 ? (monthlyRevenue - totalCosts) / monthlyRevenue : 0;
        const profitMultiplier = totalCosts > 0 ? monthlyRevenue / totalCosts : Infinity;

        marginReport[tier] = {
          users: users.length,
          monthlyRevenue,
          totalCosts,
          profit: monthlyRevenue - totalCosts,
          marginPercentage: Math.round(margin * 100),
          profitMultiplier: Math.round(profitMultiplier * 100) / 100,
          averageRevenuePerUser: Math.round(monthlyRevenue / users.length),
          averageCostPerUser: Math.round(totalCosts / users.length)
        };
      }

      return {
        success: true,
        margins: marginReport,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error calculating system margins:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send alerts to admin dashboard/notifications
   */
  async sendAdminAlert(type, data) {
    try {
      // Create admin alert record
      await prisma.analytics.create({
        data: {
          userId: 'system', // System-generated event
          event: 'admin_alert',
          category: 'cost_protection',
          value: 1,
          metadata: JSON.stringify({
            alertType: type,
            data,
            timestamp: new Date()
          })
        }
      });

      // Here you could integrate with Slack, email, PagerDuty, etc.
      console.log(`ADMIN ALERT [${type}]:`, JSON.stringify(data, null, 2));

    } catch (error) {
      console.error('Error sending admin alert:', error);
    }
  }

  /**
   * Setup automated monitoring
   */
  setupMonitoring() {
    // Run cost audit every 4 hours
    setInterval(async () => {
      try {
        await this.performSystemCostAudit();
      } catch (error) {
        console.error('Scheduled cost audit error:', error);
      }
    }, 4 * 60 * 60 * 1000);

    // Calculate system margins daily
    setInterval(async () => {
      try {
        const margins = await this.calculateSystemMargins();
        if (margins.success) {
          console.log('Daily margin report:', margins);
        }
      } catch (error) {
        console.error('Daily margin calculation error:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Manually override cost protection for a user (admin only)
   */
  async overrideCostProtection(userId, override) {
    try {
      const { 
        reason, 
        adminUserId, 
        temporaryLimit, 
        expiresAt 
      } = override;

      // Log the override
      await usageAnalytics.recordAnalyticsEvent(
        userId,
        'cost_protection_override',
        'admin',
        temporaryLimit || 0,
        {
          reason,
          adminUserId,
          temporaryLimit,
          expiresAt,
          timestamp: new Date()
        }
      );

      // Reactivate user if suspended
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          suspensionReason: null
        }
      });

      console.log(`Cost protection overridden for user ${userId} by admin ${adminUserId}. Reason: ${reason}`);

      return {
        success: true,
        message: 'Cost protection override applied',
        userId,
        adminUserId,
        reason
      };

    } catch (error) {
      console.error('Error overriding cost protection:', error);
      throw error;
    }
  }

  /**
   * Get cost protection status for a user
   */
  async getCostProtectionStatus(userId) {
    try {
      const costData = await this.getUserCostData(userId);
      const safetyCheck = costCalculator.checkCostSafety(
        costData.monthlyCosts,
        costData.monthlyRevenue,
        costData.tier
      );

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          isActive: true, 
          suspensionReason: true 
        }
      });

      return {
        userId,
        isActive: user.isActive,
        suspensionReason: user.suspensionReason,
        costData: {
          monthlyCosts: costData.monthlyCosts,
          monthlyRevenue: costData.monthlyRevenue,
          costRatio: safetyCheck.costRatio,
          margin: safetyCheck.margin
        },
        status: {
          level: safetyCheck.isCritical ? 'CRITICAL' : safetyCheck.isWarning ? 'WARNING' : 'HEALTHY',
          isWarning: safetyCheck.isWarning,
          isCritical: safetyCheck.isCritical,
          marginTooLow: safetyCheck.marginTooLow
        },
        recommendation: safetyCheck.recommendation
      };

    } catch (error) {
      console.error('Error getting cost protection status:', error);
      throw error;
    }
  }
}

module.exports = new CostProtection();