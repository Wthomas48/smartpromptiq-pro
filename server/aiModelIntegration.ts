import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { sqliteCache } from './sqliteCache';

// AI model initialization with the newest available models
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface BatchRequest {
  id: string;
  prompt: string;
  category: string;
  modelPreference?: 'gpt-4o' | 'claude-sonnet-4' | 'auto';
  priority: 'high' | 'medium' | 'low';
  customization?: {
    tone?: string;
    detailLevel?: string;
    format?: string;
    maxTokens?: number;
  };
  metadata?: Record<string, any>;
}

interface BatchResponse {
  id: string;
  content: string;
  model: string;
  tokensUsed: number;
  processingTime: number;
  cacheHit: boolean;
  success: boolean;
  error?: string;
}

interface ModelMetrics {
  model: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  averageTokens: number;
  costPerRequest: number;
  lastUsed: Date;
}

export class AIModelIntegration {
  private readonly MAX_CONCURRENT_REQUESTS = 5;
  private readonly BATCH_SIZE_LIMITS = {
    'gpt-4o': 20,
    'claude-sonnet-4': 15,
    'auto': 25
  };
  private readonly RATE_LIMITS = {
    'gpt-4o': { rpm: 10000, tpm: 300000 },
    'claude-sonnet-4': { rpm: 4000, tpm: 400000 }
  };

  private requestQueue: BatchRequest[] = [];
  private processingQueue: Map<string, Promise<BatchResponse>> = new Map();
  private modelMetrics: Map<string, ModelMetrics> = new Map();
  private rateLimitTracker: Map<string, { requests: number, tokens: number, resetTime: number }> = new Map();

  constructor() {
    this.initializeMetrics();
    this.startQueueProcessor();
    this.startMetricsCollection();
  }

  async processBatchRequests(requests: BatchRequest[]): Promise<BatchResponse[]> {
    // Filter and prioritize requests
    const filteredRequests = this.filterRequests(requests);
    const prioritizedRequests = this.prioritizeRequests(filteredRequests);
    
    // Group by model for optimal batch processing
    const groupedRequests = this.groupRequestsByModel(prioritizedRequests);
    
    // Process each group concurrently
    const batchPromises = Object.entries(groupedRequests).map(([model, modelRequests]) =>
      this.processBatchByModel(model as 'gpt-4o' | 'claude-sonnet-4', modelRequests)
    );

    const batchResults = await Promise.all(batchPromises);
    return batchResults.flat();
  }

  async processAsyncRequest(request: BatchRequest): Promise<BatchResponse> {
    const requestId = request.id;
    
    // Check if already processing
    if (this.processingQueue.has(requestId)) {
      return await this.processingQueue.get(requestId)!;
    }

    // Check cache first
    const cachedResult = await this.checkCache(request);
    if (cachedResult) {
      return cachedResult;
    }

    // Create processing promise
    const processingPromise = this.executeRequest(request);
    this.processingQueue.set(requestId, processingPromise);

    try {
      const result = await processingPromise;
      
      // Cache successful results
      if (result.success) {
        await this.cacheResult(request, result);
      }
      
      return result;
    } finally {
      this.processingQueue.delete(requestId);
    }
  }

