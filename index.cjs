// index.cjs - Entry point for Railway deployment
// Delegates to the compiled TypeScript backend which has ALL routes + Socket.io
// Railway runs: node index.cjs (configured in dashboard)

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check for critical backend packages (not just express — also new deps)
const backendDir = path.join(__dirname, 'backend');
const criticalPackages = ['express', 'socket.io', 'jsonwebtoken', 'openai'];
const missingPackages = criticalPackages.filter(
  pkg => !fs.existsSync(path.join(backendDir, 'node_modules', pkg))
);

if (missingPackages.length > 0) {
  console.log(`📦 Missing backend packages: ${missingPackages.join(', ')}`);
  console.log('📦 Installing backend dependencies...');
  try {
    execSync('npm install --production', { stdio: 'inherit', cwd: backendDir });
    console.log('✅ Backend dependencies installed');
  } catch (err) {
    console.error('❌ Failed to install backend deps:', err.message);
    // Continue anyway — some packages might be optional
  }
}

// Load the compiled TypeScript backend with error handling
console.log('🚀 Loading compiled backend from backend/dist/server.js...');
try {
  require('./backend/dist/server');
} catch (err) {
  console.error('❌ Failed to load compiled backend:', err.message);
  console.error('Stack:', err.stack);

  // Log which files exist for debugging
  const distDir = path.join(__dirname, 'backend', 'dist');
  console.error('📁 backend/dist exists:', fs.existsSync(distDir));
  if (fs.existsSync(distDir)) {
    console.error('📁 backend/dist contents:', fs.readdirSync(distDir));
  }
  console.error('📁 backend/node_modules exists:', fs.existsSync(path.join(backendDir, 'node_modules')));

  process.exit(1);
}
