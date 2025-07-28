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

interface CachedPromptSuggestion {
  id: string;
  category: string;
  type: 'trending' | 'category' | 'seasonal';
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  relevanceScore: number;
  estimatedTokens: number;
  popularity: number;
  usageCount: number;
  createdAt: string;
  expiresAt: string;
}

interface CacheStats {
  totalCached: number;
  hitRate: number;
  costSavings: number;
  categoryBreakdown: Record<string, number>;
  expiryInfo: Record<string, string>;
}

export class OptimizedCacheManager {
  private readonly CACHE_EXPIRY = {
    trending: 6 * 60 * 60 * 1000,    // 6 hours
    category: 12 * 60 * 60 * 1000,   // 12 hours
    seasonal: 168 * 60 * 60 * 1000,  // 1 week
  };

  private readonly BATCH_SIZES = {
    trending: 15,
    category: 20,
    seasonal: 10,
  };

  private hitCount = 0;
  private missCount = 0;
  private costSavings = 0;

  async initializeCache(): Promise<void> {
    console.log('Initializing optimized cache system...');
    
    // Warm up cache with essential suggestions
    await this.warmUpEssentialCache();
    
    // Start background refresh cycle
    this.startBackgroundRefresh();
  }

  private async warmUpEssentialCache(): Promise<void> {
    const priorityCategories = ['marketing', 'product', 'general'];
    
    for (const category of priorityCategories) {
      await this.ensureCategoryCached(category);
    }
    
    await this.ensureTrendingCached();
    console.log('Essential cache warmed up successfully');
  }

  async getSuggestions(
    type: 'trending' | 'category' | 'seasonal',
    category?: string,
    limit: number = 8
  ): Promise<CachedPromptSuggestion[]> {
    const cacheKey = this.buildCacheKey(type, category);
    
    // Try cache first
    let cached = AICache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      this.hitCount++;
      this.costSavings += this.estimateCostSaving(type);
      return this.selectBestSuggestions(cached, limit);
    }

    // Cache miss - generate fresh suggestions
    this.missCount++;
    const fresh = await this.generateFreshSuggestions(type, category);
    
    if (fresh.length > 0) {
      AICache.set(cacheKey, fresh);
    }
    
