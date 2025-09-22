const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 RAILWAY SERVER STARTING...');
console.log('Current time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// Minimal essential middleware
app.use(express.json({ limit: '1mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// CRITICAL: Railway health check - IMMEDIATE RESPONSE
app.get('/health', (req, res) => {
  console.log('🏥 Health check at:', new Date().toISOString());
  res.status(200).send('OK');
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('📁 Frontend path:', clientDistPath);

if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build found');
  app.use(express.static(clientDistPath));
} else {
  console.log('⚠️ Frontend build not found - serving basic routes only');
}

// Basic auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: { token: 'demo-token', user: { id: 'demo', email: 'demo@example.com' } }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token',
    user: { id: 'demo', email: req.body.email || 'demo@example.com' }
  });
});

// Catch all
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>SmartPromptIQ</title></head>
        <body>
          <h1>SmartPromptIQ Server Running</h1>
          <p>Time: ${new Date().toISOString()}</p>
          <p>Health: <a href="/health">/health</a></p>
          <p>API Health: <a href="/api/health">/api/health</a></p>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(40));
  console.log('🚀 RAILWAY SERVER READY');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Host: 0.0.0.0`);
  console.log(`🏥 Health: /health`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(40));
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle shutdown
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`🛑 ${signal} received - shutting down`);
    server.close(() => process.exit(0));
  });
});