/**
 * SmartPromptIQ Structured Logging System
 *
 * Features:
 * - JSON structured logging for log aggregation
 * - Log levels (error, warn, info, debug, trace)
 * - Correlation ID support for request tracing
 * - PII masking for security
 * - Performance timing helpers
 * - Context enrichment
 */

import { AsyncLocalStorage } from 'async_hooks';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  service: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  duration?: number;
  metadata?: Record<string, any>;
}

interface TimerContext {
  startTime: number;
  operation: string;
  context?: LogContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const ENV_LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
const CURRENT_LOG_LEVEL = LOG_LEVELS[ENV_LOG_LEVEL] ?? LOG_LEVELS.info;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SERVICE_NAME = process.env.SERVICE_NAME || 'smartpromptiq-backend';

// PII patterns to mask
const PII_PATTERNS = [
  { pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: '[JWT_TOKEN]' },
  { pattern: /sk_live_[A-Za-z0-9]+/g, replacement: '[STRIPE_LIVE_KEY]' },
  { pattern: /sk_test_[A-Za-z0-9]+/g, replacement: '[STRIPE_TEST_KEY]' },
  { pattern: /whsec_[A-Za-z0-9]+/g, replacement: '[WEBHOOK_SECRET]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CARD_NUMBER]' },
  { pattern: /password["']?\s*[:=]\s*["']?[^"'\s,}]+/gi, replacement: 'password: [REDACTED]' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ASYNC LOCAL STORAGE FOR CORRELATION ID
// ═══════════════════════════════════════════════════════════════════════════════

export const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export const getCorrelationId = (): string | undefined => {
  return asyncLocalStorage.getStore()?.correlationId;
};

export const getCurrentContext = (): LogContext | undefined => {
  return asyncLocalStorage.getStore();
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const maskPII = (text: string): string => {
  if (!IS_PRODUCTION) return text; // Only mask in production

  let masked = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    masked = masked.replace(pattern, replacement);
  }
  return masked;
};

const formatError = (error: Error | unknown): LogEntry['error'] => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: maskPII(error.message),
      stack: IS_PRODUCTION ? undefined : error.stack,
      code: (error as any).code
    };
  }
  return {
    name: 'UnknownError',
    message: String(error)
  };
};

const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error | unknown,
  duration?: number
): LogEntry => {
  const store = asyncLocalStorage.getStore();

  return {
    timestamp: new Date().toISOString(),
    level,
    message: maskPII(message),
    correlationId: context?.correlationId || store?.correlationId,
    service: SERVICE_NAME,
    context: context ? { ...context, correlationId: undefined } : undefined,
    error: error ? formatError(error) : undefined,
    duration,
    metadata: {
      pid: process.pid,
      env: process.env.NODE_ENV
    }
  };
};

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] <= CURRENT_LOG_LEVEL;
};

const output = (entry: LogEntry): void => {
  const json = JSON.stringify(entry);

  if (entry.level === 'error') {
    console.error(json);
  } else if (entry.level === 'warn') {
    console.warn(json);
  } else {
    console.log(json);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOGGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class Logger {
  private defaultContext: LogContext;

  constructor(context: LogContext = {}) {
    this.defaultContext = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...context });
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!shouldLog('error')) return;
    const entry = createLogEntry('error', message, { ...this.defaultContext, ...context }, error);
    output(entry);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, { ...this.defaultContext, ...context });
    output(entry);
  }

  /**
   * Log at info level
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, { ...this.defaultContext, ...context });
    output(entry);
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, { ...this.defaultContext, ...context });
    output(entry);
  }

  /**
   * Log at trace level
   */
  trace(message: string, context?: LogContext): void {
    if (!shouldLog('trace')) return;
    const entry = createLogEntry('trace', message, { ...this.defaultContext, ...context });
    output(entry);
  }

  /**
   * Start a timer for performance measurement
   */
  startTimer(operation: string, context?: LogContext): TimerContext {
    return {
      startTime: performance.now(),
      operation,
      context
    };
  }

  /**
   * End a timer and log the duration
   */
  endTimer(timer: TimerContext, message?: string, level: LogLevel = 'info'): number {
    const duration = Math.round(performance.now() - timer.startTime);
    const logMessage = message || `${timer.operation} completed`;

    if (shouldLog(level)) {
      const entry = createLogEntry(
        level,
        logMessage,
        { ...this.defaultContext, ...timer.context, operation: timer.operation },
        undefined,
        duration
      );
      output(entry);
    }

    return duration;
  }

  /**
   * Log HTTP request
   */
  httpRequest(req: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    userId?: string;
    userAgent?: string;
    ip?: string;
  }): void {
    const level: LogLevel = req.statusCode >= 500 ? 'error' : req.statusCode >= 400 ? 'warn' : 'info';

    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, `${req.method} ${req.url} ${req.statusCode}`, {
      ...this.defaultContext,
      type: 'http',
      method: req.method,
      url: req.url,
      statusCode: req.statusCode,
      userId: req.userId,
      userAgent: req.userAgent,
      ip: IS_PRODUCTION ? undefined : req.ip // Don't log IPs in production
    }, undefined, req.duration);

    output(entry);
  }

  /**
   * Log external API call
   */
  externalApi(api: string, operation: string, success: boolean, duration: number, context?: LogContext): void {
    const level: LogLevel = success ? 'info' : 'error';

    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, `External API: ${api} ${operation}`, {
      ...this.defaultContext,
      ...context,
      type: 'external_api',
      api,
      operation,
      success
    }, undefined, duration);

    output(entry);
  }

  /**
   * Log database query
   */
  dbQuery(operation: string, table: string, duration: number, success: boolean, context?: LogContext): void {
    const level: LogLevel = !success ? 'error' : duration > 1000 ? 'warn' : 'debug';

    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, `DB: ${operation} on ${table}`, {
      ...this.defaultContext,
      ...context,
      type: 'database',
      operation,
      table,
      success,
      slow: duration > 1000
    }, undefined, duration);

    output(entry);
  }

  /**
   * Log business event
   */
  businessEvent(event: string, context?: LogContext): void {
    if (!shouldLog('info')) return;

    const entry = createLogEntry('info', `Business Event: ${event}`, {
      ...this.defaultContext,
      ...context,
      type: 'business_event',
      event
    });

    output(entry);
  }

  /**
   * Log security event
   */
  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level: LogLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';

    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, `Security: ${event}`, {
      ...this.defaultContext,
      ...context,
      type: 'security',
      event,
      severity
    });

    output(entry);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const logger = new Logger();

export default logger;
