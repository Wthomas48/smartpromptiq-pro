import { db } from './db';
import { storage } from './storage';
import { AICache } from './cache';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TrendingMetric {
  id: string;
  category: string;
  query: string;
  count: number;
  lastUsed: Date;
  score: number;
  growth: number;
}

interface UserInteractionPattern {
  userId: string;
  categories: Record<string, number>;
  keywords: Record<string, number>;
  timePatterns: Record<string, number>;
  complexity: number;
  successRate: number;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  personalizedScore: number;
  reason: string;
  basedOn: string[];
}

export class TrendingAnalyticsEngine {
  private interactionCache = new Map<string, UserInteractionPattern>();
  private trendingCache = new Map<string, TrendingMetric[]>();
  private lastAnalysis = new Date(0);

  async trackUserInteraction(
    userId: string,
    query: string,
    category: string,
    selectedSuggestion: string,
    success: boolean = true
  ): Promise<void> {
    const pattern = this.getUserPattern(userId);
    
    // Update category preferences
    pattern.categories[category] = (pattern.categories[category] || 0) + 1;
    
    // Update keyword tracking
    const keywords = this.extractKeywords(query);
    keywords.forEach(keyword => {
      pattern.keywords[keyword] = (pattern.keywords[keyword] || 0) + 1;
    });
    
    // Update time patterns
    const hour = new Date().getHours();
    const timeSlot = this.getTimeSlot(hour);
    pattern.timePatterns[timeSlot] = (pattern.timePatterns[timeSlot] || 0) + 1;
    
    // Update success rate
    const totalInteractions = Object.values(pattern.categories).reduce((sum, count) => sum + count, 0);
    pattern.successRate = ((pattern.successRate * (totalInteractions - 1)) + (success ? 1 : 0)) / totalInteractions;
    
    // Update complexity preference
    pattern.complexity = this.calculatePreferredComplexity(pattern);
    
    this.interactionCache.set(userId, pattern);
    
    // Update trending metrics
    await this.updateTrendingMetrics(query, category);
  }

  private getUserPattern(userId: string): UserInteractionPattern {
    return this.interactionCache.get(userId) || {
      userId,
      categories: {},
      keywords: {},
      timePatterns: {},
      complexity: 3,
      successRate: 1.0
    };
  }

