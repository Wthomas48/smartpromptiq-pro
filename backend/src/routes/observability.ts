/**
 * SmartPromptIQ Observability Routes
 *
 * Endpoints:
 * - GET /metrics - Prometheus-compatible metrics
 * - GET /health - Comprehensive health check
 * - GET /health/live - Kubernetes liveness probe
 * - GET /health/ready - Kubernetes readiness probe
 * - GET /observability/dashboard - Observability dashboard data
 * - GET /observability/alerts - Active and recent alerts
 * - GET /observability/logs - Recent log entries (dev only)
 */

import { Router, Request, Response } from 'express';
import { metrics } from '../lib/metrics';
import { alerting } from '../lib/alerting';
import { logger } from '../lib/logger';
import { getDatabaseMetricsSummary, checkDatabaseHealth, getSlowQueries } from '../lib/dbMonitoring';
import { getApiHealth, getUnhealthyApis } from '../lib/apiInstrumentation';
import prisma from '../config/database';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════════
// PROMETHEUS METRICS ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /metrics
 * Returns metrics in Prometheus text format
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const prometheusMetrics = metrics.getPrometheusMetrics();

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusMetrics);
  } catch (error) {
    logger.error('Failed to generate Prometheus metrics', error);
    res.status(500).send('# Error generating metrics');
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /health
 * Comprehensive health check with all dependencies
 */
router.get('/health', async (req: Request, res: Response) => {
  const startTime = performance.now();

  try {
    // Check database
    const dbHealth = await checkDatabaseHealth(prisma);

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    // Check external APIs
    const unhealthyApis = getUnhealthyApis();

    // Get active alerts
    const activeAlerts = alerting.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');

    // Determine overall health
    const isHealthy = dbHealth.healthy && criticalAlerts.length === 0;

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,

      checks: {
        database: {
          status: dbHealth.healthy ? 'healthy' : 'unhealthy',
          latency: dbHealth.latency,
          error: dbHealth.error
        },
        memory: {
          status: heapUsedMB / heapTotalMB < 0.9 ? 'healthy' : 'warning',
          heapUsedMB,
          heapTotalMB,
          percentUsed: Math.round((heapUsedMB / heapTotalMB) * 100)
        },
        externalApis: {
          status: unhealthyApis.length === 0 ? 'healthy' : 'degraded',
          unhealthy: unhealthyApis.map(a => a.name)
        },
        alerts: {
          status: criticalAlerts.length === 0 ? 'healthy' : 'warning',
          activeCount: activeAlerts.length,
          criticalCount: criticalAlerts.length
        }
      },

      responseTime: Math.round(performance.now() - startTime)
    };

    res.status(isHealthy ? 200 : 503).json(healthData);
  } catch (error) {
    logger.error('Health check failed', error);

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Math.round(performance.now() - startTime)
    });
  }
});

/**
 * GET /health/live
 * Kubernetes liveness probe - is the process alive?
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe - is the service ready to accept traffic?
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Quick database check
    const dbHealth = await checkDatabaseHealth(prisma);

    if (dbHealth.healthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        reason: 'database_unavailable',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: 'health_check_failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /observability/dashboard
 * Returns comprehensive observability data for dashboard
 */
router.get('/observability/dashboard', async (req: Request, res: Response) => {
  try {
    // Get all metrics
    const metricsData = metrics.getMetricsJSON();

    // Get database stats
    const dbStats = getDatabaseMetricsSummary();
    const slowQueries = getSlowQueries().slice(0, 10);

    // Get API health
    const apiHealth = getApiHealth();

    // Get alerts
    const activeAlerts = alerting.getActiveAlerts();
    const recentAlerts = alerting.getAlertHistory(20);
    const alertRules = alerting.getRules();

    // Get memory stats
    const memoryUsage = process.memoryUsage();

    const dashboard = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),

      system: {
        memory: {
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          externalMB: Math.round(memoryUsage.external / 1024 / 1024),
          rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },

      database: {
        ...dbStats,
        slowQueries
      },

      externalApis: apiHealth,

      alerts: {
        active: activeAlerts,
        recent: recentAlerts,
        rules: alertRules.map(r => ({
          id: r.id,
          name: r.name,
          severity: r.severity,
          enabled: r.enabled
        }))
      },

      metrics: metricsData
    };

    res.json(dashboard);
  } catch (error) {
    logger.error('Failed to generate dashboard data', error);
    res.status(500).json({
      error: 'Failed to generate dashboard data'
    });
  }
});

/**
 * GET /observability/alerts
 * Returns alert information
 */
router.get('/observability/alerts', (req: Request, res: Response) => {
  const active = alerting.getActiveAlerts();
  const history = alerting.getAlertHistory(parseInt(req.query.limit as string) || 50);
  const rules = alerting.getRules();

  res.json({
    active,
    history,
    rules: rules.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      severity: r.severity,
      cooldownMinutes: r.cooldownMinutes,
      enabled: r.enabled
    }))
  });
});

/**
 * POST /observability/alerts/:ruleId/enable
 * Enable an alert rule
 */
router.post('/observability/alerts/:ruleId/enable', (req: Request, res: Response) => {
  alerting.enableRule(req.params.ruleId);
  res.json({ success: true, ruleId: req.params.ruleId, enabled: true });
});

/**
 * POST /observability/alerts/:ruleId/disable
 * Disable an alert rule
 */
router.post('/observability/alerts/:ruleId/disable', (req: Request, res: Response) => {
  alerting.disableRule(req.params.ruleId);
  res.json({ success: true, ruleId: req.params.ruleId, enabled: false });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DEBUG ENDPOINTS (Development Only)
// ═══════════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'development') {
  /**
   * GET /observability/debug
   * Returns debug information (development only)
   */
  router.get('/observability/debug', (req: Request, res: Response) => {
    res.json({
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      env: {
        LOG_LEVEL: process.env.LOG_LEVEL,
        SLOW_REQUEST_THRESHOLD_MS: process.env.SLOW_REQUEST_THRESHOLD_MS,
        SLOW_QUERY_THRESHOLD_MS: process.env.SLOW_QUERY_THRESHOLD_MS
      }
    });
  });

  /**
   * POST /observability/test-alert
   * Trigger a test alert (development only)
   */
  router.post('/observability/test-alert', async (req: Request, res: Response) => {
    const alert = await alerting.fireAlert(
      'test-alert',
      'This is a test alert triggered manually',
      { triggeredBy: 'api', timestamp: new Date().toISOString() }
    );

    res.json({
      success: true,
      alert
    });
  });
}

// Register test alert rule for development
if (process.env.NODE_ENV === 'development') {
  alerting.registerRule({
    id: 'test-alert',
    name: 'Test Alert',
    description: 'Manually triggered test alert',
    severity: 'info',
    cooldownMinutes: 1,
    enabled: true,
    condition: () => false // Never auto-triggers
  });
}

export default router;
