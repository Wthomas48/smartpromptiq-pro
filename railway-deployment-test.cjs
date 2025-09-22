const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

console.log('🚀 RAILWAY DEPLOYMENT SIMULATION TEST');
console.log('=====================================');

// Test Railway-compatible environment
const PORT = process.env.PORT || 9007;
process.env.RAILWAY_ENVIRONMENT = 'production';
process.env.RAILWAY_PROJECT_NAME = 'smartpromptiq-test';

// Create app instance
const app = express();

// Essential middleware
app.use(express.json());

// Simple CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from the React app build directory
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('🔍 Frontend build path:', clientDistPath);

// Check if build exists
if (fs.existsSync(clientDistPath)) {
  console.log('✅ Frontend build directory exists');
  const files = fs.readdirSync(clientDistPath);
  console.log('📁 Build contents:', files.slice(0, 5));
  app.use(express.static(clientDistPath));
} else {
  console.log('❌ Frontend build directory missing - THIS WILL CAUSE DEPLOYMENT FAILURE');
}

// CRITICAL: Railway health check endpoint - INSTANT RESPONSE
app.get('/health', (req, res) => {
  console.log('🏥 Health check accessed at:', new Date().toISOString());
  res.status(200).send('OK');
});

// Test API endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    simulation: true
  });
});

// Catch all handler
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found - deployment will fail');
  }
});

// Start server and run health check simulation
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simulation server running on port ${PORT}`);
  console.log('🌐 Bound to 0.0.0.0 for Railway compatibility');

  // Simulate Railway health check after 2 seconds
  setTimeout(() => {
    console.log('\n🏥 SIMULATING RAILWAY HEALTH CHECK...');

    const healthCheckUrl = `http://localhost:${PORT}/health`;
    const req = http.get(healthCheckUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Health check response: ${res.statusCode}`);
        console.log(`📝 Response body: "${data}"`);
        console.log(`⏱️  Response time: ${Date.now() - startTime}ms`);

        if (res.statusCode === 200 && data === 'OK') {
          console.log('🎉 HEALTH CHECK PASSED - Railway deployment would succeed');
        } else {
          console.log('❌ HEALTH CHECK FAILED - Railway deployment would fail');
        }

        // Test frontend availability
        setTimeout(testFrontend, 1000);
      });
    });

    const startTime = Date.now();
    req.on('error', (err) => {
      console.log('❌ Health check failed:', err.message);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Health check timeout - would fail Railway health check');
    });

  }, 2000);
});

function testFrontend() {
  console.log('\n🌐 TESTING FRONTEND AVAILABILITY...');
  const req = http.get(`http://localhost:${PORT}/`, (res) => {
    console.log(`📱 Frontend response: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend access failed');
    }

    // Shutdown after tests
    setTimeout(() => {
      console.log('\n🔚 Simulation complete - shutting down...');
      server.close();
      process.exit(0);
    }, 2000);
  });

  req.on('error', (err) => {
    console.log('❌ Frontend test failed:', err.message);
    server.close();
    process.exit(1);
  });
}

console.log('🔄 Simulation will auto-test health checks in 2 seconds...');