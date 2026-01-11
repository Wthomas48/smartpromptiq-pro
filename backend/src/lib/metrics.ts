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

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface MetricLabels {
  [key: string]: string | number;
}

interface CounterMetric {
  name: string;
  help: string;
  type: 'counter';
  values: Map<string, number>;
}

interface GaugeMetric {
  name: string;
  help: string;
  type: 'gauge';
  values: Map<string, number>;
}

interface HistogramMetric {
  name: string;
  help: string;
  type: 'histogram';
  buckets: number[];
  values: Map<string, { buckets: number[]; sum: number; count: number }>;
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

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
  private metrics: Map<string, Metric> = new Map();
  private startTime: number = Date.now();

  // ═══════════════════════════════════════════════════════════════════════════
  // METRIC REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  registerCounter(name: string, help: string): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        help,
        type: 'counter',
        values: new Map()
      });
    }
  }

  registerGauge(name: string, help: string): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        help,
        type: 'gauge',
        values: new Map()
      });
    }
  }

  registerHistogram(name: string, help: string, buckets: number[]): void {
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

  private labelsToKey(labels: MetricLabels): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  incCounter(name: string, labels: MetricLabels = {}, value: number = 1): void {
    const metric = this.metrics.get(name) as CounterMetric;
    if (!metric || metric.type !== 'counter') return;

    const key = this.labelsToKey(labels);
    const current = metric.values.get(key) || 0;
    metric.values.set(key, current + value);
  }

  setGauge(name: string, value: number, labels: MetricLabels = {}): void {
    const metric = this.metrics.get(name) as GaugeMetric;
    if (!metric || metric.type !== 'gauge') return;

    const key = this.labelsToKey(labels);
    metric.values.set(key, value);
  }

  incGauge(name: string, labels: MetricLabels = {}, value: number = 1): void {
    const metric = this.metrics.get(name) as GaugeMetric;
    if (!metric || metric.type !== 'gauge') return;

    const key = this.labelsToKey(labels);
    const current = metric.values.get(key) || 0;
    metric.values.set(key, current + value);
  }

  decGauge(name: string, labels: MetricLabels = {}, value: number = 1): void {
    this.incGauge(name, labels, -value);
  }

  observeHistogram(name: string, value: number, labels: MetricLabels = {}): void {
    const metric = this.metrics.get(name) as HistogramMetric;
    if (!metric || metric.type !== 'histogram') return;

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

  toPrometheus(): string {
    const lines: string[] = [];

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
      } else if (metric.type === 'histogram') {
        const histMetric = metric as HistogramMetric;
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

  toJSON(): Record<string, any> {
    const result: Record<string, any> = {
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

  reset(): void {
    for (const metric of this.metrics.values()) {
      metric.values.clear();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS FACADE (HIGH-LEVEL API)
// ═══════════════════════════════════════════════════════════════════════════════

class Metrics {
  private registry: MetricsRegistry;

  constructor() {
    this.registry = new MetricsRegistry();
    this.registerDefaultMetrics();
  }

  private registerDefaultMetrics(): void {
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

  incCounter(name: string, labels: Record<string, string | number> = {}, value: number = 1): void {
    this.registry.incCounter(name, labels, value);
  }

  registerCounter(name: string, help: string): void {
    this.registry.registerCounter(name, help);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HTTP METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordHttpRequest(method: string, path: string, statusCode: number, durationMs: number): void {
    const statusClass = `${Math.floor(statusCode / 100)}xx`;

    this.registry.incCounter('http_requests_total', { method, path, status: statusCode, status_class: statusClass });
    this.registry.observeHistogram('http_request_duration_ms', durationMs, { method, path });
  }

  recordResponseSize(method: string, path: string, bytes: number): void {
    this.registry.incCounter('http_response_size_bytes_total', { method, path }, bytes);
  }

  recordSlowRequest(method: string, path: string, durationMs: number): void {
    this.registry.incCounter('slow_requests_total', { method, path, duration_bucket: this.getDurationBucket(durationMs) });
  }

  private getDurationBucket(durationMs: number): string {
    if (durationMs < 3000) return '3s';
    if (durationMs < 5000) return '5s';
    if (durationMs < 10000) return '10s';
    return '10s+';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordError(errorType: string, path: string, statusCode: number): void {
    this.registry.incCounter('errors_total', { type: errorType, path, status: statusCode });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordSecurityEvent(eventType: string, path: string): void {
    this.registry.incCounter('security_events_total', { type: eventType, path });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordDbQuery(operation: string, table: string, durationMs: number, success: boolean): void {
    this.registry.incCounter('db_queries_total', { operation, table, success: success ? 'true' : 'false' });
    this.registry.observeHistogram('db_query_duration_ms', durationMs, { operation, table });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL API METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordExternalApiCall(api: string, operation: string, durationMs: number, success: boolean): void {
    this.registry.incCounter('external_api_calls_total', { api, operation, success: success ? 'true' : 'false' });
    this.registry.observeHistogram('external_api_duration_ms', durationMs, { api, operation });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  recordTokenUsage(tokens: number, action: string, provider: string): void {
    this.registry.incCounter('tokens_used_total', { action, provider }, tokens);
  }

  recordTokenPurchase(tokens: number, plan: string): void {
    this.registry.incCounter('tokens_purchased_total', { plan }, tokens);
  }

  recordSubscriptionEvent(event: string, plan: string): void {
    this.registry.incCounter('subscriptions_total', { event, plan });
  }

  recordRevenue(cents: number, type: string): void {
    this.registry.incCounter('revenue_cents_total', { type }, cents);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  setActiveConnections(count: number): void {
    this.registry.setGauge('active_connections', count);
  }

  setActiveUsers(count: number): void {
    this.registry.setGauge('active_users', count);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  setQueueSize(queue: string, size: number): void {
    this.registry.setGauge('queue_size', size, { queue });
  }

  recordQueueJobProcessed(queue: string, status: 'success' | 'failure'): void {
    this.registry.incCounter('queue_jobs_processed_total', { queue, status });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  getPrometheusMetrics(): string {
    return this.registry.toPrometheus();
  }

  getMetricsJSON(): Record<string, any> {
    return this.registry.toJSON();
  }

  reset(): void {
    this.registry.reset();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const metrics = new Metrics();

export default metrics;
