"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackApiError = exports.trackDbError = exports.trackSlowRequest = exports.trackErrorRate = exports.alerting = void 0;
const logger_1 = require("./logger");
const metrics_1 = require("./metrics");
// ═══════════════════════════════════════════════════════════════════════════════
// ALERT HISTORY & STATE
// ═══════════════════════════════════════════════════════════════════════════════
const MAX_ALERT_HISTORY = 1000;
const alertHistory = [];
const lastAlertTime = new Map();
const activeAlerts = new Map();
// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN NOTIFIERS
// ═══════════════════════════════════════════════════════════════════════════════
const consoleNotifier = {
    name: 'console',
    notify: async (alert) => {
        const emoji = {
            info: 'ℹ️',
            warning: '⚠️',
            critical: '🚨',
            emergency: '🔥'
        }[alert.severity];
        const message = `${emoji} ALERT [${alert.severity.toUpperCase()}]: ${alert.ruleName} - ${alert.message}`;
        if (alert.severity === 'emergency' || alert.severity === 'critical') {
            console.error(message);
        }
        else if (alert.severity === 'warning') {
            console.warn(message);
        }
        else {
            console.log(message);
        }
    }
};
const webhookNotifier = {
    name: 'webhook',
    severityFilter: ['critical', 'emergency'],
    notify: async (alert) => {
        const webhookUrl = process.env.ALERT_WEBHOOK_URL;
        if (!webhookUrl)
            return;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to send webhook alert', error, { alertId: alert.id });
        }
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// ALERTING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class AlertingEngine {
    constructor() {
        this.rules = new Map();
        this.notifiers = [consoleNotifier, webhookNotifier];
        this.checkInterval = null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RULE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    registerRule(rule) {
        this.rules.set(rule.id, rule);
        logger_1.logger.debug(`Registered alert rule: ${rule.name}`, { ruleId: rule.id });
    }
    unregisterRule(ruleId) {
        this.rules.delete(ruleId);
    }
    enableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = true;
        }
    }
    disableRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = false;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFIER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    addNotifier(notifier) {
        this.notifiers.push(notifier);
    }
    removeNotifier(name) {
        this.notifiers = this.notifiers.filter(n => n.name !== name);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ALERT FIRING
    // ═══════════════════════════════════════════════════════════════════════════
    async fireAlert(ruleId, message, metadata) {
        const rule = this.rules.get(ruleId);
        if (!rule || !rule.enabled)
            return null;
        // Check cooldown
        const lastAlert = lastAlertTime.get(ruleId) || 0;
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        if (Date.now() - lastAlert < cooldownMs) {
            return null; // Still in cooldown
        }
        // Create alert
        const alert = {
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
        logger_1.logger.warn(`Alert fired: ${rule.name}`, {
            alertId: alert.id,
            severity: alert.severity,
            ...metadata
        });
        // Record metric
        metrics_1.metrics.incCounter('alerts_fired_total', { severity: alert.severity, rule: ruleId });
        // Notify
        await this.notifyAll(alert);
        return alert;
    }
    async resolveAlert(ruleId) {
        const alert = activeAlerts.get(ruleId);
        if (!alert || alert.resolved)
            return;
        alert.resolved = true;
        alert.resolvedAt = new Date();
        activeAlerts.delete(ruleId);
        logger_1.logger.info(`Alert resolved: ${alert.ruleName}`, {
            alertId: alert.id,
            duration: alert.resolvedAt.getTime() - alert.timestamp.getTime()
        });
        metrics_1.metrics.incCounter('alerts_resolved_total', { severity: alert.severity, rule: ruleId });
    }
    async notifyAll(alert) {
        for (const notifier of this.notifiers) {
            // Check severity filter
            if (notifier.severityFilter && !notifier.severityFilter.includes(alert.severity)) {
                continue;
            }
            try {
                await notifier.notify(alert);
            }
            catch (error) {
                logger_1.logger.error(`Notifier ${notifier.name} failed`, error, { alertId: alert.id });
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RULE CHECKING
    // ═══════════════════════════════════════════════════════════════════════════
    async checkRules() {
        for (const [ruleId, rule] of this.rules) {
            if (!rule.enabled)
                continue;
            try {
                const triggered = await rule.condition();
                if (triggered) {
                    await this.fireAlert(ruleId, rule.description);
                }
                else if (activeAlerts.has(ruleId)) {
                    await this.resolveAlert(ruleId);
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to check alert rule: ${rule.name}`, error);
            }
        }
    }
    startChecking(intervalSeconds = 60) {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.checkInterval = setInterval(() => {
            this.checkRules().catch(error => {
                logger_1.logger.error('Alert check cycle failed', error);
            });
        }, intervalSeconds * 1000);
        logger_1.logger.info(`Alert checking started with ${intervalSeconds}s interval`);
    }
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // QUERIES
    // ═══════════════════════════════════════════════════════════════════════════
    getActiveAlerts() {
        return Array.from(activeAlerts.values());
    }
    getAlertHistory(limit = 100) {
        return alertHistory.slice(-limit);
    }
    getAlertsByRule(ruleId) {
        return alertHistory.filter(a => a.ruleId === ruleId);
    }
    getRules() {
        return Array.from(this.rules.values());
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & DEFAULT RULES
// ═══════════════════════════════════════════════════════════════════════════════
exports.alerting = new AlertingEngine();
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT ALERT RULES
// ═══════════════════════════════════════════════════════════════════════════════
// High Error Rate
let errorCount5Min = 0;
let requestCount5Min = 0;
const trackErrorRate = (isError) => {
    requestCount5Min++;
    if (isError)
        errorCount5Min++;
    // Reset every 5 minutes
    setTimeout(() => {
        requestCount5Min = Math.max(0, requestCount5Min - 1);
        if (isError)
            errorCount5Min = Math.max(0, errorCount5Min - 1);
    }, 5 * 60 * 1000);
};
exports.trackErrorRate = trackErrorRate;
exports.alerting.registerRule({
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Error rate exceeded 10% in the last 5 minutes',
    severity: 'critical',
    cooldownMinutes: 15,
    enabled: true,
    condition: () => {
        if (requestCount5Min < 10)
            return false; // Need minimum samples
        return (errorCount5Min / requestCount5Min) > 0.1;
    }
});
// High Memory Usage
exports.alerting.registerRule({
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
const trackSlowRequest = () => {
    slowRequestCount++;
    setTimeout(() => {
        slowRequestCount = Math.max(0, slowRequestCount - 1);
    }, 5 * 60 * 1000);
};
exports.trackSlowRequest = trackSlowRequest;
exports.alerting.registerRule({
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
const trackDbError = () => {
    dbErrorCount++;
    setTimeout(() => {
        dbErrorCount = Math.max(0, dbErrorCount - 1);
    }, 5 * 60 * 1000);
};
exports.trackDbError = trackDbError;
exports.alerting.registerRule({
    id: 'db-errors',
    name: 'Database Errors',
    description: 'Multiple database errors detected in the last 5 minutes',
    severity: 'critical',
    cooldownMinutes: 10,
    enabled: true,
    condition: () => dbErrorCount > 5
});
// External API Failures
const apiErrors = new Map();
const trackApiError = (api) => {
    const count = apiErrors.get(api) || 0;
    apiErrors.set(api, count + 1);
    setTimeout(() => {
        const current = apiErrors.get(api) || 0;
        apiErrors.set(api, Math.max(0, current - 1));
    }, 5 * 60 * 1000);
};
exports.trackApiError = trackApiError;
exports.alerting.registerRule({
    id: 'stripe-api-errors',
    name: 'Stripe API Errors',
    description: 'Multiple Stripe API errors detected',
    severity: 'critical',
    cooldownMinutes: 15,
    enabled: true,
    condition: () => (apiErrors.get('stripe') || 0) > 3
});
exports.alerting.registerRule({
    id: 'openai-api-errors',
    name: 'OpenAI API Errors',
    description: 'Multiple OpenAI API errors detected',
    severity: 'warning',
    cooldownMinutes: 15,
    enabled: true,
    condition: () => (apiErrors.get('openai') || 0) > 5
});
// Cost Threshold Alert
exports.alerting.registerRule({
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
exports.alerting.registerRule({
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
exports.default = exports.alerting;
