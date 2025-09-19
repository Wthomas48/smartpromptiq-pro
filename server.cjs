const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Serve static files from the React app build directory
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('🔍 Looking for frontend build at:', clientDistPath);

// Check if the directory exists at startup
if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build directory exists');

  // Serve static assets with long-term caching (they have hash fingerprints)
  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
    maxAge: '1y',
    immutable: true
  }));

  // Serve other static files with shorter cache
  app.use(express.static(clientDistPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      // Don't cache index.html so users get new asset URLs
      if (path.basename(filePath) === 'index.html') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
} else {
  console.log('❌ Frontend build directory does NOT exist');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Demo API endpoints (simplified)
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      token: 'demo-token',
      user: { id: 'demo', email: 'demo@example.com', firstName: 'Demo', lastName: 'User' }
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token',
    user: { id: 'demo', email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName }
  });
});

// Rating API endpoints - Enhanced
app.get('/api/rating/config', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: true,
      defaultScale: 5,
      maxRating: 5,
      allowHistory: true,
      categories: ['quality', 'usefulness', 'clarity']
    }
  });
});

app.get('/api/rating/history', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.post('/api/rating', (req, res) => {
  res.json({
    success: true,
    message: 'Rating submitted successfully'
  });
});

// Categories API
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Business Strategy', description: 'Strategic planning and business development' },
      { id: 2, name: 'Marketing', description: 'Marketing campaigns and content' },
      { id: 3, name: 'Technology', description: 'Technical documentation and development' }
    ]
  });
});

// Demo API
app.get('/api/demo/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'demo-1', name: 'Demo Category', description: 'Demo category for testing' }
    ]
  });
});

// Billing API
app.get('/api/billing/subscription', (req, res) => {
  res.json({
    success: true,
    data: {
      tier: 'free',
      status: 'active',
      tokensRemaining: 100
    }
  });
});

// User API
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User'
    }
  });
});

// Additional API stubs for frontend functionality
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'user'
    }
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      signupEnabled: true,
      demoMode: true,
      features: {
        signup: true,
        signin: true,
        demo: true
      }
    }
  });
});

app.get('/api/features', (req, res) => {
  res.json({
    success: true,
    data: {
      signup: true,
      signin: true,
      demo: true,
      rating: true
    }
  });
});

// Generate API for prompts
app.post('/api/generate', (req, res) => {
  res.json({
    success: true,
    data: {
      content: 'Demo prompt generated successfully!',
      tokens: 150
    }
  });
});

// Templates API
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Demo Template', category: 'business' }
    ]
  });
});

// Catch-all for other API endpoints
app.all('/api/*', (req, res) => {
  console.log(`API endpoint called: ${req.method} ${req.path}`);
  res.json({
    success: false,
    message: 'API endpoint not implemented in demo mode'
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    // Ensure index.html is never cached so users get new asset URLs
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please check if the build exists.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend served from: ${clientDistPath}`);
});