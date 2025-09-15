/**
 * Usage Analytics - Real-time usage tracking and analytics
 */

const prisma = require('../config/database');
const costCalculator = require('./costCalculator');
const { TOKEN_CONSUMPTION } = require('../../../shared/pricing/pricingConfig');

class UsageAnalytics {
  constructor() {
    this.realTimeStats = new Map(); // Cache for real-time stats
    this.setupPeriodicAggregation();
  }

  /**
   * Track a prompt generation event
   */
  async trackPromptGeneration(userId, promptData) {
    const {
      prompt,
      category,
      complexity = 'standard',
      model = 'gpt3_5_turbo',
      tokensUsed,
      responseLength,
      quality,
      projectId
    } = promptData;

    const costData = costCalculator.estimatePromptCost(complexity, model);
    
    try {
      // Record the generation
      const generation = await prisma.generation.create({
        data: {
          userId,
          projectId,
          prompt: prompt.substring(0, 1000), // Truncate for storage
          response: '', // Will be updated when response is generated
          model,
          category,
          tokenCount: tokensUsed || costData.tokens,
          cost: costData.totalCostInCents,
          quality,
          metadata: JSON.stringify({
            complexity,
            responseLength,
            ...costData
          })
        }
      });

      // Update user token balance
      await this.updateUserTokenBalance(userId, -costData.tokens);

      // Record analytics event
      await this.recordAnalyticsEvent(userId, 'prompt_generated', 'usage', costData.tokens, {
        category,
        complexity,
        model,
        cost: costData.totalCostInCents
      });

      // Update real-time cache
      this.updateRealTimeStats(userId, 'prompt_generated', costData.tokens);

      return {
        generationId: generation.id,
        tokensConsumed: costData.tokens,
        costInCents: costData.totalCostInCents
      };

    } catch (error) {
      console.error('Error tracking prompt generation:', error);
      throw error;
    }
  }

  /**
   * Track API usage
   */
  async trackAPIUsage(userId, apiData) {
    const { endpoint, method, responseTime, success, errorCode } = apiData;

    try {
      await this.recordAnalyticsEvent(userId, 'api_call', 'api', 1, {
        endpoint,
        method,
        responseTime,
        success,
        errorCode
      });

      this.updateRealTimeStats(userId, 'api_call', 1);

      // Track API costs
      const apiCost = 5; // $0.05 per API call
      await this.recordAnalyticsEvent(userId, 'api_cost', 'cost', apiCost, {
        endpoint,
        costInCents: apiCost
      });

    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }

  /**
   * Track token purchase
   */
  async trackTokenPurchase(userId, purchaseData) {
    const { tokens, amountInCents, packageType, transactionId } = purchaseData;

    try {
      // Update user token balance
      await this.updateUserTokenBalance(userId, tokens);

      // Record purchase event
      await this.recordAnalyticsEvent(userId, 'tokens_purchased', 'billing', tokens, {
        amountInCents,
        packageType,
        transactionId,
        pricePerToken: amountInCents / tokens
      });

      // Update real-time stats
      this.updateRealTimeStats(userId, 'tokens_purchased', tokens);

    } catch (error) {
      console.error('Error tracking token purchase:', error);
      throw error;
    }
  }

  /**
   * Track subscription events
   */
  async trackSubscriptionEvent(userId, eventData) {
    const { event, fromTier, toTier, amountInCents } = eventData;

    try {
      await this.recordAnalyticsEvent(userId, event, 'subscription', amountInCents, {
        fromTier,
        toTier
      });

      // Handle subscription changes
      if (event === 'subscription_upgraded' || event === 'subscription_downgraded') {
        await this.handleSubscriptionChange(userId, toTier);
      }

    } catch (error) {
      console.error('Error tracking subscription event:', error);
    }
  }

  /**
   * Record a generic analytics event
   */
  async recordAnalyticsEvent(userId, event, category, value, metadata = {}) {
    try {
      await prisma.analytics.create({
        data: {
          userId,
          event,
          category,
          value: parseFloat(value),
          metadata: JSON.stringify(metadata),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error recording analytics event:', error);
    }
  }

  /**
   * Update user token balance
   */
  async updateUserTokenBalance(userId, tokenChange) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: tokenChange
          },
          updatedAt: new Date()
        }
      });

      // Warn if balance is low
      if (user.tokenBalance <= 5 && tokenChange < 0) {
        await this.recordAnalyticsEvent(userId, 'low_token_warning', 'usage', user.tokenBalance, {
          remainingTokens: user.tokenBalance
        });
      }

