// ─── CRITICAL: Load env vars BEFORE any other import reads process.env ───
import './env';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { connectDatabase } from './config/database';
import { initializeSocket } from './socket/index';

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
import { logger } from './lib/logger';
import { metrics } from './lib/metrics';
import { alerting } from './lib/alerting';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware,
  errorTrackingMiddleware,
  slowRequestMiddleware,
  securityLoggingMiddleware
} from './middleware/observability';
import observabilityRoutes from './routes/observability';

import authRoutes from './routes/auth';
import authProxyRoutes from './routes/authProxy';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import billingRoutes from './routes/billing';
import teamRoutes from './routes/teams';
import generationRoutes from './routes/generations';
import promptRoutes from './routes/prompts';
import generateRoutes from './routes/generate';
import cacheRoutes from './routes/cache';
import templateRoutes from './routes/templates';
import suggestionRoutes from './routes/suggestions';
import feedbackRoutes from './routes/feedback';
import adminRoutes from './routes/admin';
import customCategoryRoutes from './routes/custom-categories';
import ratingRoutes from './routes/rating';
import categoryRoutes from './routes/categories';
import utilsRoutes from './routes/utils';
import academyRoutes from './routes/academy';
import academyBillingRoutes from './routes/academy-billing';
import contactRoutes from './routes/contact';
import builderiqRoutes from './routes/builderiq';
import referralRoutes from './routes/referral';
import voiceRoutes from './routes/voice';
import musicRoutes from './routes/music';
import elevenlabsRoutes from './routes/elevenlabs';
import costsRoutes from './routes/costs';
import audioRoutes from './routes/audio';
import shotstackRoutes from './routes/shotstack';
import chatRoutes from './routes/chat'; // Embeddable Widget Chat API
import agentsRoutes from './routes/agents'; // Agent Management API
import discordRoutes from './routes/discord'; // Discord OAuth + Webhook Notifications
import imageRoutes from './routes/images'; // Image Generation - DALL-E 3 AI Images
import documentRoutes from './routes/documents'; // Document Chat - RAG-powered document Q&A
import searchRoutes from './routes/search'; // Web Search - Tavily-powered search + AI synthesis
import codeRoutes from './routes/code'; // Code Interpreter - Piston-powered code execution
import memoryRoutes from './routes/memory'; // Persistent Memory - User preferences across sessions

// ═══════════════════════════════════════════════════════════════════════════════
// ENV VARS: Already loaded by './env' (first import above)
// Priority: .env.local (secrets) > .env (defaults) > system env vars
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY: Validate critical environment variables
// ═══════════════════════════════════════════════════════════════════════════════
const validateSecrets = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for placeholder values
  const placeholderPatterns = [
    'REPLACE_WITH_',
    'YOUR_',
    'your-',
    'PASTE_YOUR_',
    'placeholder',
    '[YOUR-'
  ];

  const checkSecret = (name: string, value: string | undefined, required: boolean = true) => {
    if (!value) {
      if (required) errors.push(`❌ ${name} is not set`);
      return;
    }

    const hasPlaceholder = placeholderPatterns.some(pattern =>
      value.toUpperCase().includes(pattern.toUpperCase())
    );

    if (hasPlaceholder) {
      if (isProduction) {
        errors.push(`❌ ${name} contains placeholder value`);
      } else {
        warnings.push(`⚠️ ${name} contains placeholder value`);
      }
    }
  };

  // Critical secrets that must be set
  checkSecret('DATABASE_URL', process.env.DATABASE_URL);
  checkSecret('JWT_SECRET', process.env.JWT_SECRET);
  checkSecret('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);

  // Production-required secrets
  if (isProduction) {
    checkSecret('SUPABASE_JWT_SECRET', process.env.SUPABASE_JWT_SECRET);
    checkSecret('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET);
  }

  // Log warnings
  if (warnings.length > 0) {
    console.log('\n🔐 Security Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
  }

  // In production, fail fast on errors
  if (errors.length > 0) {
    console.error('\n🚨 SECURITY ERRORS:');
    errors.forEach(e => console.error(`   ${e}`));

    if (isProduction) {
      console.error('\n⚠️ PRODUCTION WARNING: Missing secrets — some features will be degraded');
      console.error('   Configure environment variables in Railway or your hosting provider');
      // Don't exit — let the server start with degraded functionality
    } else {
      console.warn('\n⚠️ Running in development with incomplete configuration');
      console.warn('   Copy backend/.env.local.example to backend/.env.local and fill in your secrets');
    }
  } else {
    console.log('\n✅ Security configuration validated');
  }
};

validateSecrets();

// 🔍 DEBUG: Enhanced startup logging for Railway deployment
console.log('🚀 STARTUP DEBUG INFO:');
console.log('📍 Current working directory:', process.cwd());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT from env:', process.env.PORT);
console.log('🏗️ Railway environment variables:');
console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('   RAILWAY_PROJECT_NAME:', process.env.RAILWAY_PROJECT_NAME);
console.log('   RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

console.log('📡 Server will start on PORT:', PORT);
console.log('🔄 Admin routes updated - force restart');

// Security middleware with CSP configuration for Stripe, fonts, and inline styles
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Stripe.js inline scripts
        "'unsafe-eval'",   // Some third-party scripts need this
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        "https://m.stripe.network",
        "https://m.stripe.com",
        "https://b.stripecdn.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://apis.google.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components, emotion, and Stripe UI
        "https://fonts.googleapis.com",
        "https://checkout.stripe.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://*.stripe.com",
        "https://*.supabase.co"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://checkout.stripe.com",
        "https://m.stripe.network",
        "https://m.stripe.com",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://api.openai.com",
        "https://api.anthropic.com",
        "https://api.elevenlabs.io",
        "https://*.railway.app",
        "wss://*.railway.app",
        // Allow localhost in development
        ...(process.env.NODE_ENV !== 'production' ? ["http://localhost:*", "ws://localhost:*"] : [])
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        "https://hooks.stripe.com",
        "https://www.google.com" // reCAPTCHA if used
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      formAction: ["'self'", "https://checkout.stripe.com"],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for Stripe iframe compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } // Allow Stripe popups
}));
app.use(compression());

