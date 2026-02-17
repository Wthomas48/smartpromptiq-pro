/**
 * Cost Calculator - Handles real-time cost tracking and margin calculations
 * All monetary values are in cents to avoid floating point errors
 */

const { API_COSTS, TOKEN_CONSUMPTION, COST_PROTECTION } = require('../../../shared/pricing/pricingConfig');

class CostCalculator {
  constructor() {
    this.apiCosts = API_COSTS;
    this.tokenConsumption = TOKEN_CONSUMPTION;
  }

  /**
   * Calculate the estimated cost for a prompt based on complexity and model
   */
  estimatePromptCost(promptComplexity, model = 'gpt3_5_turbo') {
    const tokens = TOKEN_CONSUMPTION[promptComplexity] || TOKEN_CONSUMPTION.standard;
    
    // Base API cost estimation
    let apiCost = 0;
    if (model.startsWith('gpt')) {
      apiCost = this.apiCosts.openai[model] || this.apiCosts.openai.gpt3_5_turbo;
    } else if (model.startsWith('claude')) {
      apiCost = this.apiCosts.claude[model] || this.apiCosts.claude.sonnet;
    }

    // Add server processing cost (estimated 10% of API cost)
    const processingCost = Math.ceil(apiCost * 0.1);
    
    // Total cost including overhead
    const totalCost = apiCost + processingCost;

    return {
      tokens,
      apiCostInCents: apiCost,
      processingCostInCents: processingCost,
      totalCostInCents: totalCost,
      model,
      complexity: promptComplexity
    };
  }

  /**
   * Calculate monthly cost projection for a user
   */
  calculateMonthlyCostProjection(userUsage, userTier) {
    const {
      promptsGenerated = 0,
      apiCallsMade = 0,
      averageComplexity = 'standard',
      preferredModel = 'gpt3_5_turbo'
    } = userUsage;

    // Calculate cost per prompt
    const costPerPrompt = this.estimatePromptCost(averageComplexity, preferredModel);
    
    // Total API costs for the month
    const totalApiCosts = promptsGenerated * costPerPrompt.totalCostInCents;
    
    // Infrastructure costs (estimated $0.01 per user per month base + usage)
    const baseCostInCents = 1; // $0.01 base cost
    const usageCostInCents = Math.ceil(apiCallsMade * 0.05); // $0.0005 per API call
    const infrastructureCosts = baseCostInCents + usageCostInCents;
    
    // Customer support costs (varies by tier)
    const supportCosts = this.calculateSupportCosts(userTier);
    
    const totalCosts = totalApiCosts + infrastructureCosts + supportCosts;

    return {
      totalCostInCents: totalCosts,
      breakdown: {
        apiCosts: totalApiCosts,
        infrastructureCosts,
        supportCosts,
        costPerPrompt: costPerPrompt.totalCostInCents
      },
      projectedMonthlyUsage: {
        prompts: promptsGenerated,
        apiCalls: apiCallsMade
      }
    };
  }

  /**
   * Calculate support costs based on tier
   */
  calculateSupportCosts(tierName) {
    const supportCostsByTier = {
      free: 0,        // Community support, no cost
      starter: 10,    // $0.10 per user per month
      pro: 25,        // $0.25 per user per month  
      business: 100,  // $1.00 per user per month
      enterprise: 500 // $5.00 per user per month
    };

    return supportCostsByTier[tierName] || 0;
  }

