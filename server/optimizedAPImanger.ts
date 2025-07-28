import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AICache } from './cache';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BatchRequest {
  id: string;
  type: 'creative' | 'structured' | 'technical' | 'trending';
  category: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface OptimizedSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  complexity: number;
  aiModel: 'gpt-4o' | 'claude-sonnet-4';
  tokenCost: number;
  createdAt: Date;
  expiresAt: Date;
}

interface SessionLimits {
  userId: string;
  requestCount: number;
  tokenUsage: number;
  lastReset: Date;
  dailyLimit: number;
  sessionLimit: number;
}

export class OptimizedAPIManager {
  private readonly BATCH_SIZES = {
    creative: 15,      // GPT-4o excels at creative content
    structured: 20,    // Claude excels at structured responses
    technical: 12,     // Claude for technical accuracy
    trending: 10       // Mixed model approach
  };

  private readonly SESSION_LIMITS = {
    free: { daily: 20, session: 10 },
    pro: { daily: 200, session: 50 },
    enterprise: { daily: -1, session: -1 } // Unlimited
  };

  private readonly TOKEN_COSTS = {
    'gpt-4o': 0.03,     // Per 1K tokens (estimated)
    'claude-sonnet-4': 0.025  // Per 1K tokens (estimated)
  };

  private batchQueue: BatchRequest[] = [];
  private sessionTracking = new Map<string, SessionLimits>();
  private processingBatch = false;

  async processBatchRequest(
    type: 'creative' | 'structured' | 'technical' | 'trending',
    category: string,
    userId?: string
  ): Promise<OptimizedSuggestion[]> {
    // Check session limits if user provided
    if (userId && !await this.checkSessionLimits(userId, type)) {
      throw new Error('Session limit exceeded. Please try again later or upgrade your plan.');
    }

    // Check cache first for batch results
    const cacheKey = `batch:${type}:${category}`;
    const cached = AICache.get(cacheKey);
    
    if (cached && this.isBatchValid(cached)) {
      console.log(`Serving cached batch for ${type}:${category}`);
      return cached;
    }

    // Add to batch queue or process immediately
    const batchRequest: BatchRequest = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      count: this.BATCH_SIZES[type],
      priority: this.determinePriority(type, category),
      timestamp: new Date()
    };

