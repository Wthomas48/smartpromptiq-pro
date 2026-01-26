"use strict";
/**
 * SmartPromptIQ Observability Middleware
 *
 * Features:
 * - Correlation ID generation and propagation
 * - Request/Response timing
 * - HTTP request logging
 * - Error tracking
 * - Performance metrics collection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.observabilityMiddleware = exports.securityLoggingMiddleware = exports.slowRequestMiddleware = exports.errorTrackingMiddleware = exports.requestLoggingMiddleware = exports.correlationIdMiddleware = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../lib/logger");
const metrics_1 = require("../lib/metrics");
// ═══════════════════════════════════════════════════════════════════════════════
// CORRELATION ID MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Generates and attaches a correlation ID to each request
 * Supports propagation from upstream services via X-Correlation-ID header
 */
const correlationIdMiddleware = (req, res, next) => {
    const observableReq = req;
    // Get correlation ID from header or generate new one
    const correlationId = req.headers['x-correlation-id'] || (0, uuid_1.v4)();
    // Attach to request
    observableReq.correlationId = correlationId;
    observableReq.startTime = performance.now();
    // Set response header for downstream tracing
    res.setHeader('X-Correlation-ID', correlationId);
    // Create context for async local storage
    const context = {
        correlationId,
        requestId: (0, uuid_1.v4)(),
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent']
    };
    observableReq.context = context;
    // Run the rest of the request in the async local storage context
    logger_1.asyncLocalStorage.run(context, () => {
        next();
    });
};
exports.correlationIdMiddleware = correlationIdMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Logs HTTP requests with timing and context
 * Should be placed after correlationIdMiddleware
 */
const requestLoggingMiddleware = (req, res, next) => {
    const observableReq = req;
    const startTime = observableReq.startTime || performance.now();
    // Log request start (debug level)
    logger_1.logger.debug(`Request started: ${req.method} ${req.path}`, {
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        contentLength: req.headers['content-length']
    });
    // Capture original end method
    const originalEnd = res.end;
    const originalJson = res.json;
    // Track response body size
    let responseSize = 0;
    // Override json to capture response
    res.json = function (body) {
        if (body) {
            responseSize = JSON.stringify(body).length;
        }
        return originalJson.call(this, body);
    };
    // Override end to log on response completion
    res.end = function (chunk, ...args) {
        const duration = Math.round(performance.now() - startTime);
        // Log HTTP request
        logger_1.logger.httpRequest({
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration,
            userId: req.user?.id,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
        // Record metrics
        metrics_1.metrics.recordHttpRequest(req.method, req.route?.path || req.path, res.statusCode, duration);
        // Record response size
        if (responseSize > 0) {
            metrics_1.metrics.recordResponseSize(req.method, req.route?.path || req.path, responseSize);
        }
        return originalEnd.call(this, chunk, ...args);
    };
    next();
};
exports.requestLoggingMiddleware = requestLoggingMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TRACKING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Global error handler with logging and metrics
 * Should be placed last in middleware chain
 */
const errorTrackingMiddleware = (error, req, res, next) => {
    const observableReq = req;
    const duration = observableReq.startTime
        ? Math.round(performance.now() - observableReq.startTime)
        : 0;
    // Determine error severity and status code
    const statusCode = error.statusCode || error.status || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;
    const isServerError = statusCode >= 500;
    // Log error with full context
    logger_1.logger.error(`Request failed: ${req.method} ${req.path}`, error, {
        statusCode,
        duration,
        userId: req.user?.id,
        body: process.env.NODE_ENV === 'development' ? req.body : undefined
    });
    // Record error metrics
    metrics_1.metrics.recordError(error.name || 'UnknownError', req.route?.path || req.path, statusCode);
    // Record HTTP request as error
    metrics_1.metrics.recordHttpRequest(req.method, req.route?.path || req.path, statusCode, duration);
    // Send error response
    if (!res.headersSent) {
        res.status(statusCode).json({
            success: false,
            message: isServerError && process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
            correlationId: observableReq.correlationId,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                name: error.name
            })
        });
    }
};
exports.errorTrackingMiddleware = errorTrackingMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// SLOW REQUEST DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '3000', 10);
/**
 * Detects and logs slow requests
 */
const slowRequestMiddleware = (req, res, next) => {
    const startTime = performance.now();
    res.on('finish', () => {
        const duration = Math.round(performance.now() - startTime);
        if (duration > SLOW_REQUEST_THRESHOLD_MS) {
            logger_1.logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
                duration,
                threshold: SLOW_REQUEST_THRESHOLD_MS,
                statusCode: res.statusCode,
                userId: req.user?.id
            });
            metrics_1.metrics.recordSlowRequest(req.method, req.route?.path || req.path, duration);
        }
    });
    next();
};
exports.slowRequestMiddleware = slowRequestMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY EVENT LOGGING
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Logs security-relevant events
 */
const securityLoggingMiddleware = (req, res, next) => {
    // Track failed auth attempts
    res.on('finish', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
            const severity = res.statusCode === 403 ? 'medium' : 'low';
            logger_1.logger.securityEvent(res.statusCode === 401 ? 'authentication_failed' : 'authorization_failed', severity, {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
            metrics_1.metrics.recordSecurityEvent(res.statusCode === 401 ? 'auth_failure' : 'authz_failure', req.path);
        }
    });
    next();
};
exports.securityLoggingMiddleware = securityLoggingMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED OBSERVABILITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Combined middleware that includes all observability features
 * Use this for convenience or individual middlewares for fine-grained control
 */
exports.observabilityMiddleware = [
    exports.correlationIdMiddleware,
    exports.slowRequestMiddleware,
    exports.securityLoggingMiddleware,
    exports.requestLoggingMiddleware
];
exports.default = exports.observabilityMiddleware;
