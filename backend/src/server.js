/**
 * Enhanced SmartPromptIQ Server with comprehensive pricing and subscription system
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Import route modules
const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const subscriptionRoutes = require('./routes/subscriptions');
const usageRoutes = require('./routes/usage');
const adminRoutes = require('./routes/admin');
const demoRoutes = require('./routes/demo');

// Import rate limiting middleware
const { 
  apiLimiter, 
  loginLimiter, 
  registrationLimiter, 
  passwordResetLimiter 
} = require('./utils/rateLimiter');

// Import authentication middleware
const { 
  authenticateWithSubscription, 
  requireTier, 
  requireTokens,
  requireAdmin,
  trackApiUsage,
  createPromptMiddleware
} = require('./middleware/subscriptionAuth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Stripe Elements
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-type']
}));

// Logging
app.use(morgan('combined'));

// Global rate limiting (per IP)
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Body parsing middleware (with special handling for webhooks)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartPromptIQ Backend is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'SmartPromptIQ Pro Backend API',
    version: '2.0.0',
    status: 'active',
    features: [
      'Token-based pricing',
      'Subscription management',
      'Real-time cost protection',
      'Advanced rate limiting',
      'Usage analytics'
    ],
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      billing: '/api/billing',
      subscriptions: '/api/subscriptions',
      usage: '/api/usage'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount API routes with appropriate rate limiting

// Authentication routes with specific rate limits
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registrationLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth', authRoutes);

// Billing and subscription routes
app.use('/api/billing', billingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Usage and analytics routes (authenticated)
app.use('/api/usage', authenticateWithSubscription, trackApiUsage, usageRoutes);

// Demo routes (public access for demo purposes)
app.use('/api/demo', demoRoutes);

// Admin routes (require admin authentication)
app.use('/api/admin', adminRoutes);

// Admin routes (require admin authentication)
app.get('/api/admin/cost-dashboard', 
  authenticateWithSubscription, 
  requireAdmin, 
  async (req, res) => {
    try {
      const costCalculator = require('./utils/costCalculator');
      const costProtection = require('./utils/costProtection');

      // Get system-wide cost analysis
      const [systemAnalytics, marginReport, auditResults] = await Promise.all([
        require('./utils/usageAnalytics').getSystemAnalytics('month'),
        costProtection.calculateSystemMargins(),
        costProtection.performSystemCostAudit()
      ]);

      // Generate cost report
      const users = await require('./config/database').user.findMany({
        where: { subscriptionTier: { not: 'free' } },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          monthlyTokensUsed: true,
          tokensUsed: true,
          tokensPurchased: true
        }
      });

      const costReport = costCalculator.generateCostReport(users, 'monthly');

      res.json({
        success: true,
        data: {
          systemMetrics: {
            totalUsers: systemAnalytics.summary.totalUsers,
            activeUsers: systemAnalytics.summary.activeUsers,
            totalRevenue: systemAnalytics.summary.totalRevenueInCents,
            totalCosts: systemAnalytics.summary.totalCostsInCents,
            profitMargin: systemAnalytics.summary.profitMargin,
            averageMargin: costReport.summary.averageMargin
          },
          tierAnalysis: marginReport.success ? marginReport.margins : {},
          riskUsers: costReport.riskUsers,
          auditResults: auditResults,
          recommendations: costReport.recommendations || []
        }
      });

    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate cost dashboard'
      });
    }
  }
);

app.post('/api/admin/cost-audit', 
  authenticateWithSubscription, 
  requireAdmin, 
  async (req, res) => {
    try {
      const costProtection = require('./utils/costProtection');
      const results = await costProtection.performSystemCostAudit();

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Cost audit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run cost audit'
      });
    }
  }
);

app.post('/api/admin/override-cost-protection', 
  authenticateWithSubscription, 
  requireAdmin, 
  async (req, res) => {
    try {
      const { userId, reason, temporaryLimit, expiresAt } = req.body;
      
      if (!userId || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, reason'
        });
      }

      const costProtection = require('./utils/costProtection');
      const result = await costProtection.overrideCostProtection(userId, {
        reason,
        adminUserId: req.user.id,
        temporaryLimit,
        expiresAt
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Cost protection override error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to override cost protection'
      });
    }
  }
);

// Example protected prompt generation endpoint
app.post('/api/prompts/generate', 
  ...createPromptMiddleware('standard', 'gpt3_5_turbo'),
  async (req, res) => {
    try {
      const { prompt, category, complexity = 'standard' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      // Consume tokens
      const tokenManager = require('./utils/tokenManager');
      const tokenResult = await tokenManager.consumeTokens(req.user.id, {
        complexity,
        category,
        model: 'gpt3_5_turbo',
        description: `Generated prompt for category: ${category}`
      });

      // Here you would integrate with your AI service
      // For demo purposes, we'll return a mock response
      const mockResponse = {
        generated_text: `This is a mock AI-generated response for: ${prompt}`,
        tokens_used: tokenResult.tokensConsumed,
        model: 'gpt3_5_turbo',
        complexity
      };

      // Track the generation
      const usageAnalytics = require('./utils/usageAnalytics');
      await usageAnalytics.trackPromptGeneration(req.user.id, {
        prompt,
        category,
        complexity,
        model: 'gpt3_5_turbo',
        tokensUsed: tokenResult.tokensConsumed,
        responseLength: mockResponse.generated_text.length,
        quality: 5
      });

      res.json({
        success: true,
        data: {
          response: mockResponse,
          usage: {
            tokensConsumed: tokenResult.tokensConsumed,
            newBalance: tokenResult.newBalance,
            costProtectionWarning: req.costProtection?.warning
          }
        }
      });

    } catch (error) {
      console.error('Prompt generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Prompt generation failed'
      });
    }
  }
);

// Example API endpoint requiring Pro tier
app.get('/api/analytics/advanced', 
  authenticateWithSubscription,
  requireTier('pro', 'business', 'enterprise'),
  trackApiUsage,
  async (req, res) => {
    try {
      const usageAnalytics = require('./utils/usageAnalytics');
      const analytics = await usageAnalytics.getUserUsageSummary(req.user.id, 'month');

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics'
      });
    }
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: isDevelopment ? error.message : undefined,
    code: error.code || 'INTERNAL_ERROR'
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      '/health',
      '/api',
      '/api/auth',
      '/api/billing',
      '/api/subscriptions',
      '/api/usage'
    ]
  });
});

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Initialize queue service
const { demoQueue } = require('./services/queueService');

// Start server
app.listen(PORT, () => {
  console.log('🚀 SmartPromptIQ Pro Backend Started!');
  console.log(`📦 Version: 2.0.0`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Info: http://localhost:${PORT}/api`);
  console.log('✨ Features: Token-based pricing, Cost protection, Advanced analytics, Demo Queue');
  console.log('📋 Demo Queue: Processing jobs with Bull and Redis');

  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - Detailed error messages enabled');
  }
});

module.exports = app;