  /**
   * Check if user costs exceed safe thresholds
   */
  checkCostSafety(userCosts, userRevenue, tierName) {
    const costRatio = userRevenue > 0 ? userCosts / userRevenue : 1;
    const margin = userRevenue > 0 ? userRevenue / userCosts : 0;
    
    const thresholds = {
      warning: costRatio >= COST_PROTECTION.maxCostPercentageOfPayment,
      critical: costRatio >= COST_PROTECTION.hardLimitPercentage,
      marginTooLow: margin < COST_PROTECTION.minimumProfitMarginMultiplier
    };

    return {
      isWarning: thresholds.warning,
      isCritical: thresholds.critical,
      marginTooLow: thresholds.marginTooLow,
      costRatio: Math.round(costRatio * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      costInCents: userCosts,
      revenueInCents: userRevenue,
      recommendation: this.getCostRecommendation(thresholds, tierName)
    };
  }

  /**
   * Get recommendations based on cost analysis
   */
  getCostRecommendation(thresholds, tierName) {
    if (thresholds.critical) {
      return {
        action: 'SUSPEND_USER',
        message: 'User costs have exceeded 70% of revenue. Account should be suspended.',
        severity: 'CRITICAL'
      };
    }
    
    if (thresholds.warning) {
      return {
        action: 'LIMIT_USAGE',
        message: 'User costs are approaching dangerous levels. Consider implementing usage restrictions.',
        severity: 'WARNING'
      };
    }
    
    if (thresholds.marginTooLow) {
      return {
        action: 'SUGGEST_UPGRADE',
        message: 'Profit margin is below target. User should be encouraged to upgrade.',
        severity: 'INFO'
      };
    }

    return {
      action: 'CONTINUE',
      message: 'Cost levels are healthy.',
      severity: 'SUCCESS'
    };
  }

  /**
   * Calculate break-even analysis for a user
   */
  calculateBreakEvenAnalysis(monthlyRevenue, currentUsage) {
    const monthlyCosts = this.calculateMonthlyCostProjection(currentUsage);
    const breakEvenRatio = monthlyRevenue / monthlyCosts.totalCostInCents;
    
    // Calculate how many prompts they can safely generate
    const safePromptCount = Math.floor(
      (monthlyRevenue * COST_PROTECTION.maxCostPercentageOfPayment) / 
      monthlyCosts.breakdown.costPerPrompt
    );

    return {
      currentMargin: breakEvenRatio,
      isBreakingEven: breakEvenRatio > 1,
      safeMonthlyPrompts: safePromptCount,
      currentMonthlyCosts: monthlyCosts.totalCostInCents,
      monthlyRevenue,
      profitInCents: monthlyRevenue - monthlyCosts.totalCostInCents
    };
  }

  /**
   * Calculate real-time cost impact of a single operation
   */
  calculateOperationCost(operation) {
    const { type, complexity, model, additionalData = {} } = operation;
    
    switch (type) {
      case 'prompt_generation':
        return this.estimatePromptCost(complexity, model);
        
      case 'api_call':
        return {
          totalCostInCents: 5, // $0.05 per API call overhead
          breakdown: { infrastructureCost: 5 }
        };
        
      case 'team_collaboration':
        return {
          totalCostInCents: 2, // $0.02 per collaboration action
          breakdown: { storageAndSync: 2 }
        };
        
      default:
        return { totalCostInCents: 1, breakdown: { unknown: 1 } };
    }
  }

  /**
   * Generate cost report for admin dashboard
   */
  generateCostReport(users, timeframe = 'monthly') {
    const totalRevenue = users.reduce((sum, user) => sum + (user.monthlyRevenue || 0), 0);
    const totalCosts = users.reduce((sum, user) => sum + (user.monthlyCosts || 0), 0);
    const averageMargin = totalRevenue / totalCosts;
    
    const tierBreakdown = {};
    const riskUsers = [];
    
    users.forEach(user => {
      const tier = user.subscriptionTier || 'free';
      if (!tierBreakdown[tier]) {
        tierBreakdown[tier] = { count: 0, revenue: 0, costs: 0 };
      }
      
      tierBreakdown[tier].count++;
      tierBreakdown[tier].revenue += user.monthlyRevenue || 0;
      tierBreakdown[tier].costs += user.monthlyCosts || 0;
      
      // Identify high-risk users
      const safety = this.checkCostSafety(user.monthlyCosts || 0, user.monthlyRevenue || 0, tier);
      if (safety.isWarning || safety.isCritical) {
        riskUsers.push({
          userId: user.id,
          email: user.email,
          tier,
          costRatio: safety.costRatio,
          severity: safety.isCritical ? 'CRITICAL' : 'WARNING'
        });
      }
    });

    return {
      summary: {
        totalRevenueInCents: totalRevenue,
        totalCostsInCents: totalCosts,
        profitInCents: totalRevenue - totalCosts,
        averageMargin: Math.round(averageMargin * 100) / 100,
        totalUsers: users.length,
        timeframe
      },
      tierBreakdown,
      riskUsers,
      recommendations: this.generateBusinessRecommendations(tierBreakdown, averageMargin)
    };
  }

  /**
   * Generate business recommendations based on cost analysis
   */
  generateBusinessRecommendations(tierBreakdown, averageMargin) {
    const recommendations = [];
    
    if (averageMargin < 2) {
      recommendations.push({
        type: 'PRICING_ADJUSTMENT',
        message: 'Overall margin is below 2x. Consider increasing prices or reducing costs.',
        priority: 'HIGH'
      });
    }
    
    // Check each tier's profitability
    Object.entries(tierBreakdown).forEach(([tier, data]) => {
      const tierMargin = data.revenue / data.costs;
      if (tierMargin < 1.5) {
        recommendations.push({
          type: 'TIER_ADJUSTMENT',
          message: `${tier} tier has low margin (${tierMargin.toFixed(2)}x). Consider adjusting limits or pricing.`,
          priority: 'MEDIUM',
          tier
        });
      }
    });
    
    return recommendations;
  }
}

module.exports = new CostCalculator();