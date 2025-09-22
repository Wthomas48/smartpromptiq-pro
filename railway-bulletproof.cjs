// BULLETPROOF RAILWAY SERVER - ZERO DEPENDENCIES
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

console.log('🚀 BULLETPROOF RAILWAY SERVER STARTING...');
console.log('Time:', new Date().toISOString());
console.log('Node:', process.version);
console.log('CWD:', process.cwd());

const PORT = process.env.PORT || 5000;
const clientDistPath = path.join(__dirname, 'client', 'dist');

// Check if frontend exists
let frontendExists = false;
let indexHtml = '';

try {
  const indexPath = path.join(clientDistPath, 'index.html');
  frontendExists = fs.existsSync(indexPath);
  if (frontendExists) {
    indexHtml = fs.readFileSync(indexPath, 'utf8');
    console.log('✅ Frontend build loaded');
  } else {
    console.log('⚠️ No frontend build - using fallback');
  }
} catch (err) {
  console.log('⚠️ Frontend check failed:', err.message);
}

// Create HTTP server with ZERO overhead
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // IMMEDIATE CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // CRITICAL: Ultra-fast health check - NO LOGGING, NO DELAYS
  if (pathname === '/health' || pathname === '/' || pathname === '/healthz' || pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Verbose health check for debugging
  if (pathname === '/health/verbose') {
    console.log('🏥 Verbose health check at:', new Date().toISOString());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: PORT,
      memory: process.memoryUsage(),
      frontend: frontendExists
    }));
    return;
  }

  // API health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Basic auth endpoints
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: { token: 'demo-token', user: { id: 'demo', email: 'demo@example.com' } }
    }));
    return;
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      token: 'demo-token',
      user: { id: 'demo', email: 'demo@example.com' }
    }));
    return;
  }

  // Serve static files
  if (frontendExists && pathname !== '/') {
    const filePath = path.join(clientDistPath, pathname);
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon'
        }[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        return;
      }
    } catch (err) {
      // Fall through to catch-all
    }
  }

  // Catch-all: serve frontend or fallback
  if (frontendExists) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><title>SmartPromptIQ</title></head>
<body>
  <h1>🚀 SmartPromptIQ Server</h1>
  <p><strong>Status:</strong> Running</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  <p><strong>Port:</strong> ${PORT}</p>
  <p><strong>Health Check:</strong> <a href="/health">/health</a></p>
  <p><strong>API Health:</strong> <a href="/api/health">/api/health</a></p>
  <p><strong>Verbose Health:</strong> <a href="/health/verbose">/health/verbose</a></p>
</body>
</html>`);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 BULLETPROOF SERVER READY');
  console.log(`📡 Host: 0.0.0.0:${PORT}`);
  console.log(`🏥 Health: /health (INSTANT)`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`📊 Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
  console.log('='.repeat(50));
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`🛑 ${signal} - shutting down gracefully`);
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});

// Prevent crashes
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});