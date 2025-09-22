const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 MINIMAL SERVER STARTING');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV);

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check accessed');
  res.status(200).json({
    status: 'healthy',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Basic API endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SmartPromptIQ Minimal Server',
    status: 'running',
    endpoints: ['/health', '/api/health'],
    timestamp: new Date().toISOString()
  });
});

// Catch all
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    message: 'This is a minimal server for testing Railway deployment'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Bound to 0.0.0.0 for Railway compatibility`);
});