  private extractKeywords(query: string): string[] {
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'they', 'have', 'been'].includes(word))
      .slice(0, 10);
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private calculatePreferredComplexity(pattern: UserInteractionPattern): number {
    // Calculate based on success rate and interaction patterns
    if (pattern.successRate > 0.8) return Math.min(5, pattern.complexity + 0.1);
    if (pattern.successRate < 0.6) return Math.max(1, pattern.complexity - 0.1);
    return pattern.complexity;
  }

  async updateTrendingMetrics(query: string, category: string): Promise<void> {
    const cacheKey = `trending:${category}`;
    const metrics = this.trendingCache.get(cacheKey) || [];
    
    const existingMetric = metrics.find(m => m.query === query);
    if (existingMetric) {
      existingMetric.count++;
      existingMetric.lastUsed = new Date();
      existingMetric.score = this.calculateTrendingScore(existingMetric);
    } else {
      metrics.push({
        id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category,
        query,
        count: 1,
        lastUsed: new Date(),
        score: 1.0,
        growth: 1.0
      });
    }
    
    // Keep only top 50 trending items per category
    metrics.sort((a, b) => b.score - a.score);
    this.trendingCache.set(cacheKey, metrics.slice(0, 50));
  }

  private calculateTrendingScore(metric: TrendingMetric): number {
    const hoursSinceLastUse = (Date.now() - metric.lastUsed.getTime()) / (1000 * 60 * 60);
    const recencyFactor = Math.exp(-hoursSinceLastUse / 24); // Decay over 24 hours
    const frequencyFactor = Math.log(metric.count + 1);
    
    return recencyFactor * frequencyFactor;
  }

  async getTrendingSuggestions(
    category?: string,
    limit: number = 10
  ): Promise<PersonalizedRecommendation[]> {
    const now = new Date();
    const shouldAnalyze = now.getTime() - this.lastAnalysis.getTime() > 30 * 60 * 1000; // 30 minutes
    
    if (shouldAnalyze) {
      await this.analyzeTrendingPatterns();
      this.lastAnalysis = now;
    }
    
    const cacheKey = category ? `trending:${category}` : 'trending:all';
    let trendingMetrics: TrendingMetric[] = [];
    
    if (category) {
      trendingMetrics = this.trendingCache.get(`trending:${category}`) || [];
    } else {
      // Aggregate across all categories
      Array.from(this.trendingCache.entries()).forEach(([key, metrics]) => {
        if (key.startsWith('trending:')) {
          trendingMetrics.push(...metrics);
        }
      });
      trendingMetrics.sort((a, b) => b.score - a.score);
    }
    
    const topTrending = trendingMetrics.slice(0, limit);
    return await this.generateTrendingSuggestions(topTrending);
  }

  async getPersonalizedSuggestions(
    userId: string,
    category?: string,
    limit: number = 8
  ): Promise<PersonalizedRecommendation[]> {
    const pattern = this.getUserPattern(userId);
    
    if (Object.keys(pattern.categories).length === 0) {
      // New user - return trending suggestions
      return await this.getTrendingSuggestions(category, limit);
    }
    
    return await this.generatePersonalizedSuggestions(pattern, category, limit);
  }

  private async generateTrendingSuggestions(
    trendingMetrics: TrendingMetric[]
  ): Promise<PersonalizedRecommendation[]> {
    if (trendingMetrics.length === 0) return [];
    
    const topQueries = trendingMetrics.slice(0, 5).map(m => m.query);
    const categories = Array.from(new Set(trendingMetrics.map(m => m.category)));
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: "Generate trending prompt suggestions based on popular user queries and current market trends."
        }, {
          role: "user",
          content: `Create 8 trending prompt suggestions based on these popular queries: ${topQueries.join(', ')}
          
          Focus on:
          - Current business and market trends
          - Popular productivity and efficiency topics
          - Trending technology and innovation themes
          - Seasonal business opportunities
          
          Categories to cover: ${categories.join(', ')}
          
          Return JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "category": "", "tags": [], "reason": "why this is trending"}]}`
        }],
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `trending_${Date.now()}_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        prompt: suggestion.prompt,
        category: suggestion.category || 'general',
        tags: suggestion.tags || [],
        personalizedScore: 0.8 + (Math.random() * 0.2), // High base score for trending
        reason: suggestion.reason || 'Currently trending',
        basedOn: ['trending_queries', 'market_analysis']
      }));
    } catch (error) {
      console.error('Error generating trending suggestions:', error);
      return [];
    }
  }

  private async generatePersonalizedSuggestions(
    pattern: UserInteractionPattern,
    category?: string,
    limit: number = 8
  ): Promise<PersonalizedRecommendation[]> {
    const topCategories = Object.entries(pattern.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
      
    const topKeywords = Object.entries(pattern.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([keyword]) => keyword);
    
    const preferredTimeSlot = Object.entries(pattern.timePatterns)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'morning';
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: `Generate ${limit} personalized prompt suggestions for a user with these preferences:

Favorite Categories: ${topCategories.join(', ')}
Common Keywords: ${topKeywords.join(', ')}
Preferred Time: ${preferredTimeSlot}
Complexity Level: ${pattern.complexity}/5
Success Rate: ${(pattern.successRate * 100).toFixed(0)}%
${category ? `Current Focus: ${category}` : ''}

Create suggestions that:
- Build on their established interests and successful patterns
- Introduce complementary topics for growth
- Match their complexity preference
- Consider their usage patterns and timing

