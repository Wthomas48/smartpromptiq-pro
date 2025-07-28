import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AICache } from './cache';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  relevanceScore: number;
  estimatedTokens: number;
}

interface UserInteraction {
  userId: string;
  query: string;
  category?: string;
  selectedSuggestion?: string;
  timestamp: Date;
  context: {
    previousQueries: string[];
    userPreferences: string[];
    sessionData: Record<string, any>;
  };
}

export class PromptSuggestionsEngine {
  private readonly CACHE_TTL = 3600; // 1 hour cache
  private readonly MAX_SUGGESTIONS = 8;
  private readonly RELEVANCE_THRESHOLD = 0.6;

  async generateSuggestions(
    userQuery: string,
    userId: string,
    context: UserInteraction['context'] = { previousQueries: [], userPreferences: [], sessionData: {} }
  ): Promise<PromptSuggestion[]> {
    // Check cache first
    const cacheKey = `suggestions:${userQuery}:${userId}`;
    const cached = AICache.get(cacheKey);
    if (cached) {
      return this.personalizeResults(cached, context);
    }

    // Generate suggestions using AI
    const suggestions = await this.generateAISuggestions(userQuery, context);
    
    // Cache results
    AICache.set(cacheKey, suggestions);
    
    // Record user interaction for learning
    await this.recordInteraction({
      userId,
      query: userQuery,
      timestamp: new Date(),
      context
    });

    return this.personalizeResults(suggestions, context);
  }

