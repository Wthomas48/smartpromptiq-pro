"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./config/database");
const index_1 = require("./socket/index");
// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const logger_1 = require("./lib/logger");
const alerting_1 = require("./lib/alerting");
const observability_1 = require("./middleware/observability");
const observability_2 = __importDefault(require("./routes/observability"));
const auth_1 = __importDefault(require("./routes/auth"));
const authProxy_1 = __importDefault(require("./routes/authProxy"));
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const billing_1 = __importDefault(require("./routes/billing"));
const teams_1 = __importDefault(require("./routes/teams"));
const generations_1 = __importDefault(require("./routes/generations"));
const prompts_1 = __importDefault(require("./routes/prompts"));
const generate_1 = __importDefault(require("./routes/generate"));
const cache_1 = __importDefault(require("./routes/cache"));
const templates_1 = __importDefault(require("./routes/templates"));
const suggestions_1 = __importDefault(require("./routes/suggestions"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const admin_1 = __importDefault(require("./routes/admin"));
const custom_categories_1 = __importDefault(require("./routes/custom-categories"));
const rating_1 = __importDefault(require("./routes/rating"));
const categories_1 = __importDefault(require("./routes/categories"));
const utils_1 = __importDefault(require("./routes/utils"));
const academy_1 = __importDefault(require("./routes/academy"));
const academy_billing_1 = __importDefault(require("./routes/academy-billing"));
const contact_1 = __importDefault(require("./routes/contact"));
const builderiq_1 = __importDefault(require("./routes/builderiq"));
const referral_1 = __importDefault(require("./routes/referral"));
const voice_1 = __importDefault(require("./routes/voice"));
const music_1 = __importDefault(require("./routes/music"));
const elevenlabs_1 = __importDefault(require("./routes/elevenlabs"));
const costs_1 = __importDefault(require("./routes/costs"));
const audio_1 = __importDefault(require("./routes/audio"));
const shotstack_1 = __importDefault(require("./routes/shotstack"));
const chat_1 = __importDefault(require("./routes/chat")); // Embeddable Widget Chat API
const agents_1 = __importDefault(require("./routes/agents")); // Agent Management API
const discord_1 = __importDefault(require("./routes/discord")); // Discord OAuth + Webhook Notifications
const images_1 = __importDefault(require("./routes/images")); // Image Generation - DALL-E 3 AI Images
const documents_1 = __importDefault(require("./routes/documents")); // Document Chat - RAG-powered document Q&A
const search_1 = __importDefault(require("./routes/search")); // Web Search - Tavily-powered search + AI synthesis
const code_1 = __importDefault(require("./routes/code")); // Code Interpreter - Piston-powered code execution
const memory_1 = __importDefault(require("./routes/memory")); // Persistent Memory - User preferences across sessions
// ═══════════════════════════════════════════════════════════════════════════════
// SECURE ENVIRONMENT LOADING
// Priority: .env.local (secrets) > .env (defaults) > Railway env vars
// ═══════════════════════════════════════════════════════════════════════════════
const envLocalPath = path_1.default.resolve(__dirname, '../.env.local');
const envPath = path_1.default.resolve(__dirname, '../.env');
// Load .env first (defaults/placeholders)
dotenv_1.default.config({ path: envPath });
// Override with .env.local if it exists (contains real secrets)
if (fs_1.default.existsSync(envLocalPath)) {
    console.log('🔐 Loading secrets from .env.local');
    dotenv_1.default.config({ path: envLocalPath, override: true });
}
else {
    console.log('⚠️ No .env.local found - using .env (ensure secrets are configured in production env vars)');
}
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY: Validate critical environment variables
// ═══════════════════════════════════════════════════════════════════════════════
const validateSecrets = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const warnings = [];
    const errors = [];
    // Check for placeholder values
    const placeholderPatterns = [
        'REPLACE_WITH_',
        'YOUR_',
        'your-',
        'PASTE_YOUR_',
        'placeholder',
        '[YOUR-'
    ];
    const checkSecret = (name, value, required = true) => {
        if (!value) {
            if (required)
                errors.push(`❌ ${name} is not set`);
            return;
        }
        const hasPlaceholder = placeholderPatterns.some(pattern => value.toUpperCase().includes(pattern.toUpperCase()));
        if (hasPlaceholder) {
            if (isProduction) {
                errors.push(`❌ ${name} contains placeholder value`);
            }
            else {
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
            console.error('\n❌ Cannot start server with missing/placeholder secrets in production');
            console.error('   Configure environment variables in Railway or your hosting provider');
            process.exit(1);
        }
        else {
            console.warn('\n⚠️ Running in development with incomplete configuration');
            console.warn('   Copy backend/.env.local.example to backend/.env.local and fill in your secrets');
        }
    }
    else {
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
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
console.log('📡 Server will start on PORT:', PORT);
console.log('🔄 Admin routes updated - force restart');
// Security middleware with CSP configuration for Stripe, fonts, and inline styles
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for Stripe.js inline scripts
                "'unsafe-eval'", // Some third-party scripts need this
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
app.use((0, compression_1.default)());
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
app.use((0, cors_1.default)({
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
                const matchesPattern = corsConfig.allowedPatterns.some(pattern => origin.includes(pattern));
                // Check against specific production domains
                const matchesDomain = corsConfig.productionDomains.some(domain => origin.includes(domain));
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
app.use(observability_1.correlationIdMiddleware);
app.use(observability_1.slowRequestMiddleware);
app.use(observability_1.securityLoggingMiddleware);
app.use(observability_1.requestLoggingMiddleware);
// Morgan logging - only in development for console output
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Body parsing middleware
// IMPORTANT: Stripe webhook needs raw body BEFORE json parsing
app.use('/api/billing/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
            version: '1.0.0',
            endpoints: {
                health: '/health',
                apiHealth: '/api/health',
                apiInfo: '/api'
            }
        });
    }
    catch (error) {
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
    }
    catch (error) {
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
app.use('/api', observability_2.default);
// Mount API routes
app.use('/api/auth', auth_1.default);
app.use('/api', authProxy_1.default); // Mount proxy routes at /api/proxy/*
app.use('/api/users', users_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/billing', billing_1.default);
app.use('/api/teams', teams_1.default);
app.use('/api/generations', generations_1.default);
app.use('/api/prompts', prompts_1.default);
app.use('/api/cache', cache_1.default);
app.use('/api/templates', templates_1.default);
app.use('/api/suggestions', suggestions_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/custom-categories', custom_categories_1.default);
app.use('/api/rating', rating_1.default);
app.use('/api/utils', utils_1.default);
app.use('/api/academy', academy_1.default);
app.use('/api/academy/billing', academy_billing_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/builderiq', builderiq_1.default);
app.use('/api/referral', referral_1.default);
app.use('/api/voice', voice_1.default); // Voice Builder - AI Voice Generation
app.use('/api/music', music_1.default); // Music Maker - AI Music Generation
app.use('/api/elevenlabs', elevenlabs_1.default); // ElevenLabs Premium Voice - Ultra-realistic AI voices + Sound Effects
app.use('/api/costs', costs_1.default); // Cost Management - Usage tracking, limits, and admin dashboard
app.use('/api/audio', audio_1.default); // Unified Audio Pipeline - Speech/Music generation with Supabase storage
app.use('/api/shotstack', shotstack_1.default); // Shotstack Video API - Short video creation with voice + music
app.use('/api/chat', chat_1.default); // Embeddable Widget Chat API - Public API for widget communication
app.use('/api/agents', agents_1.default); // Agent Management API - Create and manage chat agents
app.use('/api/discord', discord_1.default); // Discord OAuth + Webhook Notifications
app.use('/api/images', images_1.default); // Image Generation - DALL-E 3 AI Images
app.use('/api/documents', documents_1.default); // Document Chat - RAG-powered document Q&A
app.use('/api/search', search_1.default); // Web Search - Tavily-powered search + AI synthesis
app.use('/api/code', code_1.default); // Code Interpreter - Piston-powered code execution
app.use('/api/memory', memory_1.default); // Persistent Memory - User preferences across sessions
app.use('/api', generate_1.default);
app.use('/api/personal', categories_1.default);
app.use('/api/product', categories_1.default);
app.use('/api/marketing', categories_1.default);
app.use('/api/education', categories_1.default);
app.use('/api/finance', categories_1.default);
app.use('/api/business', categories_1.default);
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
    const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
    const clientPublicPath = path_1.default.join(__dirname, '../../client/public');
    // Try dist first (production), then public (development)
    const widgetDistPath = path_1.default.join(clientDistPath, 'widget.js');
    const widgetPublicPath = path_1.default.join(clientPublicPath, 'widget.js');
    const fs = require('fs');
    if (fs.existsSync(widgetDistPath)) {
        res.sendFile(widgetDistPath);
    }
    else if (fs.existsSync(widgetPublicPath)) {
        res.sendFile(widgetPublicPath);
    }
    else {
        res.status(404).send('// Widget not found');
    }
});
console.log('📦 Widget.js endpoint configured at /widget.js');
// Serve static files from client build
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
console.log('🔍 Looking for client build at:', clientDistPath);
console.log('🔍 Client dist exists:', require('fs').existsSync(clientDistPath));
if (require('fs').existsSync(clientDistPath)) {
    console.log('📁 Client dist contents:', require('fs').readdirSync(clientDistPath));
}
app.use(express_1.default.static(clientDistPath));
// API route not found handler - should come AFTER all API routes
app.all('/api/*', (req, res) => {
    console.error(`❌ API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `API route ${req.originalUrl} not found`,
        method: req.method,
        availableRoutes: ['/health', '/api/health', '/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/teams', '/api/billing/info', '/api/suggestions/personalized', '/api/generate-prompt', '/api/prompts']
    });
});
// SPA fallback - serve index.html for non-API routes (GET only)
app.get('*', (req, res) => {
    console.log(`📄 Serving SPA for: ${req.originalUrl}`);
    res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
});
// Catch all for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ['/health', '/api']
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING WITH OBSERVABILITY
// ═══════════════════════════════════════════════════════════════════════════════
app.use(observability_1.errorTrackingMiddleware);
// Audio cleanup scheduler (optional - enable via env var)
const cleanupAudio_1 = require("./workers/cleanupAudio");
// Create HTTP server and attach Socket.io
const server = (0, http_1.createServer)(app);
(0, index_1.initializeSocket)(server);
// Start server
server.listen(PORT, '0.0.0.0', async () => {
    // Use structured logging for server startup
    logger_1.logger.info('Server starting', {
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
    await (0, database_1.connectDatabase)();
    // ═══════════════════════════════════════════════════════════════════════════
    // START OBSERVABILITY SYSTEMS
    // ═══════════════════════════════════════════════════════════════════════════
    // Start alerting engine with 60-second check interval
    alerting_1.alerting.startChecking(60);
    logger_1.logger.info('Alerting engine started', { checkIntervalSeconds: 60 });
    // Log business event for server startup
    logger_1.logger.businessEvent('server_started', {
        port: PORT,
        environment: process.env.NODE_ENV,
        uptimeSeconds: 0
    });
    // Start audio cleanup scheduler in production (every 24 hours)
    if (process.env.ENABLE_CLEANUP_SCHEDULER === 'true') {
        (0, cleanupAudio_1.startCleanupScheduler)(24);
        logger_1.logger.info('Cleanup scheduler started', { intervalHours: 24 });
    }
});
exports.default = app;
