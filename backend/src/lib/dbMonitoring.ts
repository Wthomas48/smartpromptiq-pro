/**
 * SmartPromptIQ Database Monitoring
 *
 * Features:
 * - Query timing and logging
 * - Slow query detection
 * - Connection pool monitoring
 * - Query pattern analysis
 * - Error tracking
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { metrics } from './metrics';
import { trackDbError } from './alerting';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '500', 10);
const LOG_ALL_QUERIES = process.env.LOG_ALL_QUERIES === 'true';

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

interface QueryStats {
  model: string;
  action: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  errors: number;
  slowQueries: number;
}

const queryStats: Map<string, QueryStats> = new Map();

const updateQueryStats = (
  model: string,
  action: string,
  duration: number,
  isError: boolean
): void => {
  const key = `${model}.${action}`;
  let stats = queryStats.get(key);

  if (!stats) {
    stats = {
      model,
      action,
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: 0,
      slowQueries: 0
    };
    queryStats.set(key, stats);
  }

  stats.count++;
  stats.totalDuration += duration;
  stats.avgDuration = stats.totalDuration / stats.count;
  stats.minDuration = Math.min(stats.minDuration, duration);
  stats.maxDuration = Math.max(stats.maxDuration, duration);

  if (isError) {
    stats.errors++;
  }

  if (duration > SLOW_QUERY_THRESHOLD_MS) {
    stats.slowQueries++;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRISMA MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

export const createMonitoredPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' }
    ]
  });

  // Query logging (raw queries)
  prisma.$on('query' as any, (e: any) => {
    if (LOG_ALL_QUERIES) {
      logger.debug('Prisma Query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target
      });
    }
  });

  // Error logging
  prisma.$on('error' as any, (e: any) => {
    logger.error('Prisma Error', new Error(e.message), {
      target: e.target
    });
    trackDbError();
  });

  // Warning logging
  prisma.$on('warn' as any, (e: any) => {
    logger.warn('Prisma Warning', {
      message: e.message,
      target: e.target
    });
  });

  // Add query timing middleware
  prisma.$use(async (params, next) => {
    const startTime = performance.now();
    const model = params.model || 'unknown';
    const action = params.action;

    try {
      const result = await next(params);
      const duration = Math.round(performance.now() - startTime);

      // Update statistics
      updateQueryStats(model, action, duration, false);

      // Record metrics
      metrics.recordDbQuery(action, model, duration, true);

      // Log query
      logger.dbQuery(action, model, duration, true, {
        args: LOG_ALL_QUERIES ? params.args : undefined
      });

      // Slow query warning
      if (duration > SLOW_QUERY_THRESHOLD_MS) {
        logger.warn(`Slow database query: ${model}.${action}`, {
          duration,
          threshold: SLOW_QUERY_THRESHOLD_MS,
          args: params.args
        });
      }

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      // Update statistics
      updateQueryStats(model, action, duration, true);

      // Record metrics
      metrics.recordDbQuery(action, model, duration, false);

      // Log error
      logger.error(`Database query failed: ${model}.${action}`, error, {
        duration,
        args: params.args
      });

      // Track for alerting
      trackDbError();

      throw error;
    }
  });

  return prisma;
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

export const getQueryStats = (): QueryStats[] => {
  return Array.from(queryStats.values());
};

export const getSlowQueries = (): QueryStats[] => {
  return Array.from(queryStats.values())
    .filter(s => s.slowQueries > 0)
    .sort((a, b) => b.avgDuration - a.avgDuration);
};

export const getTopQueriesByCount = (limit: number = 10): QueryStats[] => {
  return Array.from(queryStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getTopQueriesByDuration = (limit: number = 10): QueryStats[] => {
  return Array.from(queryStats.values())
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, limit);
};

export const getErrorProneQueries = (): QueryStats[] => {
  return Array.from(queryStats.values())
    .filter(s => s.errors > 0)
    .sort((a, b) => (b.errors / b.count) - (a.errors / a.count));
};

export const resetQueryStats = (): void => {
  queryStats.clear();
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

export const checkDatabaseHealth = async (prisma: PrismaClient): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> => {
  const startTime = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Math.round(performance.now() - startTime);

    return {
      healthy: true,
      latency
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE METRICS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export const getDatabaseMetricsSummary = (): {
  totalQueries: number;
  totalErrors: number;
  totalSlowQueries: number;
  avgDuration: number;
  topSlowQueries: { model: string; action: string; avgDuration: number }[];
} => {
  const stats = Array.from(queryStats.values());

  const totalQueries = stats.reduce((sum, s) => sum + s.count, 0);
  const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0);
  const totalSlowQueries = stats.reduce((sum, s) => sum + s.slowQueries, 0);
  const totalDuration = stats.reduce((sum, s) => sum + s.totalDuration, 0);
  const avgDuration = totalQueries > 0 ? Math.round(totalDuration / totalQueries) : 0;

  const topSlowQueries = stats
    .filter(s => s.slowQueries > 0)
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 5)
    .map(s => ({
      model: s.model,
      action: s.action,
      avgDuration: Math.round(s.avgDuration)
    }));

  return {
    totalQueries,
    totalErrors,
    totalSlowQueries,
    avgDuration,
    topSlowQueries
  };
};

export default {
  createMonitoredPrismaClient,
  getQueryStats,
  getSlowQueries,
  getTopQueriesByCount,
  getTopQueriesByDuration,
  getErrorProneQueries,
  checkDatabaseHealth,
  getDatabaseMetricsSummary,
  resetQueryStats
};