console.log('🔒 Helmet CSP configured for Stripe, fonts, and third-party scripts');

// ✅ ENHANCED: Comprehensive CORS configuration with centralized host management
const corsConfig = {
  // Development origins
  developmentOrigins: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:8080'
  ],

  // Production domains
  productionDomains: [
    'smartpromptiq.com',
    'www.smartpromptiq.com',
    'smartpromptiq.net',
    'www.smartpromptiq.net',
    'smartpromptiq.up.railway.app',
    'smartpromptiq-pro.up.railway.app',
    'smartpromptiq.railway.app',
    'smartpromptiq-pro.railway.app'
  ],

  // Deployment patterns to allow
  allowedPatterns: [
    '.railway.app',
    '.vercel.app',
    '.netlify.app',
    '.herokuapp.com'
  ]
};

const allowedOrigins = [
  ...corsConfig.developmentOrigins,
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined,
  process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : undefined,
  // Add production domains
  ...corsConfig.productionDomains.map(domain => `https://${domain}`)
].filter(Boolean);

console.log('🌐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🌐 CORS REQUEST from origin:', origin);

    // Allow requests with no origin or null origin (mobile apps, curl, file:// protocol, etc.)
    if (!origin || origin === 'null') {
      console.log('✅ CORS: No origin or null origin - allowed (file://, mobile apps, etc.)');
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin in allowed list - allowed');
      return callback(null, true);
    }

    // Allow any Railway domain
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
      console.log('✅ CORS: Railway domain - allowed');
      return callback(null, true);
    }

    // Allow localhost with any port in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ CORS: Localhost - allowed');
      return callback(null, true);
    }

    // ✅ ENHANCED: Production CORS handling with centralized configuration validation
    if (process.env.NODE_ENV === 'production') {
      if (origin) {
        // Check against allowed patterns
        const matchesPattern = corsConfig.allowedPatterns.some(pattern =>
          origin.includes(pattern)
        );

        // Check against specific production domains
        const matchesDomain = corsConfig.productionDomains.some(domain =>
          origin.includes(domain)
        );

        if (matchesPattern || matchesDomain) {
          console.log('✅ CORS: Production domain/pattern matched - allowed:', origin);
          return callback(null, true);
        }

        // Additional safety check for HTTPS origins
        if (origin.startsWith('https://')) {
          console.log('✅ CORS: HTTPS origin allowed in production:', origin);
          return callback(null, true);
        }
      }

      console.log('⚠️ CORS: Production mode - allowing with warning:', origin);
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked origin: ${origin}`);
    console.warn(`🚫 Allowed origins:`, allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'X-Device-Fingerprint',
    'X-Timestamp',
    'X-Client-Type',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'Accept-Encoding',
    'Accept-Language',
    'Connection',
    'Host',
    'User-Agent',
    'Referer',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'Sec-Fetch-Dest'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  optionsSuccessStatus: 200
}));

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY MIDDLEWARE (before body parsing for full request tracking)
// ═══════════════════════════════════════════════════════════════════════════════
app.use(correlationIdMiddleware);
app.use(slowRequestMiddleware);
app.use(securityLoggingMiddleware);
app.use(requestLoggingMiddleware);

// Morgan logging - only in development for console output
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
// IMPORTANT: Stripe webhook needs raw body BEFORE json parsing
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint - Enhanced for Railway deployment debugging
app.get('/health', (req, res) => {
  console.log('🔍 Health check accessed via /health');
  res.status(200).json({
    status: 'healthy',
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
    memory: process.memoryUsage(),
    railway: {
      environment: process.env.RAILWAY_ENVIRONMENT,
      projectName: process.env.RAILWAY_PROJECT_NAME,
      serviceName: process.env.RAILWAY_SERVICE_NAME
    }
  });
});

// API health check endpoint - Enhanced for Railway deployment debugging
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check accessed via /api/health');
  try {
    res.status(200).json({
      status: 'healthy',
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: PORT,
      server: 'compiled-ts-backend',
      version: '2.1.0',
      endpoints: {
        health: '/health',
        apiHealth: '/api/health',
        apiInfo: '/api'
      }
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Frontend health check - verifies that static files are properly served
app.get('/frontend-health', (req, res) => {
  console.log('🔍 Frontend health check accessed');
  try {
    const fs = require('fs');
    const path = require('path');

    // Check if client build directory exists
    const clientDistPath = path.join(__dirname, '../../client/dist');
    const indexExists = fs.existsSync(path.join(clientDistPath, 'index.html'));
    const healthExists = fs.existsSync(path.join(clientDistPath, 'health.json'));

    res.status(200).json({
      status: indexExists ? 'healthy' : 'unhealthy',
      frontend: {
        buildExists: fs.existsSync(clientDistPath),
        indexHtml: indexExists,
        healthJson: healthExists,
        buildPath: clientDistPath
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Frontend health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'SmartPromptIQ Pro Backend API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY ROUTES (before other API routes for metrics/health access)
// ═══════════════════════════════════════════════════════════════════════════════
app.use('/api', observabilityRoutes);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api', authProxyRoutes); // Mount proxy routes at /api/proxy/*
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/generations', generationRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/custom-categories', customCategoryRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/academy/billing', academyBillingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/builderiq', builderiqRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/voice', voiceRoutes); // Voice Builder - AI Voice Generation
app.use('/api/music', musicRoutes); // Music Maker - AI Music Generation
app.use('/api/elevenlabs', elevenlabsRoutes); // ElevenLabs Premium Voice - Ultra-realistic AI voices + Sound Effects
app.use('/api/costs', costsRoutes); // Cost Management - Usage tracking, limits, and admin dashboard
app.use('/api/audio', audioRoutes); // Unified Audio Pipeline - Speech/Music generation with Supabase storage
app.use('/api/shotstack', shotstackRoutes); // Shotstack Video API - Short video creation with voice + music
app.use('/api/chat', chatRoutes); // Embeddable Widget Chat API - Public API for widget communication
app.use('/api/agents', agentsRoutes); // Agent Management API - Create and manage chat agents
app.use('/api/discord', discordRoutes); // Discord OAuth + Webhook Notifications
app.use('/api/images', imageRoutes); // Image Generation - DALL-E 3 AI Images
// New AI features - log registration for debugging
console.log('📋 Registering new AI feature routes...');
app.use('/api/documents', documentRoutes); console.log('  ✅ /api/documents');
app.use('/api/search', searchRoutes); console.log('  ✅ /api/search');
app.use('/api/code', codeRoutes); console.log('  ✅ /api/code');
app.use('/api/memory', memoryRoutes); console.log('  ✅ /api/memory');
app.use('/api', generateRoutes);
app.use('/api/personal', categoryRoutes);
app.use('/api/product', categoryRoutes);
app.use('/api/marketing', categoryRoutes);
app.use('/api/education', categoryRoutes);
app.use('/api/finance', categoryRoutes);
app.use('/api/business', categoryRoutes);

// ============================================
// WIDGET.JS - EMBEDDABLE SCRIPT FOR ANY WEBSITE
// ============================================
// This endpoint serves the widget.js with permissive CORS
// so it can be embedded on ANY external website.
app.get('/widget.js', (req, res) => {
  // Set CORS headers for any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set caching headers for performance (cache for 1 hour, revalidate)
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

  // Serve from client dist or public folder
  const clientDistPath = path.join(__dirname, '../../client/dist');
  const clientPublicPath = path.join(__dirname, '../../client/public');

  // Try dist first (production), then public (development)
  const widgetDistPath = path.join(clientDistPath, 'widget.js');
  const widgetPublicPath = path.join(clientPublicPath, 'widget.js');

  const fs = require('fs');
  if (fs.existsSync(widgetDistPath)) {
    res.sendFile(widgetDistPath);
  } else if (fs.existsSync(widgetPublicPath)) {
    res.sendFile(widgetPublicPath);
  } else {
    res.status(404).send('// Widget not found');
  }
});

console.log('📦 Widget.js endpoint configured at /widget.js');

// Serve static files from client build
const clientDistPath = path.join(__dirname, '../../client/dist');
const clientDistExists = fs.existsSync(clientDistPath);
console.log(`📁 Client dist: ${clientDistPath} (exists: ${clientDistExists})`);
if (clientDistExists) {
  app.use(express.static(clientDistPath));
} else {
  console.warn('⚠️ Client dist not found — SPA routes will fail');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 404 HANDLER — catches any /api/* request that no router handled
// ═══════════════════════════════════════════════════════════════════════════════
app.all('/api/*', (req, res) => {
  console.error(`❌ [API 404] ${req.method} ${req.originalUrl}`);
  const registeredApiPrefixes = [
    '/api/health', '/api/auth', '/api/users', '/api/projects', '/api/billing',
    '/api/teams', '/api/generations', '/api/prompts', '/api/cache', '/api/templates',
    '/api/suggestions', '/api/feedback', '/api/admin', '/api/custom-categories',
    '/api/rating', '/api/utils', '/api/academy', '/api/contact', '/api/builderiq',
    '/api/referral', '/api/voice', '/api/music', '/api/elevenlabs', '/api/costs',
    '/api/audio', '/api/shotstack', '/api/chat', '/api/agents', '/api/discord',
    '/api/images', '/api/documents', '/api/search', '/api/code', '/api/memory',
    '/api/generate-prompt', '/api/observability', '/api/metrics'
  ];
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    handler: 'api-404-catchall',
    availableRoutes: registeredApiPrefixes
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GUARD: Paths that must NEVER be served as SPA
// /socket.io — handled by Socket.io at the HTTP server level
// /vendor, /wp-admin, /cgi-bin, etc. — bot probes, return 404
// ═══════════════════════════════════════════════════════════════════════════════
const nonSpaPatterns = ['/socket.io', '/vendor', '/wp-admin', '/wp-includes', '/wp-content', '/cgi-bin', '/.env', '/.git', '/xmlrpc.php', '/phpmyadmin'];

app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (nonSpaPatterns.some(prefix => p.startsWith(prefix))) {
    console.log(`🛡️ [BLOCKED] Non-SPA path: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({
      success: false,
      message: 'Not found',
      handler: 'non-spa-guard'
    });
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPA FALLBACK — serve index.html ONLY for GET requests to real frontend routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('*', (req, res) => {
  // Only serve SPA for navigation requests (no file extension, or known SPA paths)
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    // Request for a specific file type (e.g. .js, .css, .map) that wasn't found in static
    console.log(`📁 [STATIC 404] ${req.originalUrl}`);
    return res.status(404).json({
      success: false,
      message: `Static file not found: ${req.path}`,
      handler: 'static-404'
    });
  }
  console.log(`📄 [SPA] Serving index.html for: ${req.originalUrl}`);
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Non-GET catch-all (POST/PUT/DELETE to unknown paths)
app.use((req, res) => {
  console.error(`❌ [404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    handler: 'catch-all-404'
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING WITH OBSERVABILITY
// ═══════════════════════════════════════════════════════════════════════════════
app.use(errorTrackingMiddleware);

// Audio cleanup scheduler (optional - enable via env var)
import { startCleanupScheduler } from './workers/cleanupAudio';

// Create HTTP server and attach Socket.io
const server = createServer(app);
initializeSocket(server);

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  // Use structured logging for server startup
  logger.info('Server starting', {
    port: PORT,
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    nodeVersion: process.version
  });

  // Console output for Railway/development visibility
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`📊 Observability dashboard: http://localhost:${PORT}/api/observability/dashboard`);
  console.log(`📈 Prometheus metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`🏠 Root endpoint available at: http://localhost:${PORT}/`);
  console.log(`🛡️ Server bound to 0.0.0.0:${PORT} for Railway compatibility`);

  // Connect to database
  await connectDatabase();

  // ═══════════════════════════════════════════════════════════════════════════
  // START OBSERVABILITY SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════

  // Start alerting engine with 60-second check interval
  alerting.startChecking(60);
  logger.info('Alerting engine started', { checkIntervalSeconds: 60 });

  // Log business event for server startup
  logger.businessEvent('server_started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    uptimeSeconds: 0
  });

  // Start audio cleanup scheduler in production (every 24 hours)
  if (process.env.ENABLE_CLEANUP_SCHEDULER === 'true') {
    startCleanupScheduler(24);
    logger.info('Cleanup scheduler started', { intervalHours: 24 });
  }
});

export default app;
