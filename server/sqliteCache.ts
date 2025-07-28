import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface CachedSuggestion {
  id: string;
  query: string;
  category: string;
  suggestions: string; // JSON string
  relevanceScore: number;
  createdAt: number;
  expiresAt: number;
  usageCount: number;
  lastUsed: number;
}

interface SuggestionMetrics {
  totalCached: number;
  hitRate: number;
  averageResponseTime: number;
  popularQueries: Array<{ query: string; count: number }>;
  categoryBreakdown: Record<string, number>;
}

export class SQLiteSuggestionCache {
  private db: Database.Database;
  private readonly CACHE_EXPIRY_HOURS = 6;
  private readonly MAX_CACHE_SIZE = 10000;
  private hitCount = 0;
  private missCount = 0;
  private totalResponseTime = 0;
  private requestCount = 0;

  constructor() {
    // Ensure cache directory exists
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const dbPath = path.join(cacheDir, 'suggestions.db');
    this.db = new Database(dbPath);
    
    this.initializeDatabase();
    this.setupPeriodicCleanup();
  }

  private initializeDatabase(): void {
    // Create suggestions cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS suggestion_cache (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        category TEXT NOT NULL,
        suggestions TEXT NOT NULL,
        relevance_score REAL DEFAULT 0.0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER NOT NULL
      )
    `);

    // Create indexes for fast lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_query_category ON suggestion_cache(query, category);
      CREATE INDEX IF NOT EXISTS idx_expires_at ON suggestion_cache(expires_at);
      CREATE INDEX IF NOT EXISTS idx_last_used ON suggestion_cache(last_used);
      CREATE INDEX IF NOT EXISTS idx_usage_count ON suggestion_cache(usage_count);
    `);

    // Create trending queries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trending_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        category TEXT NOT NULL,
        count INTEGER DEFAULT 1,
        last_seen INTEGER NOT NULL,
        UNIQUE(query, category)
      )
    `);

    // Create user interaction log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        query TEXT NOT NULL,
        category TEXT NOT NULL,
        selected_suggestion TEXT,
        timestamp INTEGER NOT NULL,
        success BOOLEAN DEFAULT 1
      )
    `);

    console.log('[SQLite Cache] Database initialized successfully');
  }

  private setupPeriodicCleanup(): void {
    // Clean expired entries every hour
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 60 * 60 * 1000);

    // Optimize database every 6 hours
    setInterval(() => {
      this.optimizeDatabase();
    }, 6 * 60 * 60 * 1000);
  }

  async cacheSuggestions(
    query: string, 
    category: string, 
    suggestions: any[], 
    relevanceScore: number = 0.8
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
    const cacheId = this.generateCacheKey(query, category);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO suggestion_cache 
      (id, query, category, suggestions, relevance_score, created_at, expires_at, last_used, usage_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT usage_count FROM suggestion_cache WHERE id = ?), 0))
    `);

    try {
      stmt.run(
        cacheId,
        query.toLowerCase().trim(),
        category,
        JSON.stringify(suggestions),
        relevanceScore,
        now,
        expiresAt,
        now,
        cacheId
      );

      // Update trending queries
      this.updateTrendingQuery(query, category);
    } catch (error) {
      console.error('[SQLite Cache] Error caching suggestions:', error);
    }
  }

  async getCachedSuggestions(query: string, category: string): Promise<any[] | null> {
    const startTime = Date.now();
    const cacheId = this.generateCacheKey(query, category);
    
    const stmt = this.db.prepare(`
      SELECT suggestions, relevance_score, expires_at, usage_count
      FROM suggestion_cache 
      WHERE id = ? AND expires_at > ?
    `);

    try {
      const result = stmt.get(cacheId, Date.now()) as any;
      
      if (result) {
        // Update usage statistics
        this.updateUsageStats(cacheId);
        this.hitCount++;
        
        const responseTime = Date.now() - startTime;
        this.totalResponseTime += responseTime;
        this.requestCount++;

        const suggestions = JSON.parse(result.suggestions);
        
        // Add cache metadata
        return suggestions.map((suggestion: any) => ({
          ...suggestion,
          cached: true,
          cacheHit: true,
          usageCount: result.usage_count + 1,
          relevanceScore: result.relevance_score
        }));
      } else {
        this.missCount++;
        this.requestCount++;
        return null;
      }
    } catch (error) {
      console.error('[SQLite Cache] Error retrieving cached suggestions:', error);
      this.missCount++;
      this.requestCount++;
      return null;
    }
  }

  async searchSimilarQueries(query: string, category: string, limit: number = 5): Promise<any[]> {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (searchTerms.length === 0) return [];

    const likeConditions = searchTerms.map(() => 'query LIKE ?').join(' OR ');
    const stmt = this.db.prepare(`
      SELECT DISTINCT query, category, suggestions, relevance_score, usage_count
      FROM suggestion_cache 
      WHERE (${likeConditions}) 
        AND category = ? 
        AND expires_at > ?
      ORDER BY usage_count DESC, relevance_score DESC
      LIMIT ?
    `);

    try {
      const params = [
        ...searchTerms.map(term => `%${term}%`),
        category,
        Date.now(),
        limit
      ];

      const results = stmt.all(...params) as any[];
      
      return results.map(result => ({
        query: result.query,
        category: result.category,
        suggestions: JSON.parse(result.suggestions),
        relevanceScore: result.relevance_score,
        usageCount: result.usage_count,
        similarity: this.calculateSimilarity(query, result.query)
      })).sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('[SQLite Cache] Error searching similar queries:', error);
      return [];
    }
  }

  async getTrendingQueries(category?: string, limit: number = 10): Promise<any[]> {
    const whereClause = category ? 'WHERE category = ?' : '';
    const stmt = this.db.prepare(`
      SELECT query, category, count, last_seen
      FROM trending_queries 
      ${whereClause}
      ORDER BY count DESC, last_seen DESC 
      LIMIT ?
    `);

    try {
      const params = category ? [category, limit] : [limit];
      const results = stmt.all(...params) as any[];
      
      return results.map(result => ({
        query: result.query,
        category: result.category,
        count: result.count,
        lastSeen: new Date(result.last_seen),
        trend: this.calculateTrendScore(result.count, result.last_seen)
      }));
    } catch (error) {
      console.error('[SQLite Cache] Error getting trending queries:', error);
      return [];
    }
  }

  async logUserInteraction(
    userId: string,
    query: string,
    category: string,
    selectedSuggestion?: string,
    success: boolean = true
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO user_interactions 
      (user_id, query, category, selected_suggestion, timestamp, success)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(userId, query, category, selectedSuggestion || null, Date.now(), success);
    } catch (error) {
      console.error('[SQLite Cache] Error logging user interaction:', error);
    }
  }

  async getUserInsights(userId: string): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT 
        category,
        COUNT(*) as interactions,
        AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
        COUNT(DISTINCT query) as unique_queries
      FROM user_interactions 
      WHERE user_id = ? 
        AND timestamp > ?
      GROUP BY category
      ORDER BY interactions DESC
    `);

    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const results = stmt.all(userId, thirtyDaysAgo) as any[];
      
      const totalInteractions = results.reduce((sum, r) => sum + r.interactions, 0);
      
      return {
        totalInteractions,
        categories: results,
        averageSuccessRate: results.length > 0 
          ? results.reduce((sum, r) => sum + r.success_rate, 0) / results.length 
          : 0,
        uniqueQueries: results.reduce((sum, r) => sum + r.unique_queries, 0)
      };
    } catch (error) {
      console.error('[SQLite Cache] Error getting user insights:', error);
      return { totalInteractions: 0, categories: [], averageSuccessRate: 0, uniqueQueries: 0 };
    }
  }

  getCacheMetrics(): SuggestionMetrics {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    // Get popular queries
    const popularQueriesStmt = this.db.prepare(`
      SELECT query, SUM(usage_count) as count
      FROM suggestion_cache 
      WHERE expires_at > ?
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `);

    const popularQueries = popularQueriesStmt.all(Date.now()) as any[];

    // Get category breakdown
    const categoryStmt = this.db.prepare(`
      SELECT category, COUNT(*) as count
      FROM suggestion_cache 
      WHERE expires_at > ?
      GROUP BY category
    `);

    const categoryResults = categoryStmt.all(Date.now()) as any[];
    const categoryBreakdown: Record<string, number> = {};
    categoryResults.forEach(result => {
      categoryBreakdown[result.category] = result.count;
    });

    // Get total cached items
    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM suggestion_cache WHERE expires_at > ?
    `);
    const totalResult = totalStmt.get(Date.now()) as any;

    return {
      totalCached: totalResult?.total || 0,
      hitRate: Math.round(hitRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      popularQueries: popularQueries.map(q => ({
        query: q.query,
        count: q.count
      })),
      categoryBreakdown
    };
  }

  private generateCacheKey(query: string, category: string): string {
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${category}:${Buffer.from(normalizedQuery).toString('base64').slice(0, 50)}`;
  }

  private updateUsageStats(cacheId: string): void {
    const stmt = this.db.prepare(`
      UPDATE suggestion_cache 
      SET usage_count = usage_count + 1, last_used = ?
      WHERE id = ?
    `);

    try {
      stmt.run(Date.now(), cacheId);
    } catch (error) {
      console.error('[SQLite Cache] Error updating usage stats:', error);
    }
  }

  private updateTrendingQuery(query: string, category: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO trending_queries (query, category, count, last_seen)
      VALUES (?, ?, 1, ?)
      ON CONFLICT(query, category) DO UPDATE SET
        count = count + 1,
        last_seen = excluded.last_seen
    `);

    try {
      stmt.run(query.toLowerCase().trim(), category, Date.now());
    } catch (error) {
      console.error('[SQLite Cache] Error updating trending query:', error);
    }
  }

  private calculateSimilarity(query1: string, query2: string): number {
    const words1 = new Set(query1.toLowerCase().split(' '));
    const words2 = new Set(query2.toLowerCase().split(' '));
    
    const words1Array = Array.from(words1);
    const words2Array = Array.from(words2);
    
    const intersection = new Set(words1Array.filter(x => words2.has(x)));
    const union = new Set([...words1Array, ...words2Array]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateTrendScore(count: number, lastSeen: number): number {
    const hoursAgo = (Date.now() - lastSeen) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (hoursAgo / 168)); // Decay over 1 week
    const popularityScore = Math.log(count + 1) / 10; // Logarithmic popularity
    
    return (recencyScore * 0.6) + (popularityScore * 0.4);
  }

  private cleanExpiredEntries(): void {
    const stmt = this.db.prepare(`
      DELETE FROM suggestion_cache WHERE expires_at < ?
    `);

    try {
      const result = stmt.run(Date.now());
      if (result.changes > 0) {
        console.log(`[SQLite Cache] Cleaned ${result.changes} expired entries`);
      }

      // Also clean old trending queries (older than 30 days)
      const trendingStmt = this.db.prepare(`
        DELETE FROM trending_queries WHERE last_seen < ?
      `);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      trendingStmt.run(thirtyDaysAgo);

      // Maintain cache size limit
      this.maintainCacheSize();
    } catch (error) {
      console.error('[SQLite Cache] Error cleaning expired entries:', error);
    }
  }

  private maintainCacheSize(): void {
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM suggestion_cache WHERE expires_at > ?
    `);
    
    const result = countStmt.get(Date.now()) as any;
    const currentSize = result?.total || 0;

    if (currentSize > this.MAX_CACHE_SIZE) {
      const deleteCount = currentSize - this.MAX_CACHE_SIZE;
      const deleteStmt = this.db.prepare(`
        DELETE FROM suggestion_cache 
        WHERE id IN (
          SELECT id FROM suggestion_cache 
          WHERE expires_at > ?
          ORDER BY usage_count ASC, last_used ASC 
          LIMIT ?
        )
      `);

      try {
        const deleteResult = deleteStmt.run(Date.now(), deleteCount);
        console.log(`[SQLite Cache] Removed ${deleteResult.changes} least-used entries to maintain cache size`);
      } catch (error) {
        console.error('[SQLite Cache] Error maintaining cache size:', error);
      }
    }
  }

  private optimizeDatabase(): void {
    try {
      this.db.exec('VACUUM');
      this.db.exec('ANALYZE');
      console.log('[SQLite Cache] Database optimized');
    } catch (error) {
      console.error('[SQLite Cache] Error optimizing database:', error);
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // Backup and restore methods
  async backup(backupPath: string): Promise<void> {
    try {
      this.db.backup(backupPath);
      console.log(`[SQLite Cache] Backup created at ${backupPath}`);
    } catch (error) {
      console.error('[SQLite Cache] Error creating backup:', error);
    }
  }

  async getDetailedStats(): Promise<any> {
    const metrics = this.getCacheMetrics();
    
    // Get performance stats
    const performanceStmt = this.db.prepare(`
      SELECT 
        AVG(usage_count) as avg_usage,
        MAX(usage_count) as max_usage,
        COUNT(DISTINCT category) as categories,
        MIN(created_at) as oldest_entry,
        MAX(created_at) as newest_entry
      FROM suggestion_cache 
      WHERE expires_at > ?
    `);

    const performanceResult = performanceStmt.get(Date.now()) as any;

    return {
      ...metrics,
      performance: {
        averageUsage: Math.round((performanceResult?.avg_usage || 0) * 100) / 100,
        maxUsage: performanceResult?.max_usage || 0,
        totalCategories: performanceResult?.categories || 0,
        oldestEntry: performanceResult?.oldest_entry ? new Date(performanceResult.oldest_entry) : null,
        newestEntry: performanceResult?.newest_entry ? new Date(performanceResult.newest_entry) : null
      },
      cacheStats: {
        hitCount: this.hitCount,
        missCount: this.missCount,
        totalRequests: this.hitCount + this.missCount,
        averageResponseTime: Math.round(this.totalResponseTime / Math.max(this.requestCount, 1) * 100) / 100
      }
    };
  }
}

// Singleton instance
export const sqliteCache = new SQLiteSuggestionCache();