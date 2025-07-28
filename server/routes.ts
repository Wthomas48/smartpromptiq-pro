import { Express } from 'express';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import stripeRoutes from './routes/stripe.js';

export async function registerRoutes(app: Express) {
  console.log('📋 Registering routes...');
  
  // Register auth routes
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered at /api/auth');
  
  // Register other API routes  
  app.use('/api', apiRoutes);
  console.log('✅ API routes registered at /api');
  
  // Register stripe routes
  app.use('/api/stripe', stripeRoutes);
  console.log('✅ Stripe routes registered at /api/stripe');
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  console.log('✅ Health check registered at /api/health');

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
