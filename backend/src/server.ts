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

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration - Support multiple origins for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined,
  process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : undefined
].filter(Boolean);

console.log('🌐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Railway domain
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
      return callback(null, true);
    }

    // Allow localhost with any port in development
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Info: http://localhost:${PORT}/api`);

  // Connect to database
  await connectDatabase();
});

export default app;
