/**
 * SmartPromptIQ Alerting System
 *
 * Features:
 * - Alert rules with thresholds
 * - Alert severity levels
 * - Cooldown periods to prevent alert fatigue
 * - Multiple notification channels (email, webhook, console)
 * - Alert history tracking
 * - Automatic recovery detection
 */

import { logger } from './logger';
import { metrics } from './metrics';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: () => boolean | Promise<boolean>;
  cooldownMinutes: number;
  enabled: boolean;
  tags?: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AlertNotifier {
  name: string;
  notify: (alert: Alert) => Promise<void>;
  severityFilter?: AlertSeverity[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT HISTORY & STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_ALERT_HISTORY = 1000;
const alertHistory: Alert[] = [];
const lastAlertTime: Map<string, number> = new Map();
const activeAlerts: Map<string, Alert> = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN NOTIFIERS
// ═══════════════════════════════════════════════════════════════════════════════

const consoleNotifier: AlertNotifier = {
  name: 'console',
  notify: async (alert: Alert) => {
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
      emergency: '🔥'
    }[alert.severity];

    const message = `${emoji} ALERT [${alert.severity.toUpperCase()}]: ${alert.ruleName} - ${alert.message}`;

    if (alert.severity === 'emergency' || alert.severity === 'critical') {
      console.error(message);
    } else if (alert.severity === 'warning') {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
};

const webhookNotifier: AlertNotifier = {
  name: 'webhook',
  severityFilter: ['critical', 'emergency'],
  notify: async (alert: Alert) => {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${alert.severity.toUpperCase()}*: ${alert.ruleName}`,
          alert: {
            id: alert.id,
            severity: alert.severity,
            message: alert.message,
            timestamp: alert.timestamp.toISOString(),
            metadata: alert.metadata
          }
        })
      });
    } catch (error) {
      logger.error('Failed to send webhook alert', error, { alertId: alert.id });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class AlertingEngine {
  private rules: Map<string, AlertRule> = new Map();
  private notifiers: AlertNotifier[] = [consoleNotifier, webhookNotifier];
  private checkInterval: NodeJS.Timeout | null = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    logger.debug(`Registered alert rule: ${rule.name}`, { ruleId: rule.id });
  }

  unregisterRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFIER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  addNotifier(notifier: AlertNotifier): void {
    this.notifiers.push(notifier);
  }

  removeNotifier(name: string): void {
    this.notifiers = this.notifiers.filter(n => n.name !== name);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ALERT FIRING
  // ═══════════════════════════════════════════════════════════════════════════

  async fireAlert(
    ruleId: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<Alert | null> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) return null;

    // Check cooldown
    const lastAlert = lastAlertTime.get(ruleId) || 0;
    const cooldownMs = rule.cooldownMinutes * 60 * 1000;
    if (Date.now() - lastAlert < cooldownMs) {
      return null; // Still in cooldown
    }

    // Create alert
    const alert: Alert = {
      id: `${ruleId}-${Date.now()}`,
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    };

    // Store alert
    alertHistory.push(alert);
    if (alertHistory.length > MAX_ALERT_HISTORY) {
      alertHistory.shift();
    }
    activeAlerts.set(ruleId, alert);
    lastAlertTime.set(ruleId, Date.now());

    // Log alert
    logger.warn(`Alert fired: ${rule.name}`, {
      alertId: alert.id,
      severity: alert.severity,
      ...metadata
    });

    // Record metric
    metrics.incCounter('alerts_fired_total', { severity: alert.severity, rule: ruleId });

    // Notify
    await this.notifyAll(alert);

    return alert;
  }

  async resolveAlert(ruleId: string): Promise<void> {
    const alert = activeAlerts.get(ruleId);
    if (!alert || alert.resolved) return;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    activeAlerts.delete(ruleId);

    logger.info(`Alert resolved: ${alert.ruleName}`, {
      alertId: alert.id,
      duration: alert.resolvedAt.getTime() - alert.timestamp.getTime()
    });

    metrics.incCounter('alerts_resolved_total', { severity: alert.severity, rule: ruleId });
  }

  private async notifyAll(alert: Alert): Promise<void> {
    for (const notifier of this.notifiers) {
      // Check severity filter
      if (notifier.severityFilter && !notifier.severityFilter.includes(alert.severity)) {
        continue;
      }

      try {
        await notifier.notify(alert);
      } catch (error) {
        logger.error(`Notifier ${notifier.name} failed`, error, { alertId: alert.id });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE CHECKING
  // ═══════════════════════════════════════════════════════════════════════════

  async checkRules(): Promise<void> {
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      try {
        const triggered = await rule.condition();

        if (triggered) {
          await this.fireAlert(ruleId, rule.description);
        } else if (activeAlerts.has(ruleId)) {
          await this.resolveAlert(ruleId);
        }
      } catch (error) {
        logger.error(`Failed to check alert rule: ${rule.name}`, error);
      }
    }
  }

  startChecking(intervalSeconds: number = 60): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkRules().catch(error => {
        logger.error('Alert check cycle failed', error);
      });
    }, intervalSeconds * 1000);

    logger.info(`Alert checking started with ${intervalSeconds}s interval`);
  }

  stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════════════════════

  getActiveAlerts(): Alert[] {
    return Array.from(activeAlerts.values());
  }

  getAlertHistory(limit: number = 100): Alert[] {
    return alertHistory.slice(-limit);
  }

  getAlertsByRule(ruleId: string): Alert[] {
    return alertHistory.filter(a => a.ruleId === ruleId);
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & DEFAULT RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const alerting = new AlertingEngine();

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT ALERT RULES
// ═══════════════════════════════════════════════════════════════════════════════

// High Error Rate
let errorCount5Min = 0;
let requestCount5Min = 0;

export const trackErrorRate = (isError: boolean): void => {
  requestCount5Min++;
  if (isError) errorCount5Min++;

  // Reset every 5 minutes
  setTimeout(() => {
    requestCount5Min = Math.max(0, requestCount5Min - 1);
    if (isError) errorCount5Min = Math.max(0, errorCount5Min - 1);
  }, 5 * 60 * 1000);
};

alerting.registerRule({
  id: 'high-error-rate',
  name: 'High Error Rate',
  description: 'Error rate exceeded 10% in the last 5 minutes',
  severity: 'critical',
  cooldownMinutes: 15,
  enabled: true,
  condition: () => {
    if (requestCount5Min < 10) return false; // Need minimum samples
    return (errorCount5Min / requestCount5Min) > 0.1;
  }
});

// High Memory Usage
alerting.registerRule({
  id: 'high-memory',
  name: 'High Memory Usage',
  description: 'Memory usage exceeded 90% of heap limit',
  severity: 'warning',
  cooldownMinutes: 30,
  enabled: true,
  condition: () => {
    const usage = process.memoryUsage();
    const heapLimit = usage.heapTotal;
    const heapUsed = usage.heapUsed;
    return (heapUsed / heapLimit) > 0.9;
  }
});

// Slow Response Times
let slowRequestCount = 0;

export const trackSlowRequest = (): void => {
  slowRequestCount++;
  setTimeout(() => {
    slowRequestCount = Math.max(0, slowRequestCount - 1);
  }, 5 * 60 * 1000);
};

alerting.registerRule({
  id: 'slow-responses',
  name: 'Slow Response Times',
  description: 'More than 10 slow requests (>3s) in the last 5 minutes',
  severity: 'warning',
  cooldownMinutes: 15,
  enabled: true,
  condition: () => slowRequestCount > 10
});

// Database Connection Issues
let dbErrorCount = 0;

export const trackDbError = (): void => {
  dbErrorCount++;
  setTimeout(() => {
    dbErrorCount = Math.max(0, dbErrorCount - 1);
  }, 5 * 60 * 1000);
};

alerting.registerRule({
  id: 'db-errors',
  name: 'Database Errors',
  description: 'Multiple database errors detected in the last 5 minutes',
  severity: 'critical',
  cooldownMinutes: 10,
  enabled: true,
  condition: () => dbErrorCount > 5
});

// External API Failures
const apiErrors: Map<string, number> = new Map();

export const trackApiError = (api: string): void => {
  const count = apiErrors.get(api) || 0;
  apiErrors.set(api, count + 1);

  setTimeout(() => {
    const current = apiErrors.get(api) || 0;
    apiErrors.set(api, Math.max(0, current - 1));
  }, 5 * 60 * 1000);
};

alerting.registerRule({
  id: 'stripe-api-errors',
  name: 'Stripe API Errors',
  description: 'Multiple Stripe API errors detected',
  severity: 'critical',
  cooldownMinutes: 15,
  enabled: true,
  condition: () => (apiErrors.get('stripe') || 0) > 3
});

alerting.registerRule({
  id: 'openai-api-errors',
  name: 'OpenAI API Errors',
  description: 'Multiple OpenAI API errors detected',
  severity: 'warning',
  cooldownMinutes: 15,
  enabled: true,
  condition: () => (apiErrors.get('openai') || 0) > 5
});

// Cost Threshold Alert
alerting.registerRule({
  id: 'daily-cost-warning',
  name: 'Daily Cost Warning',
  description: 'Daily API costs approaching budget limit (70%)',
  severity: 'warning',
  cooldownMinutes: 60,
  enabled: true,
  condition: () => {
    const dailyLimit = parseFloat(process.env.DAILY_COST_LIMIT || '100');
    const currentCost = parseFloat(process.env.CURRENT_DAILY_COST || '0');
    return currentCost > dailyLimit * 0.7;
  }
});

alerting.registerRule({
  id: 'daily-cost-critical',
  name: 'Daily Cost Critical',
  description: 'Daily API costs exceeded 90% of budget',
  severity: 'critical',
  cooldownMinutes: 30,
  enabled: true,
  condition: () => {
    const dailyLimit = parseFloat(process.env.DAILY_COST_LIMIT || '100');
    const currentCost = parseFloat(process.env.CURRENT_DAILY_COST || '0');
    return currentCost > dailyLimit * 0.9;
  }
});

export default alerting;