      return user.tokenBalance;
    } catch (error) {
      console.error('Error updating token balance:', error);
      throw error;
    }
  }

  /**
   * Get user usage summary
   */
  async getUserUsageSummary(userId, timeframe = 'month') {
    const timeRanges = {
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    };

    const since = timeRanges[timeframe] || timeRanges.month;

    try {
      const [user, analytics, generations] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            tokenBalance: true,
            subscriptionTier: true,
            plan: true,
            generationsUsed: true,
            generationsLimit: true
          }
        }),
        prisma.analytics.findMany({
          where: {
            userId,
            timestamp: { gte: since }
          }
        }),
        prisma.generation.findMany({
          where: {
            userId,
            createdAt: { gte: since }
          },
          select: {
            tokenCount: true,
            cost: true,
            category: true,
            model: true,
            createdAt: true
          }
        })
      ]);

      // Calculate summary statistics
      const totalPrompts = generations.length;
      const totalTokensUsed = generations.reduce((sum, gen) => sum + (gen.tokenCount || 0), 0);
      const totalCost = generations.reduce((sum, gen) => sum + (gen.cost || 0), 0);

      // Category breakdown
      const categoryBreakdown = {};
      generations.forEach(gen => {
        const category = gen.category || 'unknown';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { count: 0, tokens: 0, cost: 0 };
        }
        categoryBreakdown[category].count++;
        categoryBreakdown[category].tokens += gen.tokenCount || 0;
        categoryBreakdown[category].cost += gen.cost || 0;
      });

      // Model usage
      const modelBreakdown = {};
      generations.forEach(gen => {
        const model = gen.model || 'unknown';
        modelBreakdown[model] = (modelBreakdown[model] || 0) + 1;
      });

      // Daily usage pattern
      const dailyUsage = {};
      generations.forEach(gen => {
        const day = gen.createdAt.toISOString().split('T')[0];
        if (!dailyUsage[day]) {
          dailyUsage[day] = { prompts: 0, tokens: 0, cost: 0 };
        }
        dailyUsage[day].prompts++;
        dailyUsage[day].tokens += gen.tokenCount || 0;
        dailyUsage[day].cost += gen.cost || 0;
      });

      return {
        user: {
          tokenBalance: user?.tokenBalance || 0,
          subscriptionTier: user?.subscriptionTier || 'free',
          generationsUsed: user?.generationsUsed || 0,
          generationsLimit: user?.generationsLimit || 0
        },
        usage: {
          totalPrompts,
          totalTokensUsed,
          totalCostInCents: totalCost,
          averageCostPerPrompt: totalPrompts > 0 ? totalCost / totalPrompts : 0,
          averageTokensPerPrompt: totalPrompts > 0 ? totalTokensUsed / totalPrompts : 0
        },
        breakdowns: {
          categories: categoryBreakdown,
          models: modelBreakdown,
          dailyUsage: Object.entries(dailyUsage).map(([date, stats]) => ({
            date,
            ...stats
          })).sort((a, b) => a.date.localeCompare(b.date))
        },
        timeframe,
        periodStart: since.toISOString(),
        periodEnd: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user usage summary:', error);
      throw error;
    }
  }

  /**
   * Get system-wide usage analytics for admin dashboard
   */
  async getSystemAnalytics(timeframe = 'month') {
    const timeRanges = {
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    };

    const since = timeRanges[timeframe] || timeRanges.month;

    try {
      const [totalUsers, activeUsers, generations, analytics] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            lastLogin: { gte: since }
          }
        }),
        prisma.generation.findMany({
          where: {
            createdAt: { gte: since }
          },
          select: {
            userId: true,
            tokenCount: true,
            cost: true,
            category: true,
            model: true,
            createdAt: true,
            user: {
              select: {
                subscriptionTier: true
              }
            }
          }
        }),
        prisma.analytics.findMany({
          where: {
            timestamp: { gte: since },
            category: { in: ['billing', 'usage', 'subscription'] }
          }
        })
      ]);

      // Calculate system metrics
      const totalPrompts = generations.length;
      const totalTokens = generations.reduce((sum, gen) => sum + (gen.tokenCount || 0), 0);
      const totalRevenue = analytics
        .filter(a => a.event === 'tokens_purchased')
        .reduce((sum, a) => sum + (a.value || 0), 0);
      const totalCosts = generations.reduce((sum, gen) => sum + (gen.cost || 0), 0);

      // User breakdown by tier
      const tierBreakdown = {};
      const uniqueUsers = new Set();
      
      generations.forEach(gen => {
        const tier = gen.user?.subscriptionTier || 'free';
        uniqueUsers.add(gen.userId);
        
        if (!tierBreakdown[tier]) {
          tierBreakdown[tier] = { users: new Set(), prompts: 0, tokens: 0, cost: 0 };
        }
        
        tierBreakdown[tier].users.add(gen.userId);
        tierBreakdown[tier].prompts++;
        tierBreakdown[tier].tokens += gen.tokenCount || 0;
        tierBreakdown[tier].cost += gen.cost || 0;
      });

      // Convert sets to counts
      Object.keys(tierBreakdown).forEach(tier => {
        tierBreakdown[tier].userCount = tierBreakdown[tier].users.size;
        delete tierBreakdown[tier].users;
      });

      // Top categories
      const categoryStats = {};
      generations.forEach(gen => {
        const category = gen.category || 'unknown';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

      return {
        summary: {
          totalUsers,
          activeUsers,
          userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
          totalPrompts,
          totalTokens,
          totalRevenueInCents: totalRevenue,
          totalCostsInCents: totalCosts,
          profitInCents: totalRevenue - totalCosts,
          profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
        },
        tierBreakdown,
        topCategories,
        timeframe,
        periodStart: since.toISOString(),
        periodEnd: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      throw error;
    }
  }

  /**
   * Update real-time statistics cache
   */
  updateRealTimeStats(userId, event, value) {
    if (!this.realTimeStats.has(userId)) {
      this.realTimeStats.set(userId, {
        promptsToday: 0,
        tokensUsed: 0,
        apiCalls: 0,
        lastActivity: new Date(),
        dailyReset: new Date()
      });
    }

    const stats = this.realTimeStats.get(userId);
    const now = new Date();
    
    // Reset daily counters if needed
    if (now.getDate() !== stats.dailyReset.getDate()) {
      stats.promptsToday = 0;
      stats.dailyReset = now;
    }

    // Update stats based on event
    switch (event) {
      case 'prompt_generated':
        stats.promptsToday++;
        stats.tokensUsed += value;
        break;
      case 'api_call':
        stats.apiCalls++;
        break;
    }

    stats.lastActivity = now;
  }

  /**
   * Get real-time stats for a user
   */
  getRealTimeStats(userId) {
    return this.realTimeStats.get(userId) || {
      promptsToday: 0,
      tokensUsed: 0,
      apiCalls: 0,
      lastActivity: null,
      dailyReset: new Date()
    };
  }

  /**
   * Handle subscription tier changes
   */
  async handleSubscriptionChange(userId, newTier) {
    try {
      // Update user record
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          updatedAt: new Date()
        }
      });

      // Clear real-time cache to force refresh
      this.realTimeStats.delete(userId);

    } catch (error) {
      console.error('Error handling subscription change:', error);
    }
  }

  /**
   * Setup periodic aggregation of analytics data
   */
  setupPeriodicAggregation() {
    // Aggregate daily stats every 24 hours
    setInterval(async () => {
      try {
        await this.aggregateDailyStats();
        console.log('Daily stats aggregation completed');
      } catch (error) {
        console.error('Daily aggregation error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    // Clean up old real-time cache every hour
    setInterval(() => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [userId, stats] of this.realTimeStats) {
        if (stats.lastActivity < cutoff) {
          this.realTimeStats.delete(userId);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Aggregate daily statistics for reporting
   */
  async aggregateDailyStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    try {
      // This could create daily summary records for faster reporting
      // Implementation depends on specific reporting needs
      console.log(`Aggregating stats for ${yesterday.toISOString().split('T')[0]}`);
      
      // Example: Could create DailyStats records here
      // await prisma.dailyStats.create({ ... });
      
    } catch (error) {
      console.error('Error in daily aggregation:', error);
    }
  }

  /**
   * Generate usage report for a specific user
   */
  async generateUserReport(userId, format = 'json') {
    const summary = await this.getUserUsageSummary(userId, 'month');
    
    if (format === 'csv') {
      return this.convertToCSV(summary);
    }
    
    return summary;
  }

  /**
   * Convert usage data to CSV format
   */
  convertToCSV(data) {
    const csvLines = [
      'Date,Prompts,Tokens,Cost (cents)',
      ...data.breakdowns.dailyUsage.map(day => 
        `${day.date},${day.prompts},${day.tokens},${day.cost}`
      )
    ];
    
    return csvLines.join('\n');
  }
}

module.exports = new UsageAnalytics();