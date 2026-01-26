"use strict";
/**
 * SmartPromptIQ Metrics Collection System
 *
 * Features:
 * - Prometheus-compatible metrics format
 * - HTTP request metrics (latency, status codes, throughput)
 * - Business metrics (subscriptions, tokens, revenue)
 * - External API metrics (Stripe, OpenAI, ElevenLabs)
 * - Database query metrics
 * - Error rate tracking
 * - Custom counters and gauges
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// HISTOGRAM BUCKETS
// ═══════════════════════════════════════════════════════════════════════════════
const HTTP_LATENCY_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const DB_LATENCY_BUCKETS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500];
const EXTERNAL_API_BUCKETS = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000];
// ═══════════════════════════════════════════════════════════════════════════════
// METRICS REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
class MetricsRegistry {
    constructor() {
        this.metrics = new Map();
        this.startTime = Date.now();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // METRIC REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    registerCounter(name, help) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                name,
                help,
                type: 'counter',
                values: new Map()
            });
        }
    }
    registerGauge(name, help) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                name,
                help,
                type: 'gauge',
                values: new Map()
            });
        }
    }
    registerHistogram(name, help, buckets) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                name,
                help,
                type: 'histogram',
                buckets,
                values: new Map()
            });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // METRIC OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    labelsToKey(labels) {
        return Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
    }
    incCounter(name, labels = {}, value = 1) {
        const metric = this.metrics.get(name);
        if (!metric || metric.type !== 'counter')
            return;
        const key = this.labelsToKey(labels);
        const current = metric.values.get(key) || 0;
        metric.values.set(key, current + value);
    }
    setGauge(name, value, labels = {}) {
        const metric = this.metrics.get(name);
        if (!metric || metric.type !== 'gauge')
            return;
        const key = this.labelsToKey(labels);
        metric.values.set(key, value);
    }
    incGauge(name, labels = {}, value = 1) {
        const metric = this.metrics.get(name);
        if (!metric || metric.type !== 'gauge')
            return;
        const key = this.labelsToKey(labels);
        const current = metric.values.get(key) || 0;
        metric.values.set(key, current + value);
    }
    decGauge(name, labels = {}, value = 1) {
        this.incGauge(name, labels, -value);
    }
    observeHistogram(name, value, labels = {}) {
        const metric = this.metrics.get(name);
        if (!metric || metric.type !== 'histogram')
            return;
        const key = this.labelsToKey(labels);
        let data = metric.values.get(key);
        if (!data) {
            data = {
                buckets: new Array(metric.buckets.length).fill(0),
                sum: 0,
                count: 0
            };
            metric.values.set(key, data);
        }
        data.sum += value;
        data.count += 1;
        for (let i = 0; i < metric.buckets.length; i++) {
            if (value <= metric.buckets[i]) {
                data.buckets[i] += 1;
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PROMETHEUS EXPORT
    // ═══════════════════════════════════════════════════════════════════════════
    toPrometheus() {
        const lines = [];
        // Add process metrics
        lines.push(`# HELP process_uptime_seconds Process uptime in seconds`);
        lines.push(`# TYPE process_uptime_seconds gauge`);
        lines.push(`process_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}`);
        lines.push('');
        lines.push(`# HELP process_memory_heap_bytes Process heap memory usage`);
        lines.push(`# TYPE process_memory_heap_bytes gauge`);
        lines.push(`process_memory_heap_bytes ${process.memoryUsage().heapUsed}`);
        lines.push('');
        // Export registered metrics
        for (const metric of this.metrics.values()) {
            lines.push(`# HELP ${metric.name} ${metric.help}`);
            lines.push(`# TYPE ${metric.name} ${metric.type}`);
            if (metric.type === 'counter' || metric.type === 'gauge') {
                for (const [labels, value] of metric.values) {
                    const labelStr = labels ? `{${labels}}` : '';
                    lines.push(`${metric.name}${labelStr} ${value}`);
                }
            }
            else if (metric.type === 'histogram') {
                const histMetric = metric;
                for (const [labels, data] of histMetric.values) {
                    const baseLabels = labels ? `${labels},` : '';
                    // Bucket values (cumulative)
                    let cumulative = 0;
                    for (let i = 0; i < histMetric.buckets.length; i++) {
                        cumulative += data.buckets[i];
                        lines.push(`${metric.name}_bucket{${baseLabels}le="${histMetric.buckets[i]}"} ${cumulative}`);
                    }
                    lines.push(`${metric.name}_bucket{${baseLabels}le="+Inf"} ${data.count}`);
                    lines.push(`${metric.name}_sum{${labels || ''}} ${data.sum}`);
                    lines.push(`${metric.name}_count{${labels || ''}} ${data.count}`);
                }
            }
            lines.push('');
        }
        return lines.join('\n');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // JSON EXPORT (for dashboard)
    // ═══════════════════════════════════════════════════════════════════════════
    toJSON() {
        const result = {
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memory: process.memoryUsage(),
            metrics: {}
        };
        for (const metric of this.metrics.values()) {
            result.metrics[metric.name] = {
                type: metric.type,
                help: metric.help,
                values: Object.fromEntries(metric.values)
            };
        }
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RESET (for testing)
    // ═══════════════════════════════════════════════════════════════════════════
    reset() {
        for (const metric of this.metrics.values()) {
            metric.values.clear();
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// METRICS FACADE (HIGH-LEVEL API)
// ═══════════════════════════════════════════════════════════════════════════════
class Metrics {
    constructor() {
        this.registry = new MetricsRegistry();
        this.registerDefaultMetrics();
    }
    registerDefaultMetrics() {
        // HTTP Metrics
        this.registry.registerCounter('http_requests_total', 'Total HTTP requests');
        this.registry.registerHistogram('http_request_duration_ms', 'HTTP request duration in milliseconds', HTTP_LATENCY_BUCKETS);
        this.registry.registerCounter('http_response_size_bytes_total', 'Total HTTP response size in bytes');
        // Error Metrics
        this.registry.registerCounter('errors_total', 'Total errors');
        this.registry.registerCounter('slow_requests_total', 'Total slow requests');
        // Security Metrics
        this.registry.registerCounter('security_events_total', 'Total security events');
        // Database Metrics
        this.registry.registerCounter('db_queries_total', 'Total database queries');
        this.registry.registerHistogram('db_query_duration_ms', 'Database query duration in milliseconds', DB_LATENCY_BUCKETS);
        // External API Metrics
        this.registry.registerCounter('external_api_calls_total', 'Total external API calls');
        this.registry.registerHistogram('external_api_duration_ms', 'External API call duration in milliseconds', EXTERNAL_API_BUCKETS);
        // Business Metrics
        this.registry.registerCounter('tokens_used_total', 'Total tokens used');
        this.registry.registerCounter('tokens_purchased_total', 'Total tokens purchased');
        this.registry.registerCounter('subscriptions_total', 'Total subscription events');
        this.registry.registerCounter('revenue_cents_total', 'Total revenue in cents');
        // Active Connections
        this.registry.registerGauge('active_connections', 'Number of active connections');
        this.registry.registerGauge('active_users', 'Number of active users');
        // Queue Metrics
        this.registry.registerGauge('queue_size', 'Current queue size');
        this.registry.registerCounter('queue_jobs_processed_total', 'Total queue jobs processed');
        // Alert Metrics
        this.registry.registerCounter('alerts_fired_total', 'Total alerts fired');
        this.registry.registerCounter('alerts_resolved_total', 'Total alerts resolved');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ALERT METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    incCounter(name, labels = {}, value = 1) {
        this.registry.incCounter(name, labels, value);
    }
    registerCounter(name, help) {
        this.registry.registerCounter(name, help);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HTTP METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordHttpRequest(method, path, statusCode, durationMs) {
        const statusClass = `${Math.floor(statusCode / 100)}xx`;
        this.registry.incCounter('http_requests_total', { method, path, status: statusCode, status_class: statusClass });
        this.registry.observeHistogram('http_request_duration_ms', durationMs, { method, path });
    }
    recordResponseSize(method, path, bytes) {
        this.registry.incCounter('http_response_size_bytes_total', { method, path }, bytes);
    }
    recordSlowRequest(method, path, durationMs) {
        this.registry.incCounter('slow_requests_total', { method, path, duration_bucket: this.getDurationBucket(durationMs) });
    }
    getDurationBucket(durationMs) {
        if (durationMs < 3000)
            return '3s';
        if (durationMs < 5000)
            return '5s';
        if (durationMs < 10000)
            return '10s';
        return '10s+';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ERROR METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordError(errorType, path, statusCode) {
        this.registry.incCounter('errors_total', { type: errorType, path, status: statusCode });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordSecurityEvent(eventType, path) {
        this.registry.incCounter('security_events_total', { type: eventType, path });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DATABASE METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordDbQuery(operation, table, durationMs, success) {
        this.registry.incCounter('db_queries_total', { operation, table, success: success ? 'true' : 'false' });
        this.registry.observeHistogram('db_query_duration_ms', durationMs, { operation, table });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EXTERNAL API METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordExternalApiCall(api, operation, durationMs, success) {
        this.registry.incCounter('external_api_calls_total', { api, operation, success: success ? 'true' : 'false' });
        this.registry.observeHistogram('external_api_duration_ms', durationMs, { api, operation });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BUSINESS METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    recordTokenUsage(tokens, action, provider) {
        this.registry.incCounter('tokens_used_total', { action, provider }, tokens);
    }
    recordTokenPurchase(tokens, plan) {
        this.registry.incCounter('tokens_purchased_total', { plan }, tokens);
    }
    recordSubscriptionEvent(event, plan) {
        this.registry.incCounter('subscriptions_total', { event, plan });
    }
    recordRevenue(cents, type) {
        this.registry.incCounter('revenue_cents_total', { type }, cents);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONNECTION METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    setActiveConnections(count) {
        this.registry.setGauge('active_connections', count);
    }
    setActiveUsers(count) {
        this.registry.setGauge('active_users', count);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // QUEUE METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    setQueueSize(queue, size) {
        this.registry.setGauge('queue_size', size, { queue });
    }
    recordQueueJobProcessed(queue, status) {
        this.registry.incCounter('queue_jobs_processed_total', { queue, status });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════
    getPrometheusMetrics() {
        return this.registry.toPrometheus();
    }
    getMetricsJSON() {
        return this.registry.toJSON();
    }
    reset() {
        this.registry.reset();
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.metrics = new Metrics();
exports.default = exports.metrics;