    // Process immediately for high priority or process in queue
    if (batchRequest.priority === 'high' || !this.processingBatch) {
      return await this.executeBatchRequest(batchRequest, userId);
    } else {
      this.batchQueue.push(batchRequest);
      return await this.waitForBatchResult(batchRequest.id);
    }
  }

  private async executeBatchRequest(
    request: BatchRequest,
    userId?: string
  ): Promise<OptimizedSuggestion[]> {
    this.processingBatch = true;
    
    try {
      console.log(`Processing batch request: ${request.type} for ${request.category}`);
      
      // Select optimal AI model based on request type
      const aiModel = this.selectOptimalModel(request.type);
      const suggestions = await this.generateBatchSuggestions(request, aiModel);
      
      // Cache the results
      const cacheKey = `batch:${request.type}:${request.category}`;
      AICache.set(cacheKey, suggestions);
      
      // Update session tracking
      if (userId) {
        this.updateSessionUsage(userId, suggestions.length, this.calculateTokenUsage(suggestions));
      }
      
      console.log(`Generated ${suggestions.length} suggestions using ${aiModel}`);
      return suggestions;
      
    } finally {
      this.processingBatch = false;
      // Process next in queue
      if (this.batchQueue.length > 0) {
        const nextRequest = this.batchQueue.shift()!;
        setTimeout(() => this.executeBatchRequest(nextRequest), 1000);
      }
    }
  }

  private selectOptimalModel(type: string): 'gpt-4o' | 'claude-sonnet-4' {
    // GPT-4o for creative content, Claude Sonnet-4 for structured/technical
    switch (type) {
      case 'creative':
      case 'trending':
        return 'gpt-4o';
      case 'structured':
      case 'technical':
        return 'claude-sonnet-4';
      default:
        return 'claude-sonnet-4';
    }
  }

  private async generateBatchSuggestions(
    request: BatchRequest,
    aiModel: 'gpt-4o' | 'claude-sonnet-4'
  ): Promise<OptimizedSuggestion[]> {
    const prompts = this.createOptimizedPrompts(request);
    
    if (aiModel === 'gpt-4o') {
      return await this.generateWithGPT4o(request, prompts);
    } else {
      return await this.generateWithClaude(request, prompts);
    }
  }

  private createOptimizedPrompts(request: BatchRequest): string {
    const basePrompt = `Generate ${request.count} ${request.type} prompt suggestions for ${request.category}.`;
    
    const typeInstructions = {
      creative: `Focus on imaginative, engaging prompts that inspire creativity and innovation. Include:
      - Brainstorming and ideation prompts
      - Creative problem-solving scenarios
      - Innovative thinking exercises
      - Out-of-the-box approaches`,
      
      structured: `Focus on systematic, well-organized prompts with clear frameworks. Include:
      - Step-by-step methodologies
      - Structured analysis templates
      - Process optimization frameworks
      - Systematic planning approaches`,
      
      technical: `Focus on precise, technical prompts with detailed specifications. Include:
      - Technical implementation guides
      - Detailed specification templates
      - Technical analysis frameworks
      - Implementation best practices`,
      
      trending: `Focus on current trends and popular topics. Include:
      - Current market opportunities
      - Trending business strategies
      - Popular productivity methods
      - Emerging technology applications`
    };

    return `${basePrompt}

${typeInstructions[request.type]}

Requirements:
- Each suggestion must be immediately actionable
- Include complexity levels from 1-5
- Provide specific, detailed prompts (not just titles)
- Ensure variety in approach and scope
- Make prompts practical for real-world use

Return as JSON: {"suggestions": [{"title": "", "description": "", "prompt": "", "tags": [], "complexity": 1-5}]}`;
  }

  private async generateWithGPT4o(
    request: BatchRequest,
    systemPrompt: string
  ): Promise<OptimizedSuggestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: "You are an expert prompt engineer specialized in creating high-quality, actionable prompts."
        }, {
          role: "user",
          content: systemPrompt
        }],
        response_format: { type: "json_object" },
        max_tokens: 3000
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return this.formatSuggestions(parsed.suggestions, request, 'gpt-4o');
      
    } catch (error) {
      console.error('Error generating with GPT-4o:', error);
      return this.getFallbackSuggestions(request, 'gpt-4o');
    }
  }

  private async generateWithClaude(
    request: BatchRequest,
    systemPrompt: string
  ): Promise<OptimizedSuggestion[]> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: systemPrompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      return this.formatSuggestions(parsed.suggestions, request, 'claude-sonnet-4');
      
    } catch (error) {
      console.error('Error generating with Claude:', error);
      return this.getFallbackSuggestions(request, 'claude-sonnet-4');
    }
  }

  private formatSuggestions(
    rawSuggestions: any[],
    request: BatchRequest,
    aiModel: 'gpt-4o' | 'claude-sonnet-4'
  ): OptimizedSuggestion[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours

    return rawSuggestions.map((suggestion, index) => ({
      id: `${request.type}_${request.category}_${now.getTime()}_${index}`,
      title: suggestion.title,
      description: suggestion.description,
      prompt: suggestion.prompt,
      category: request.category,
      tags: suggestion.tags || [],
      complexity: suggestion.complexity || 3,
      aiModel,
      tokenCost: this.estimateTokenCost(suggestion.prompt, aiModel),
      createdAt: now,
      expiresAt
    }));
  }

  private determinePriority(type: string, category: string): 'high' | 'medium' | 'low' {
    // High priority for popular categories and creative requests
    const popularCategories = ['marketing', 'product', 'general'];
    
    if (type === 'creative' || popularCategories.includes(category)) {
      return 'high';
    }
    
    if (type === 'trending') {
      return 'medium';
    }
    
    return 'low';
  }

  private async checkSessionLimits(userId: string, requestType: string): Promise<boolean> {
    const userLimits = this.sessionTracking.get(userId);
    const now = new Date();
    
    if (!userLimits) {
      // Initialize tracking for new user
      this.sessionTracking.set(userId, {
        userId,
        requestCount: 1,
        tokenUsage: 0,
        lastReset: now,
        dailyLimit: this.SESSION_LIMITS.free.daily,
        sessionLimit: this.SESSION_LIMITS.free.session
      });
      return true;
    }

    // Reset daily limits if needed
    if (now.getTime() - userLimits.lastReset.getTime() > 24 * 60 * 60 * 1000) {
      userLimits.requestCount = 1;
      userLimits.tokenUsage = 0;
      userLimits.lastReset = now;
      return true;
    }

    // Check limits
    if (userLimits.dailyLimit > 0 && userLimits.requestCount >= userLimits.dailyLimit) {
      return false;
    }

    // Session limits (more restrictive)
    if (userLimits.sessionLimit > 0 && userLimits.requestCount >= userLimits.sessionLimit) {
      return false;
    }

    userLimits.requestCount++;
    return true;
  }

  private updateSessionUsage(userId: string, requestCount: number, tokenUsage: number): void {
    const userLimits = this.sessionTracking.get(userId);
    if (userLimits) {
      userLimits.tokenUsage += tokenUsage;
    }
  }

  private estimateTokenCost(content: string, model: 'gpt-4o' | 'claude-sonnet-4'): number {
    // Rough token estimation (1 token ≈ 0.75 words)
    const wordCount = content.split(/\s+/).length;
    const tokenCount = Math.ceil(wordCount / 0.75);
    const costPer1K = this.TOKEN_COSTS[model];
    
    return (tokenCount / 1000) * costPer1K;
  }

  private calculateTokenUsage(suggestions: OptimizedSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => total + suggestion.tokenCost, 0);
  }

  private isBatchValid(suggestions: OptimizedSuggestion[]): boolean {
    if (!suggestions || suggestions.length === 0) return false;
    
    const now = new Date();
    return suggestions.every(suggestion => suggestion.expiresAt > now);
  }

  private getFallbackSuggestions(
    request: BatchRequest,
    aiModel: 'gpt-4o' | 'claude-sonnet-4'
  ): OptimizedSuggestion[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    return [{
      id: `fallback_${request.type}_${request.category}_${now.getTime()}`,
      title: `${request.category.charAt(0).toUpperCase() + request.category.slice(1)} ${request.type} Strategy`,
      description: `Comprehensive ${request.type} approach for ${request.category} optimization`,
      prompt: `Create a detailed ${request.type} strategy for ${request.category} that includes: 1) Current situation analysis, 2) Strategic objectives, 3) Implementation approach, 4) Success metrics, 5) Risk mitigation. Focus on ${request.type} methodologies and provide specific, actionable recommendations.`,
      category: request.category,
      tags: [request.category, request.type, 'strategy'],
      complexity: 3,
      aiModel,
      tokenCost: 0.01,
      createdAt: now,
      expiresAt
    }];
  }

  private async waitForBatchResult(batchId: string): Promise<OptimizedSuggestion[]> {
    // In a real implementation, this would use event emitters or promises
    // For now, return empty array and rely on cache for subsequent requests
    return [];
  }

  getSessionStats(userId: string): SessionLimits | null {
    return this.sessionTracking.get(userId) || null;
  }

  getBatchQueueStatus(): {
    queueLength: number;
    processing: boolean;
    averageWaitTime: number;
  } {
    return {
      queueLength: this.batchQueue.length,
      processing: this.processingBatch,
      averageWaitTime: this.batchQueue.length * 2 // Rough estimate in seconds
    };
  }

  async clearExpiredBatches(): Promise<number> {
    let clearedCount = 0;
    const batchKeys = ['creative', 'structured', 'technical', 'trending'];
    const categories = ['marketing', 'product', 'financial', 'education', 'personal', 'general'];
    
    for (const type of batchKeys) {
      for (const category of categories) {
        const cacheKey = `batch:${type}:${category}`;
        const cached = AICache.get(cacheKey);
        
        if (cached && !this.isBatchValid(cached)) {
          AICache.clear(); // Clear for simplicity
          clearedCount++;
        }
      }
    }
    
    return clearedCount;
  }

  updateUserLimits(userId: string, tier: 'free' | 'pro' | 'enterprise'): void {
    const userLimits = this.sessionTracking.get(userId);
    if (userLimits) {
      userLimits.dailyLimit = this.SESSION_LIMITS[tier].daily;
      userLimits.sessionLimit = this.SESSION_LIMITS[tier].session;
    }
  }
}

export const optimizedAPIManager = new OptimizedAPIManager();