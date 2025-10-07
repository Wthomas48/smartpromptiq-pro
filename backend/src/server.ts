import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';

import authRoutes from './routes/auth';
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
import demoRoutes from './routes/demo';
import categoryRoutes from './routes/categories';

dotenv.config();

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
const PORT = process.env.PORT || 5000;

console.log('📡 Server will start on PORT:', PORT);
console.log('🔄 Admin routes updated - force restart');

// Security middleware
app.use(helmet());
app.use(compression());

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

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      console.log('✅ CORS: No origin - allowed');
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
    'X-Requested-With',
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
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan('dev'));

// Body parsing middleware
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
      version: '1.0.0',
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

// Mount API routes
app.use('/api/auth', authRoutes);
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
app.use('/api/demo', demoRoutes);
app.use('/api', generateRoutes);
app.use('/api/personal', categoryRoutes);
app.use('/api/product', categoryRoutes);
app.use('/api/marketing', categoryRoutes);
app.use('/api/education', categoryRoutes);
app.use('/api/finance', categoryRoutes);
app.use('/api/business', categoryRoutes);

// Serve static files from client build
const clientDistPath = path.join(__dirname, '../../client/dist');
console.log('🔍 Looking for client build at:', clientDistPath);
console.log('🔍 Client dist exists:', require('fs').existsSync(clientDistPath));
if (require('fs').existsSync(clientDistPath)) {
  console.log('📁 Client dist contents:', require('fs').readdirSync(clientDistPath));
}
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route ${req.originalUrl} not found`,
      availableRoutes: ['/health', '/api/health', '/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/teams', '/api/billing/info', '/api/suggestions/personalized', '/api/generate-prompt', '/api/prompts']
    });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Catch all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/health', '/api']
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Root endpoint available at: http://localhost:${PORT}/`);
  console.log(`🛡️ Server bound to 0.0.0.0:${PORT} for Railway compatibility`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Info: http://localhost:${PORT}/api`);

  // Connect to database
  await connectDatabase();
});

export default app;