Return JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "category": "", "tags": [], "reason": "why this matches the user", "basedOn": ["specific user patterns"]}]}`
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `personalized_${pattern.userId}_${Date.now()}_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        prompt: suggestion.prompt,
        category: suggestion.category || topCategories[0] || 'general',
        tags: suggestion.tags || [],
        personalizedScore: this.calculatePersonalizationScore(suggestion, pattern),
        reason: suggestion.reason || 'Matches your preferences',
        basedOn: suggestion.basedOn || ['user_history', 'category_preferences']
      }));
    } catch (error) {
      console.error('Error generating personalized suggestions:', error);
      return [];
    }
  }

  private calculatePersonalizationScore(
    suggestion: any,
    pattern: UserInteractionPattern
  ): number {
    let score = 0.5; // Base score
    
    // Category preference match
    if (pattern.categories[suggestion.category]) {
      const categoryWeight = pattern.categories[suggestion.category] / 
        Math.max(...Object.values(pattern.categories));
      score += categoryWeight * 0.3;
    }
    
    // Keyword relevance
    const suggestionText = `${suggestion.title} ${suggestion.description} ${suggestion.tags.join(' ')}`.toLowerCase();
    const keywordMatches = Object.keys(pattern.keywords).filter(keyword => 
      suggestionText.includes(keyword)
    ).length;
    score += (keywordMatches / Math.max(Object.keys(pattern.keywords).length, 1)) * 0.2;
    
    return Math.min(1.0, score);
  }

  private async analyzeTrendingPatterns(): Promise<void> {
    // Analyze growth trends and update scores
    Array.from(this.trendingCache.entries()).forEach(([category, metrics]) => {
      metrics.forEach((metric: TrendingMetric) => {
        // Calculate growth rate based on recent activity
        const recentGrowth = this.calculateGrowthRate(metric);
        metric.growth = recentGrowth;
        metric.score = this.calculateTrendingScore(metric) * (1 + recentGrowth);
      });
      
      // Sort by updated scores
      metrics.sort((a: TrendingMetric, b: TrendingMetric) => b.score - a.score);
      this.trendingCache.set(category, metrics);
    });
  }

  private calculateGrowthRate(metric: TrendingMetric): number {
    // Simple growth calculation - in production, this would use historical data
    const hoursSinceLastUse = (Date.now() - metric.lastUsed.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastUse < 1) return 2.0; // Very recent = high growth
    if (hoursSinceLastUse < 6) return 1.5; // Recent = moderate growth
    if (hoursSinceLastUse < 24) return 1.0; // Normal
    return 0.5; // Declining
  }

  getUserAnalytics(userId: string): {
    totalInteractions: number;
    topCategories: Array<{ category: string; count: number }>;
    topKeywords: Array<{ keyword: string; count: number }>;
    timePatterns: Record<string, number>;
    complexity: number;
    successRate: number;
  } {
    const pattern = this.getUserPattern(userId);
    
    return {
      totalInteractions: Object.values(pattern.categories).reduce((sum, count) => sum + count, 0),
      topCategories: Object.entries(pattern.categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topKeywords: Object.entries(pattern.keywords)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      timePatterns: pattern.timePatterns,
      complexity: pattern.complexity,
      successRate: pattern.successRate
    };
  }

  getTrendingAnalytics(): {
    totalTrends: number;
    topCategories: Array<{ category: string; trends: number }>;
    growthCategories: Array<{ category: string; growth: number }>;
  } {
    const categoryStats: Record<string, { trends: number; growth: number }> = {};
    
    Array.from(this.trendingCache.entries()).forEach(([key, metrics]) => {
      if (key.startsWith('trending:')) {
        const category = key.replace('trending:', '');
        categoryStats[category] = {
          trends: metrics.length,
          growth: metrics.reduce((sum: number, m: TrendingMetric) => sum + m.growth, 0) / metrics.length
        };
      }
    });
    
    return {
      totalTrends: Object.values(categoryStats).reduce((sum, stat) => sum + stat.trends, 0),
      topCategories: Object.entries(categoryStats)
        .map(([category, stat]) => ({ category, trends: stat.trends }))
        .sort((a, b) => b.trends - a.trends),
      growthCategories: Object.entries(categoryStats)
        .map(([category, stat]) => ({ category, growth: stat.growth }))
        .sort((a, b) => b.growth - a.growth)
    };
  }
}

export const trendingAnalyticsEngine = new TrendingAnalyticsEngine();