  private async generateAISuggestions(
    userQuery: string,
    context: UserInteraction['context']
  ): Promise<PromptSuggestion[]> {
    // Use Anthropic for intelligent suggestion generation
    // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate 8 intelligent prompt suggestions based on this user query: "${userQuery}"

Context Information:
- Previous queries: ${context.previousQueries.join(', ')}
- User preferences: ${context.userPreferences.join(', ')}
- Session context: ${JSON.stringify(context.sessionData)}

For each suggestion, provide:
1. A clear, actionable title
2. Brief description of what the prompt accomplishes
3. The actual prompt text (optimized for AI generation)
4. Relevant category (marketing, product, financial, education, personal, general)
5. 3-5 relevant tags
6. Estimated complexity/token usage (1-5 scale)

Focus on:
- Practical, immediately useful prompts
- Variety across different use cases
- Building on user's apparent interests
- Progressive complexity from simple to advanced
- Cross-category relevance when appropriate

Format as JSON array with this structure:
{
  "suggestions": [
    {
      "title": "Clear, action-oriented title",
      "description": "What this prompt helps accomplish",
      "prompt": "Detailed, well-structured prompt text",
      "category": "marketing|product|financial|education|personal|general",
      "tags": ["tag1", "tag2", "tag3"],
      "complexity": 1-5
    }
  ]
}`
      }]
    });

    try {
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion_${Date.now()}_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        prompt: suggestion.prompt,
        tags: suggestion.tags || [],
        relevanceScore: this.calculateRelevanceScore(suggestion, userQuery, context),
        estimatedTokens: this.estimateTokenUsage(suggestion.complexity || 3)
      }));
    } catch (error) {
      console.error('Error parsing AI suggestions:', error);
      return this.getFallbackSuggestions(userQuery);
    }
  }

  private calculateRelevanceScore(
    suggestion: any,
    userQuery: string,
    context: UserInteraction['context']
  ): number {
    let score = 0.5; // Base score

    // Query relevance (keyword matching)
    const queryWords = userQuery.toLowerCase().split(' ');
    const suggestionText = `${suggestion.title} ${suggestion.description} ${suggestion.tags.join(' ')}`.toLowerCase();
    
    const matches = queryWords.filter(word => suggestionText.includes(word));
    score += (matches.length / queryWords.length) * 0.3;

    // Context relevance (previous queries)
    if (context.previousQueries.length > 0) {
      const contextMatches = context.previousQueries.some(prev => 
        prev.toLowerCase().includes(suggestion.category) || 
        suggestion.tags.some((tag: string) => prev.toLowerCase().includes(tag.toLowerCase()))
      );
      if (contextMatches) score += 0.15;
    }

    // User preferences alignment
    if (context.userPreferences.length > 0) {
      const prefMatches = context.userPreferences.some(pref =>
        suggestion.category.includes(pref.toLowerCase()) ||
        suggestion.tags.some((tag: string) => tag.toLowerCase().includes(pref.toLowerCase()))
      );
      if (prefMatches) score += 0.2;
    }

    return Math.min(1.0, score);
  }

  private personalizeResults(
    suggestions: PromptSuggestion[],
    context: UserInteraction['context']
  ): PromptSuggestion[] {
    // Sort by relevance score and apply personalization
    return suggestions
      .filter(s => s.relevanceScore >= this.RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.MAX_SUGGESTIONS)
      .map(suggestion => ({
        ...suggestion,
        // Boost suggestions in user's preferred categories
        relevanceScore: context.userPreferences.includes(suggestion.category) 
          ? Math.min(1.0, suggestion.relevanceScore + 0.1)
          : suggestion.relevanceScore
      }));
  }

  private estimateTokenUsage(complexity: number): number {
    // Estimate token usage based on complexity
    const baseTokens = {
      1: 150,  // Simple prompts
      2: 300,  // Basic prompts
      3: 500,  // Medium prompts
      4: 750,  // Complex prompts
      5: 1000  // Advanced prompts
    };
    return baseTokens[complexity as keyof typeof baseTokens] || 500;
  }

  private getFallbackSuggestions(userQuery: string): PromptSuggestion[] {
    // Fallback suggestions when AI generation fails
    return [
      {
        id: 'fallback_1',
        title: 'Improve Content Quality',
        description: 'Enhance existing content with better structure and clarity',
        category: 'general',
        prompt: `Review and improve the following content for clarity, engagement, and effectiveness: ${userQuery}`,
        tags: ['content', 'improvement', 'clarity'],
        relevanceScore: 0.7,
        estimatedTokens: 300
      },
      {
        id: 'fallback_2',
        title: 'Generate Ideas',
        description: 'Brainstorm creative ideas and solutions',
        category: 'general',
        prompt: `Generate 10 creative ideas related to: ${userQuery}. For each idea, provide a brief explanation of its potential impact and implementation approach.`,
        tags: ['brainstorming', 'creativity', 'ideas'],
        relevanceScore: 0.6,
        estimatedTokens: 400
      }
    ];
  }

  async getTrendingSuggestions(
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<PromptSuggestion[]> {
    const cacheKey = `trending:${timeframe}`;
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

    // Generate trending suggestions based on popular categories and queries
    const trendingPrompts = await this.generateTrendingPrompts(timeframe);
    
    // Cache for 1 hour
    AICache.set(cacheKey, trendingPrompts);
    
    return trendingPrompts;
  }

  private async generateTrendingPrompts(timeframe: string): Promise<PromptSuggestion[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{
        role: "system",
        content: "You are a trend analysis expert. Generate trending prompt suggestions based on current business, technology, and professional development trends."
      }, {
        role: "user",
        content: `Generate 6 trending prompt suggestions for this ${timeframe}. Focus on:
        - Current business and technology trends
        - Seasonal professional development needs
        - Popular productivity and growth topics
        - Emerging market opportunities
        
        Return as JSON array with title, description, prompt, category, tags, and complexity (1-5).`
      }],
      response_format: { type: "json_object" }
    });

    try {
      const parsed = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `trending_${Date.now()}_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category || 'general',
        prompt: suggestion.prompt,
        tags: suggestion.tags || [],
        relevanceScore: 0.8, // High relevance for trending
        estimatedTokens: this.estimateTokenUsage(suggestion.complexity || 3)
      }));
    } catch (error) {
      console.error('Error parsing trending suggestions:', error);
      return [];
    }
  }

  async recordInteraction(interaction: UserInteraction): Promise<void> {
    // Store interaction for learning (this would typically go to database)
    const cacheKey = `interactions:${interaction.userId}`;
    const existing = AICache.get(cacheKey) || [];
    
    // Keep last 50 interactions per user
    const updated = [interaction, ...existing].slice(0, 50);
    AICache.set(cacheKey, updated);
  }

  async getPersonalizedSuggestions(
    userId: string,
    category?: string
  ): Promise<PromptSuggestion[]> {
    const cacheKey = `personalized:${userId}:${category || 'all'}`;
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

    // Get user's interaction history
    const interactions = AICache.get(`interactions:${userId}`) || [];
    
    if (interactions.length < 3) {
      // Not enough data, return general trending suggestions
      return this.getTrendingSuggestions();
    }

    // Analyze user patterns and generate personalized suggestions
    const suggestions = await this.generatePersonalizedPrompts(interactions, category);
    
    // Cache for 2 hours
    AICache.set(cacheKey, suggestions);
    
    return suggestions;
  }

  private async generatePersonalizedPrompts(
    interactions: UserInteraction[],
    category?: string
  ): Promise<PromptSuggestion[]> {
    // Analyze user patterns
    const frequentCategories = this.analyzeFrequentCategories(interactions);
    const commonKeywords = this.extractCommonKeywords(interactions);
    const userPreferences = this.inferUserPreferences(interactions);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Generate 6 personalized prompt suggestions based on user behavior analysis:

User Patterns:
- Frequent categories: ${frequentCategories.join(', ')}
- Common keywords: ${commonKeywords.join(', ')}
- Inferred preferences: ${userPreferences.join(', ')}
${category ? `- Focus category: ${category}` : ''}

Create suggestions that:
- Build on user's established interests
- Introduce complementary topics
- Provide progressive skill development
- Offer advanced variations of familiar prompts

Return as JSON with title, description, prompt, category, tags, complexity.`
      }]
    });

    try {
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = JSON.parse(content);
      
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `personalized_${Date.now()}_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        prompt: suggestion.prompt,
        tags: suggestion.tags || [],
        relevanceScore: 0.9, // High relevance for personalized
        estimatedTokens: this.estimateTokenUsage(suggestion.complexity || 3)
      }));
    } catch (error) {
      console.error('Error generating personalized suggestions:', error);
      return [];
    }
  }

  private analyzeFrequentCategories(interactions: UserInteraction[]): string[] {
    const categoryCount: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      if (interaction.category) {
        categoryCount[interaction.category] = (categoryCount[interaction.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private extractCommonKeywords(interactions: UserInteraction[]): string[] {
    const keywordCount: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      const words = interaction.query.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['the', 'and', 'for', 'with', 'that', 'this', 'from'].includes(word));
      
      words.forEach(word => {
        keywordCount[word] = (keywordCount[word] || 0) + 1;
      });
    });

    return Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private inferUserPreferences(interactions: UserInteraction[]): string[] {
    // Simple preference inference based on interaction patterns
    const preferences: string[] = [];
    
    // Check for business vs. personal focus
    const businessTerms = ['business', 'marketing', 'revenue', 'growth', 'strategy'];
    const personalTerms = ['personal', 'goal', 'skill', 'development', 'learning'];
    
    const businessScore = interactions.reduce((score, interaction) => {
      return score + businessTerms.filter(term => 
        interaction.query.toLowerCase().includes(term)
      ).length;
    }, 0);

    const personalScore = interactions.reduce((score, interaction) => {
      return score + personalTerms.filter(term => 
        interaction.query.toLowerCase().includes(term)
      ).length;
    }, 0);

    if (businessScore > personalScore) preferences.push('business-focused');
    if (personalScore > businessScore) preferences.push('personal-development');
    
    return preferences;
  }
}

export const promptSuggestionsEngine = new PromptSuggestionsEngine();