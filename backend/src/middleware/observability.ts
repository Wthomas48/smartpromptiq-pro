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

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, asyncLocalStorage, LogContext } from '../lib/logger';
import { metrics } from '../lib/metrics';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ObservableRequest extends Request {
  correlationId: string;
  startTime: number;
  context: LogContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORRELATION ID MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generates and attaches a correlation ID to each request
 * Supports propagation from upstream services via X-Correlation-ID header
 */
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const observableReq = req as ObservableRequest;

  // Get correlation ID from header or generate new one
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();

  // Attach to request
  observableReq.correlationId = correlationId;
  observableReq.startTime = performance.now();

  // Set response header for downstream tracing
  res.setHeader('X-Correlation-ID', correlationId);

  // Create context for async local storage
  const context: LogContext = {
    correlationId,
    requestId: uuidv4(),
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent']
  };

  observableReq.context = context;

  // Run the rest of the request in the async local storage context
  asyncLocalStorage.run(context, () => {
    next();
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Logs HTTP requests with timing and context
 * Should be placed after correlationIdMiddleware
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const observableReq = req as ObservableRequest;
  const startTime = observableReq.startTime || performance.now();

  // Log request start (debug level)
  logger.debug(`Request started: ${req.method} ${req.path}`, {
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    contentLength: req.headers['content-length']
  });

  // Capture original end method
  const originalEnd = res.end;
  const originalJson = res.json;

  // Track response body size
  let responseSize = 0;

  // Override json to capture response
  res.json = function (body: any) {
    if (body) {
      responseSize = JSON.stringify(body).length;
    }
    return originalJson.call(this, body);
  };

  // Override end to log on response completion
  res.end = function (chunk?: any, ...args: any[]) {
    const duration = Math.round(performance.now() - startTime);

    // Log HTTP request
    logger.httpRequest({
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Record metrics
    metrics.recordHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration
    );

    // Record response size
    if (responseSize > 0) {
      metrics.recordResponseSize(req.method, req.route?.path || req.path, responseSize);
    }

    return originalEnd.call(this, chunk, ...args);
  };

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TRACKING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Global error handler with logging and metrics
 * Should be placed last in middleware chain
 */
export const errorTrackingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const observableReq = req as ObservableRequest;
  const duration = observableReq.startTime
    ? Math.round(performance.now() - observableReq.startTime)
    : 0;

  // Determine error severity and status code
  const statusCode = (error as any).statusCode || (error as any).status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  const isServerError = statusCode >= 500;

  // Log error with full context
  logger.error(`Request failed: ${req.method} ${req.path}`, error, {
    statusCode,
    duration,
    userId: (req as any).user?.id,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined
  });

  // Record error metrics
  metrics.recordError(
    error.name || 'UnknownError',
    req.route?.path || req.path,
    statusCode
  );

  // Record HTTP request as error
  metrics.recordHttpRequest(
    req.method,
    req.route?.path || req.path,
    statusCode,
    duration
  );

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

// ═══════════════════════════════════════════════════════════════════════════════
// SLOW REQUEST DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '3000', 10);

/**
 * Detects and logs slow requests
 */
export const slowRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();

  res.on('finish', () => {
    const duration = Math.round(performance.now() - startTime);

    if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
        duration,
        threshold: SLOW_REQUEST_THRESHOLD_MS,
        statusCode: res.statusCode,
        userId: (req as any).user?.id
      });

      metrics.recordSlowRequest(req.method, req.route?.path || req.path, duration);
    }
  });

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY EVENT LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Logs security-relevant events
 */
export const securityLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Track failed auth attempts
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      const severity = res.statusCode === 403 ? 'medium' : 'low';

      logger.securityEvent(
        res.statusCode === 401 ? 'authentication_failed' : 'authorization_failed',
        severity,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      metrics.recordSecurityEvent(
        res.statusCode === 401 ? 'auth_failure' : 'authz_failure',
        req.path
      );
    }
  });

  next();
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED OBSERVABILITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Combined middleware that includes all observability features
 * Use this for convenience or individual middlewares for fine-grained control
 */
export const observabilityMiddleware = [
  correlationIdMiddleware,
  slowRequestMiddleware,
  securityLoggingMiddleware,
  requestLoggingMiddleware
];

export default observabilityMiddleware;
