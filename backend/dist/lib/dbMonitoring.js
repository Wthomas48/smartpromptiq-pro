"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseMetricsSummary = exports.checkDatabaseHealth = exports.resetQueryStats = exports.getErrorProneQueries = exports.getTopQueriesByDuration = exports.getTopQueriesByCount = exports.getSlowQueries = exports.getQueryStats = exports.createMonitoredPrismaClient = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const metrics_1 = require("./metrics");
const alerting_1 = require("./alerting");
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '500', 10);
const LOG_ALL_QUERIES = process.env.LOG_ALL_QUERIES === 'true';
const queryStats = new Map();
const updateQueryStats = (model, action, duration, isError) => {
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
const createMonitoredPrismaClient = () => {
    const prisma = new client_1.PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' }
        ]
    });
    // Query logging (raw queries)
    prisma.$on('query', (e) => {
        if (LOG_ALL_QUERIES) {
            logger_1.logger.debug('Prisma Query', {
                query: e.query,
                params: e.params,
                duration: e.duration,
                target: e.target
            });
        }
    });
    // Error logging
    prisma.$on('error', (e) => {
        logger_1.logger.error('Prisma Error', new Error(e.message), {
            target: e.target
        });
        (0, alerting_1.trackDbError)();
    });
    // Warning logging
    prisma.$on('warn', (e) => {
        logger_1.logger.warn('Prisma Warning', {
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
            metrics_1.metrics.recordDbQuery(action, model, duration, true);
            // Log query
            logger_1.logger.dbQuery(action, model, duration, true, {
                args: LOG_ALL_QUERIES ? params.args : undefined
            });
            // Slow query warning
            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                logger_1.logger.warn(`Slow database query: ${model}.${action}`, {
                    duration,
                    threshold: SLOW_QUERY_THRESHOLD_MS,
                    args: params.args
                });
            }
            return result;
        }
        catch (error) {
            const duration = Math.round(performance.now() - startTime);
            // Update statistics
            updateQueryStats(model, action, duration, true);
            // Record metrics
            metrics_1.metrics.recordDbQuery(action, model, duration, false);
            // Log error
            logger_1.logger.error(`Database query failed: ${model}.${action}`, error, {
                duration,
                args: params.args
            });
            // Track for alerting
            (0, alerting_1.trackDbError)();
            throw error;
        }
    });
    return prisma;
};
exports.createMonitoredPrismaClient = createMonitoredPrismaClient;
// ═══════════════════════════════════════════════════════════════════════════════
// QUERY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════
const getQueryStats = () => {
    return Array.from(queryStats.values());
};
exports.getQueryStats = getQueryStats;
const getSlowQueries = () => {
    return Array.from(queryStats.values())
        .filter(s => s.slowQueries > 0)
        .sort((a, b) => b.avgDuration - a.avgDuration);
};
exports.getSlowQueries = getSlowQueries;
const getTopQueriesByCount = (limit = 10) => {
    return Array.from(queryStats.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};
exports.getTopQueriesByCount = getTopQueriesByCount;
const getTopQueriesByDuration = (limit = 10) => {
    return Array.from(queryStats.values())
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, limit);
};
exports.getTopQueriesByDuration = getTopQueriesByDuration;
const getErrorProneQueries = () => {
    return Array.from(queryStats.values())
        .filter(s => s.errors > 0)
        .sort((a, b) => (b.errors / b.count) - (a.errors / a.count));
};
exports.getErrorProneQueries = getErrorProneQueries;
const resetQueryStats = () => {
    queryStats.clear();
};
exports.resetQueryStats = resetQueryStats;
// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════
const checkDatabaseHealth = async (prisma) => {
    const startTime = performance.now();
    try {
        await prisma.$queryRaw `SELECT 1`;
        const latency = Math.round(performance.now() - startTime);
        return {
            healthy: true,
            latency
        };
    }
    catch (error) {
        const latency = Math.round(performance.now() - startTime);
        return {
            healthy: false,
            latency,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE METRICS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
const getDatabaseMetricsSummary = () => {
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
exports.getDatabaseMetricsSummary = getDatabaseMetricsSummary;
exports.default = {
    createMonitoredPrismaClient: exports.createMonitoredPrismaClient,
    getQueryStats: exports.getQueryStats,
    getSlowQueries: exports.getSlowQueries,
    getTopQueriesByCount: exports.getTopQueriesByCount,
    getTopQueriesByDuration: exports.getTopQueriesByDuration,
    getErrorProneQueries: exports.getErrorProneQueries,
    checkDatabaseHealth: exports.checkDatabaseHealth,
    getDatabaseMetricsSummary: exports.getDatabaseMetricsSummary,
    resetQueryStats: exports.resetQueryStats
};