    return this.selectBestSuggestions(fresh, limit);
  }

  private buildCacheKey(type: string, category?: string): string {
    return category ? `suggestions:${type}:${category}` : `suggestions:${type}`;
  }

  private isCacheValid(suggestions: CachedPromptSuggestion[]): boolean {
    if (!suggestions || suggestions.length === 0) return false;
    
    const now = Date.now();
    const oldestValid = suggestions.every(s => new Date(s.expiresAt).getTime() > now);
    
    return oldestValid;
  }

  private selectBestSuggestions(
    suggestions: CachedPromptSuggestion[],
    limit: number
  ): CachedPromptSuggestion[] {
    return suggestions
      .sort((a, b) => (b.popularity + b.relevanceScore) - (a.popularity + a.relevanceScore))
      .slice(0, limit);
  }

  private async generateFreshSuggestions(
    type: 'trending' | 'category' | 'seasonal',
    category?: string
  ): Promise<CachedPromptSuggestion[]> {
    switch (type) {
      case 'trending':
        return await this.generateTrendingSuggestions();
      case 'category':
        return category ? await this.generateCategorySuggestions(category) : [];
      case 'seasonal':
        return await this.generateSeasonalSuggestions();
      default:
        return [];
    }
  }

  private async generateTrendingSuggestions(): Promise<CachedPromptSuggestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: "Generate trending business and professional prompt suggestions based on current market needs."
        }, {
          role: "user",
          content: `Create ${this.BATCH_SIZES.trending} trending prompt suggestions for professionals. Focus on:
          - Current business challenges and opportunities
          - Popular productivity and efficiency topics  
          - Technology adoption and digital transformation
          - Market analysis and competitive positioning
          
          Return JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "category": "", "tags": [], "complexity": 1-5}]}`
        }],
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return this.formatSuggestions(parsed.suggestions, 'trending');
    } catch (error) {
      console.error('Error generating trending suggestions:', error);
      // Return fallback trending suggestions if API fails
      return this.getFallbackSuggestions('trending');
    }
  }

  private async generateCategorySuggestions(category: string): Promise<CachedPromptSuggestion[]> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: `Generate ${this.BATCH_SIZES.category} diverse, high-quality prompt suggestions for ${category}.

Focus areas for ${category}:
${this.getCategoryFocus(category)}

Requirements:
- Practical, immediately actionable prompts
- Range from beginner to advanced complexity
- Cover different use cases and scenarios
- Include specific, detailed prompt instructions

Return JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "tags": [], "complexity": 1-5, "popularity": 0.1-1.0}]}`
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      return this.formatSuggestions(parsed.suggestions, 'category', category);
    } catch (error) {
      console.error(`Error generating ${category} suggestions:`, error);
      return this.getFallbackSuggestions(category);
    }
  }

  private async generateSeasonalSuggestions(): Promise<CachedPromptSuggestion[]> {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Generate ${this.BATCH_SIZES.seasonal} seasonal prompt suggestions for ${month} (Q${quarter}).

Consider:
- Seasonal business planning and strategy
- Holiday and event marketing opportunities
- Quarter-end planning and reviews
- Weather-related business impacts
- Academic and training calendar alignment

Return JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "category": "", "tags": [], "complexity": 1-5}]}`
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      return this.formatSuggestions(parsed.suggestions, 'seasonal');
    } catch (error) {
      console.error('Error generating seasonal suggestions:', error);
      return [];
    }
  }

  private formatSuggestions(
    rawSuggestions: any[],
    type: 'trending' | 'category' | 'seasonal',
    category?: string
  ): CachedPromptSuggestion[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_EXPIRY[type]);

    return rawSuggestions.map((suggestion, index) => ({
      id: `${type}_${category || 'general'}_${now.getTime()}_${index}`,
      category: category || suggestion.category || 'general',
      type,
      title: suggestion.title,
      description: suggestion.description,
      prompt: suggestion.prompt,
      tags: suggestion.tags || [],
      relevanceScore: suggestion.popularity || 0.7,
      estimatedTokens: this.estimateTokens(suggestion.complexity || 3),
      popularity: suggestion.popularity || 0.7,
      usageCount: 0,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }));
  }

  private getCategoryFocus(category: string): string {
    const focuses = {
      marketing: '- Campaign development and optimization\n- Brand strategy and positioning\n- Content creation and SEO\n- Social media and digital marketing',
      product: '- MVP development and feature planning\n- User experience and design thinking\n- Market research and validation\n- Competitive analysis and positioning',
      financial: '- Business model development\n- Financial planning and projections\n- Investment and funding strategies\n- Cost optimization and revenue growth',
      education: '- Course and curriculum development\n- Learning pathway design\n- Assessment and evaluation methods\n- Educational technology integration',
      personal: '- Goal setting and achievement strategies\n- Professional development planning\n- Communication and leadership skills\n- Networking and relationship building',
      general: '- Problem-solving methodologies\n- Creative thinking and innovation\n- Process optimization\n- Strategic planning and analysis'
    };
    return focuses[category as keyof typeof focuses] || focuses.general;
  }

  private estimateTokens(complexity: number): number {
    const tokenMap = { 1: 150, 2: 300, 3: 500, 4: 750, 5: 1000 };
    return tokenMap[complexity as keyof typeof tokenMap] || 500;
  }

  private estimateCostSaving(type: string): number {
    // Estimate cost savings based on typical API costs
    const baseCosts = { trending: 0.02, category: 0.015, seasonal: 0.01 };
    return baseCosts[type as keyof typeof baseCosts] || 0.01;
  }

  private getFallbackSuggestions(category: string): CachedPromptSuggestion[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_EXPIRY.category);

    return [{
      id: `fallback_${category}_${now.getTime()}`,
      category,
      type: 'category',
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Strategy Development`,
      description: `Create comprehensive strategies and action plans for ${category} initiatives`,
      prompt: `Develop a detailed ${category} strategy that includes: 1) Current situation analysis, 2) Goal definition and success metrics, 3) Strategic approaches and tactics, 4) Implementation timeline, 5) Resource requirements, 6) Risk assessment and mitigation plans. Provide specific, actionable recommendations for immediate implementation.`,
      tags: [category, 'strategy', 'planning', 'implementation'],
      relevanceScore: 0.6,
      estimatedTokens: 400,
      popularity: 0.6,
      usageCount: 0,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }];
  }

  async recordUsage(suggestionId: string): Promise<void> {
    // Track usage for popularity optimization
    const cacheKey = `suggestions:trending`;
    const suggestions = AICache.get(cacheKey);
    
    if (suggestions && Array.isArray(suggestions)) {
      const suggestion = suggestions.find((s: CachedPromptSuggestion) => s.id === suggestionId);
      if (suggestion) {
        suggestion.usageCount++;
        suggestion.popularity = Math.min(1.0, suggestion.popularity + 0.02);
        AICache.set(cacheKey, suggestions);
      }
    }
    
    // Also check category caches
    const categories = ['marketing', 'product', 'financial', 'education', 'personal', 'general'];
    for (const category of categories) {
      const categoryKey = `suggestions:category:${category}`;
      const categorySuggestions = AICache.get(categoryKey);
      
      if (categorySuggestions && Array.isArray(categorySuggestions)) {
        const suggestion = categorySuggestions.find((s: CachedPromptSuggestion) => s.id === suggestionId);
        if (suggestion) {
          suggestion.usageCount++;
          suggestion.popularity = Math.min(1.0, suggestion.popularity + 0.02);
          AICache.set(categoryKey, categorySuggestions);
          break;
        }
      }
    }
  }

  private async ensureCategoryCached(category: string): Promise<void> {
    const cacheKey = this.buildCacheKey('category', category);
    const cached = AICache.get(cacheKey);
    
    if (!cached || !this.isCacheValid(cached)) {
      const fresh = await this.generateCategorySuggestions(category);
      if (fresh.length > 0) {
        AICache.set(cacheKey, fresh);
      }
    }
  }

  private async ensureTrendingCached(): Promise<void> {
    const cacheKey = this.buildCacheKey('trending');
    const cached = AICache.get(cacheKey);
    
    if (!cached || !this.isCacheValid(cached)) {
      const fresh = await this.generateTrendingSuggestions();
      if (fresh.length > 0) {
        AICache.set(cacheKey, fresh);
      }
    }
  }

  private startBackgroundRefresh(): void {
    // Refresh cache every 4 hours
    setInterval(async () => {
      console.log('Running background cache refresh...');
      
      // Refresh trending suggestions
      await this.ensureTrendingCached();
      
      // Refresh popular categories
      const popularCategories = ['marketing', 'product', 'general'];
      for (const category of popularCategories) {
        await this.ensureCategoryCached(category);
      }
      
      console.log('Background cache refresh completed');
    }, 4 * 60 * 60 * 1000); // 4 hours
  }

  getCacheStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    
    const categoryBreakdown: Record<string, number> = {};
    const expiryInfo: Record<string, string> = {};
    let totalCached = 0;

    // Check known cache keys
    const knownCacheKeys = [
      'suggestions:trending',
      'suggestions:category:marketing',
      'suggestions:category:product',
      'suggestions:category:financial',
      'suggestions:category:education',
      'suggestions:category:personal',
      'suggestions:category:general',
      'suggestions:seasonal'
    ];
    
    for (const key of knownCacheKeys) {
      const suggestions = AICache.get(key);
      if (suggestions && Array.isArray(suggestions)) {
        totalCached += suggestions.length;
        
        // Count by category
        for (const suggestion of suggestions) {
          const cat = suggestion.category || 'unknown';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        }
        
        // Check expiry status
        const isValid = this.isCacheValid(suggestions);
        expiryInfo[key.replace('suggestions:', '')] = isValid ? 'valid' : 'expired';
      }
    }

    return {
      totalCached,
      hitRate: Math.round(hitRate * 100) / 100,
      costSavings: Math.round(this.costSavings * 100) / 100,
      categoryBreakdown,
      expiryInfo,
    };
  }

  async clearExpiredCache(): Promise<number> {
    let clearedCount = 0;
    const knownCacheKeys = [
      'suggestions:trending',
      'suggestions:category:marketing',
      'suggestions:category:product',
      'suggestions:category:financial',
      'suggestions:category:education',
      'suggestions:category:personal',
      'suggestions:category:general',
      'suggestions:seasonal'
    ];
    
    for (const key of knownCacheKeys) {
      const suggestions = AICache.get(key);
      if (suggestions && !this.isCacheValid(suggestions)) {
        AICache.clear(); // Clear entire cache for simplicity
        clearedCount++;
      }
    }
    
    console.log(`Cleared ${clearedCount} expired cache entries`);
    return clearedCount;
  }

  async preloadCategoryCache(categories: string[]): Promise<void> {
    console.log(`Preloading cache for categories: ${categories.join(', ')}`);
    
    for (const category of categories) {
      await this.ensureCategoryCached(category);
    }
    
    console.log('Category cache preloading completed');
  }
}

export const optimizedCacheManager = new OptimizedCacheManager();