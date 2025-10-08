const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Target backend URL - your main SmartPromptIQ backend
const TARGET_BACKEND = process.env.TARGET_BACKEND || 'https://smartpromptiq.up.railway.app';

console.log('🚀 Starting SmartPromptIQ Backend Proxy');
console.log('📍 Target Backend:', TARGET_BACKEND);
console.log('🔌 Port:', PORT);

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://smartpromptiq.com',
    'https://www.smartpromptiq.com',
    'https://smartpromptiq.up.railway.app',
    'https://smartpromptiq-pro.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-Device-Fingerprint',
    'X-Client-Version',
    'User-Agent'
  ]
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.get('origin')} at ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SmartPromptIQ Backend Proxy',
    timestamp: new Date().toISOString(),
    targetBackend: TARGET_BACKEND,
    uptime: process.uptime()
  });
});

// Import auth proxy routes
const authProxyRoutes = require('./routes/authProxy');
app.use('/api', authProxyRoutes);

// Generic proxy for other API calls (fallback)
app.all('/api/*', async (req, res) => {
  try {
    console.log(`🔄 Proxying ${req.method} ${req.path} to backend`);

    const targetUrl = `${TARGET_BACKEND}${req.path}`;
    console.log(`📡 Target URL: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartPromptIQ-Proxy/1.0',
        'X-Forwarded-For': req.ip,
        'X-Original-Host': req.get('host'),
        ...req.headers
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', responseText);
      data = { error: 'Invalid response from backend', rawResponse: responseText };
    }

    console.log(`📤 Proxy response: ${response.status} ${response.ok ? 'OK' : 'ERROR'}`);
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Backend service unavailable',
      message: error.message,
      proxy: true
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Proxy Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Proxy server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on proxy server`,
    availableRoutes: ['/health', '/api/*']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartPromptIQ Backend Proxy running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Proxying to: ${TARGET_BACKEND}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🛡️ Server bound to 0.0.0.0:${PORT} for Railway compatibility`);
});

module.exports = app;