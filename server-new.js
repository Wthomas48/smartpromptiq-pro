import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://*.railway.app', 'https://smartpromptiq.com']
    : 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartPromptIQ' });
});

// API placeholder routes
app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ message: 'User info endpoint - to be implemented' });
});

// Static file serving
const distPath = path.join(__dirname, 'dist');
console.log('🔍 Looking for frontend build at:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ Frontend build directory exists');
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend build not found' });
    }
  });
} else {
  console.log('❌ Frontend build not found, serving API only');
  app.get('*', (req, res) => {
    res.status(404).json({
      error: 'Frontend not built yet',
      message: 'Run npm run build to generate frontend assets'
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\\n🚀 SmartPromptIQ Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);

  if (fs.existsSync(distPath)) {
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
  }
});

export default app;