  private async executeRequest(request: BatchRequest): Promise<BatchResponse> {
    const startTime = Date.now();
    const selectedModel = this.selectOptimalModel(request);
    
    try {
      // Check rate limits
      if (!this.checkRateLimit(selectedModel)) {
        throw new Error(`Rate limit exceeded for ${selectedModel}`);
      }

      let content: string;
      let tokensUsed: number;

      if (selectedModel === 'gpt-4o') {
        const result = await this.processWithGPT4o(request);
        content = result.content;
        tokensUsed = result.tokensUsed;
      } else {
        const result = await this.processWithClaude(request);
        content = result.content;
        tokensUsed = result.tokensUsed;
      }

      const processingTime = Date.now() - startTime;
      
      // Update metrics
      this.updateModelMetrics(selectedModel, processingTime, tokensUsed, true);
      this.updateRateLimit(selectedModel, tokensUsed);

      return {
        id: request.id,
        content,
        model: selectedModel,
        tokensUsed,
        processingTime,
        cacheHit: false,
        success: true
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      this.updateModelMetrics(selectedModel, processingTime, 0, false);
      
      return {
        id: request.id,
        content: '',
        model: selectedModel,
        tokensUsed: 0,
        processingTime,
        cacheHit: false,
        success: false,
        error: error.message
      };
    }
  }

  private async processWithGPT4o(request: BatchRequest): Promise<{ content: string; tokensUsed: number }> {
    const systemPrompt = this.generateSystemPrompt(request.category, request.customization);
    const maxTokens = request.customization?.maxTokens || 2000;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest GPT-4o model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.prompt }
      ],
      max_tokens: maxTokens,
      temperature: this.getTemperature(request.customization?.tone),
      response_format: request.customization?.format === 'json' ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    return { content, tokensUsed };
  }

  private async processWithClaude(request: BatchRequest): Promise<{ content: string; tokensUsed: number }> {
    const systemPrompt = this.generateSystemPrompt(request.category, request.customization);
    const maxTokens = request.customization?.maxTokens || 2000;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Latest Claude Sonnet model
      system: systemPrompt,
      messages: [
        { role: "user", content: request.prompt }
      ],
      max_tokens: maxTokens,
      temperature: this.getTemperature(request.customization?.tone),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

    return { content, tokensUsed };
  }

  private async processBatchByModel(model: 'gpt-4o' | 'claude-sonnet-4', requests: BatchRequest[]): Promise<BatchResponse[]> {
    const batchSize = this.BATCH_SIZE_LIMITS[model];
    const batches = this.chunkArray(requests, batchSize);
    
    const results: BatchResponse[] = [];
    
    for (const batch of batches) {
      // Process batch with concurrency control
      const batchPromises = batch.map(request => 
        this.processAsyncRequest({ ...request, modelPreference: model })
      );
      
      // Limit concurrent requests
      const concurrentBatches = this.chunkArray(batchPromises, this.MAX_CONCURRENT_REQUESTS);
      
      for (const concurrentBatch of concurrentBatches) {
        const batchResults = await Promise.all(concurrentBatch);
        results.push(...batchResults);
        
        // Brief delay between concurrent batches to respect rate limits
        if (concurrentBatches.length > 1) {
          await this.delay(100);
        }
      }
    }
    
    return results;
  }

  private selectOptimalModel(request: BatchRequest): 'gpt-4o' | 'claude-sonnet-4' {
    if (request.modelPreference && request.modelPreference !== 'auto') {
      return request.modelPreference;
    }

    // Intelligent model selection based on category and requirements
    const categoryModelMap: Record<string, 'gpt-4o' | 'claude-sonnet-4'> = {
      'creative': 'gpt-4o',
      'marketing': 'gpt-4o',
      'brainstorming': 'gpt-4o',
      'storytelling': 'gpt-4o',
      'technical': 'claude-sonnet-4',
      'analysis': 'claude-sonnet-4',
      'research': 'claude-sonnet-4',
      'documentation': 'claude-sonnet-4',
      'education': 'claude-sonnet-4',
      'financial': 'claude-sonnet-4',
      'product': 'claude-sonnet-4'
    };

    const preferredModel = categoryModelMap[request.category] || 'gpt-4o';
    
    // Check availability and rate limits
    if (this.checkRateLimit(preferredModel)) {
      return preferredModel;
    }
    
    // Fallback to alternative model
    const alternativeModel = preferredModel === 'gpt-4o' ? 'claude-sonnet-4' : 'gpt-4o';
    return this.checkRateLimit(alternativeModel) ? alternativeModel : preferredModel;
  }

  private filterRequests(requests: BatchRequest[]): BatchRequest[] {
    return requests.filter(request => {
      // Filter out invalid requests
      if (!request.prompt || request.prompt.trim().length < 10) {
        return false;
      }

      // Filter by category whitelist
      const allowedCategories = [
        'creative', 'marketing', 'technical', 'business', 'education',
        'financial', 'product', 'research', 'analysis', 'brainstorming'
      ];
      
      if (!allowedCategories.includes(request.category)) {
        return false;
      }

      // Filter by prompt complexity (token estimation)
      const estimatedTokens = this.estimateTokens(request.prompt);
      if (estimatedTokens > 4000) { // Max context consideration
        return false;
      }

      return true;
    });
  }

  private prioritizeRequests(requests: BatchRequest[]): BatchRequest[] {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    return requests.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by category importance (creative and technical first)
      const importantCategories = ['creative', 'technical', 'marketing'];
      const aImportant = importantCategories.includes(a.category) ? 1 : 0;
      const bImportant = importantCategories.includes(b.category) ? 1 : 0;
      
      return bImportant - aImportant;
    });
  }

  private groupRequestsByModel(requests: BatchRequest[]): Record<string, BatchRequest[]> {
    const groups: Record<string, BatchRequest[]> = {
      'gpt-4o': [],
      'claude-sonnet-4': []
    };

    requests.forEach(request => {
      const model = this.selectOptimalModel(request);
      groups[model].push(request);
    });

    return groups;
  }

  private generateSystemPrompt(category: string, customization?: any): string {
    const basePrompts: Record<string, string> = {
      creative: "You are a creative expert specializing in innovative ideas and artistic direction. Generate detailed, imaginative content that inspires and engages.",
      marketing: "You are a marketing strategist with expertise in brand positioning and customer engagement. Create compelling, data-driven marketing content.",
      technical: "You are a senior technical architect with deep expertise in system design and implementation. Provide precise, actionable technical guidance.",
      business: "You are a business strategy consultant with extensive experience in organizational development. Generate comprehensive business insights.",
      education: "You are an educational expert skilled in curriculum development and learning design. Create structured, pedagogically sound content.",
      financial: "You are a financial analyst with expertise in strategic planning and risk assessment. Provide detailed financial guidance.",
      product: "You are a product development specialist with experience in user-centered design. Generate actionable product insights.",
      research: "You are a research analyst with expertise in data interpretation and insight generation. Provide thorough, evidence-based analysis.",
      analysis: "You are an analytical expert skilled in complex problem-solving and pattern recognition. Generate detailed analytical insights."
    };

    let systemPrompt = basePrompts[category] || basePrompts['business'];

    // Add customization instructions
    if (customization?.tone) {
      systemPrompt += ` Maintain a ${customization.tone} tone throughout.`;
    }

    if (customization?.detailLevel) {
      systemPrompt += ` Provide ${customization.detailLevel} level detail.`;
    }

    if (customization?.format === 'json') {
      systemPrompt += ` Always respond with valid JSON format.`;
    }

    return systemPrompt;
  }

  private checkRateLimit(model: string): boolean {
    const limits = this.RATE_LIMITS[model as keyof typeof this.RATE_LIMITS];
    if (!limits) return true;

    const tracker = this.rateLimitTracker.get(model);
    if (!tracker) {
      this.rateLimitTracker.set(model, {
        requests: 0,
        tokens: 0,
        resetTime: Date.now() + 60000 // 1 minute
      });
      return true;
    }

    const now = Date.now();
    if (now > tracker.resetTime) {
      // Reset counters
      tracker.requests = 0;
      tracker.tokens = 0;
      tracker.resetTime = now + 60000;
      return true;
    }

    return tracker.requests < limits.rpm && tracker.tokens < limits.tpm;
  }

  private updateRateLimit(model: string, tokens: number): void {
    const tracker = this.rateLimitTracker.get(model);
    if (tracker) {
      tracker.requests += 1;
      tracker.tokens += tokens;
    }
  }

  private updateModelMetrics(model: string, processingTime: number, tokens: number, success: boolean): void {
    const metrics = this.modelMetrics.get(model) || {
      model,
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      averageTokens: 0,
      costPerRequest: 0,
      lastUsed: new Date()
    };

    metrics.totalRequests += 1;
    metrics.successRate = ((metrics.successRate * (metrics.totalRequests - 1)) + (success ? 1 : 0)) / metrics.totalRequests;
    metrics.averageResponseTime = ((metrics.averageResponseTime * (metrics.totalRequests - 1)) + processingTime) / metrics.totalRequests;
    metrics.averageTokens = ((metrics.averageTokens * (metrics.totalRequests - 1)) + tokens) / metrics.totalRequests;
    metrics.lastUsed = new Date();

    // Calculate cost per request (approximate)
    const costs = {
      'gpt-4o': { input: 0.005, output: 0.015 }, // per 1k tokens
      'claude-sonnet-4': { input: 0.003, output: 0.015 }
    };

    const modelCosts = costs[model as keyof typeof costs];
    if (modelCosts) {
      const estimatedCost = (tokens * modelCosts.input) / 1000; // Simplified calculation
      metrics.costPerRequest = ((metrics.costPerRequest * (metrics.totalRequests - 1)) + estimatedCost) / metrics.totalRequests;
    }

    this.modelMetrics.set(model, metrics);
  }

  private async checkCache(request: BatchRequest): Promise<BatchResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await sqliteCache.getCachedSuggestions(cacheKey, request.category);
      
      if (cached && cached.length > 0) {
        return {
          id: request.id,
          content: cached[0].prompt || cached[0].description,
          model: 'cache',
          tokensUsed: 0,
          processingTime: 0,
          cacheHit: true,
          success: true
        };
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }
    
    return null;
  }

  private async cacheResult(request: BatchRequest, result: BatchResponse): Promise<void> {
    try {
      const suggestions = [{
        id: result.id,
        title: `Generated: ${request.category}`,
        description: result.content.substring(0, 200) + '...',
        prompt: result.content,
        category: request.category,
        tags: [request.category, result.model],
        relevanceScore: 0.9,
        estimatedTokens: result.tokensUsed
      }];

      await sqliteCache.cacheSuggestions(
        this.generateCacheKey(request),
        request.category,
        suggestions,
        0.9
      );
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  private generateCacheKey(request: BatchRequest): string {
    const keyComponents = [
      request.prompt.toLowerCase().trim(),
      request.category,
      request.customization?.tone || '',
      request.customization?.detailLevel || '',
      request.modelPreference || 'auto'
    ];
    
    return keyComponents.join('|').slice(0, 200);
  }

  private getTemperature(tone?: string): number {
    const temperatureMap: Record<string, number> = {
      'creative': 0.9,
      'professional': 0.3,
      'casual': 0.7,
      'technical': 0.2,
      'analytical': 0.1
    };
    
    return temperatureMap[tone || 'professional'] || 0.5;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 4 characters ≈ 1 token
    return Math.ceil(text.length / 4);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeMetrics(): void {
    ['gpt-4o', 'claude-sonnet-4'].forEach(model => {
      this.modelMetrics.set(model, {
        model,
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        averageTokens: 0,
        costPerRequest: 0,
        lastUsed: new Date()
      });
    });
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.requestQueue.length > 0) {
        const batch = this.requestQueue.splice(0, 10); // Process up to 10 at a time
        this.processBatchRequests(batch).catch(console.error);
      }
    }, 5000); // Process queue every 5 seconds
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.logModelMetrics();
    }, 300000); // Log metrics every 5 minutes
  }

  private logModelMetrics(): void {
    console.log('[AI Model Integration] Current Metrics:');
    this.modelMetrics.forEach((metrics, model) => {
      console.log(`${model}: ${metrics.totalRequests} requests, ${(metrics.successRate * 100).toFixed(1)}% success, ${metrics.averageResponseTime.toFixed(0)}ms avg`);
    });
  }

  // Public methods for external access
  
  async queueRequest(request: BatchRequest): Promise<void> {
    this.requestQueue.push(request);
  }

  getModelMetrics(): Map<string, ModelMetrics> {
    return new Map(this.modelMetrics);
  }

  getQueueStatus(): { length: number; processing: number } {
    return {
      length: this.requestQueue.length,
      processing: this.processingQueue.size
    };
  }

  async optimizeModelSelection(category: string, historicalData: any[]): Promise<string> {
    // Analyze historical performance for category
    const categoryMetrics = historicalData.filter(d => d.category === category);
    
    if (categoryMetrics.length === 0) {
      return this.selectOptimalModel({ category } as BatchRequest);
    }

    // Calculate performance scores
    const modelScores = new Map<string, number>();
    
    ['gpt-4o', 'claude-sonnet-4'].forEach(model => {
      const modelData = categoryMetrics.filter(d => d.model === model);
      if (modelData.length === 0) return;
      
      const avgTime = modelData.reduce((sum, d) => sum + d.processingTime, 0) / modelData.length;
      const successRate = modelData.filter(d => d.success).length / modelData.length;
      const avgCost = modelData.reduce((sum, d) => sum + d.cost, 0) / modelData.length;
      
      // Scoring formula: prioritize success rate, then speed, then cost
      const score = (successRate * 0.5) + ((1000 / avgTime) * 0.3) + ((1 / avgCost) * 0.2);
      modelScores.set(model, score);
    });

    // Return model with highest score
    let bestModel = 'gpt-4o';
    let bestScore = 0;
    
    modelScores.forEach((score, model) => {
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    });

    return bestModel;
  }
}

// Singleton instance
export const aiModelIntegration = new AIModelIntegration();