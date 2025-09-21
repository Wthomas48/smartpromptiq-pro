const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5173;
const BACKEND_PORT = 5001;

// Simple MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy API requests to backend
  if (pathname.startsWith('/api')) {
    const backendUrl = `http://localhost:${BACKEND_PORT}${req.url}`;
    console.log(`🔄 Proxying: ${pathname} -> ${backendUrl}`);

    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end('Backend not available');
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, 'client', 'dist', pathname === '/' ? 'index.html' : pathname);

  // For SPA routing, serve index.html for routes that don't exist as files
  if (!fs.existsSync(filePath) && !pathname.includes('.')) {
    filePath = path.join(__dirname, 'client', 'dist', 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('File not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying API requests to backend on http://localhost:${BACKEND_PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'client', 'dist')}`);
});