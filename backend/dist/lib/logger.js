"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.getCurrentContext = exports.getCorrelationId = exports.asyncLocalStorage = void 0;
const async_hooks_1 = require("async_hooks");
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
};
const ENV_LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
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
exports.asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
const getCorrelationId = () => {
    return exports.asyncLocalStorage.getStore()?.correlationId;
};
exports.getCorrelationId = getCorrelationId;
const getCurrentContext = () => {
    return exports.asyncLocalStorage.getStore();
};
exports.getCurrentContext = getCurrentContext;
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const maskPII = (text) => {
    if (!IS_PRODUCTION)
        return text; // Only mask in production
    let masked = text;
    for (const { pattern, replacement } of PII_PATTERNS) {
        masked = masked.replace(pattern, replacement);
    }
    return masked;
};
const formatError = (error) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: maskPII(error.message),
            stack: IS_PRODUCTION ? undefined : error.stack,
            code: error.code
        };
    }
    return {
        name: 'UnknownError',
        message: String(error)
    };
};
const createLogEntry = (level, message, context, error, duration) => {
    const store = exports.asyncLocalStorage.getStore();
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
const shouldLog = (level) => {
    return LOG_LEVELS[level] <= CURRENT_LOG_LEVEL;
};
const output = (entry) => {
    const json = JSON.stringify(entry);
    if (entry.level === 'error') {
        console.error(json);
    }
    else if (entry.level === 'warn') {
        console.warn(json);
    }
    else {
        console.log(json);
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOGGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Logger {
    constructor(context = {}) {
        this.defaultContext = context;
    }
    /**
     * Create a child logger with additional context
     */
    child(context) {
        return new Logger({ ...this.defaultContext, ...context });
    }
    /**
     * Log at error level
     */
    error(message, error, context) {
        if (!shouldLog('error'))
            return;
        const entry = createLogEntry('error', message, { ...this.defaultContext, ...context }, error);
        output(entry);
    }
    /**
     * Log at warn level
     */
    warn(message, context) {
        if (!shouldLog('warn'))
            return;
        const entry = createLogEntry('warn', message, { ...this.defaultContext, ...context });
        output(entry);
    }
    /**
     * Log at info level
     */
    info(message, context) {
        if (!shouldLog('info'))
            return;
        const entry = createLogEntry('info', message, { ...this.defaultContext, ...context });
        output(entry);
    }
    /**
     * Log at debug level
     */
    debug(message, context) {
        if (!shouldLog('debug'))
            return;
        const entry = createLogEntry('debug', message, { ...this.defaultContext, ...context });
        output(entry);
    }
    /**
     * Log at trace level
     */
    trace(message, context) {
        if (!shouldLog('trace'))
            return;
        const entry = createLogEntry('trace', message, { ...this.defaultContext, ...context });
        output(entry);
    }
    /**
     * Start a timer for performance measurement
     */
    startTimer(operation, context) {
        return {
            startTime: performance.now(),
            operation,
            context
        };
    }
    /**
     * End a timer and log the duration
     */
    endTimer(timer, message, level = 'info') {
        const duration = Math.round(performance.now() - timer.startTime);
        const logMessage = message || `${timer.operation} completed`;
        if (shouldLog(level)) {
            const entry = createLogEntry(level, logMessage, { ...this.defaultContext, ...timer.context, operation: timer.operation }, undefined, duration);
            output(entry);
        }
        return duration;
    }
    /**
     * Log HTTP request
     */
    httpRequest(req) {
        const level = req.statusCode >= 500 ? 'error' : req.statusCode >= 400 ? 'warn' : 'info';
        if (!shouldLog(level))
            return;
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
    externalApi(api, operation, success, duration, context) {
        const level = success ? 'info' : 'error';
        if (!shouldLog(level))
            return;
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
    dbQuery(operation, table, duration, success, context) {
        const level = !success ? 'error' : duration > 1000 ? 'warn' : 'debug';
        if (!shouldLog(level))
            return;
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
    businessEvent(event, context) {
        if (!shouldLog('info'))
            return;
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
    securityEvent(event, severity, context) {
        const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
        if (!shouldLog(level))
            return;
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
exports.logger = new Logger();
exports.default = exports.logger;
