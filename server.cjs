const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health endpoint for Railway
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SmartPromptiq-pro',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  console.log('Info endpoint called');
  res.status(200).json({
    name: 'SmartPromptiq Pro API',
    version: '1.0.0',
    description: 'AI-powered prompt optimization platform',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SmartPromptiq Pro API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('SmartPromptiq Pro Server Started');
  console.log('Port: ' + PORT);
  console.log('Health: http://localhost:' + PORT + '/api/health');
  console.log('Info: http://localhost:' + PORT + '/api/info');
});
