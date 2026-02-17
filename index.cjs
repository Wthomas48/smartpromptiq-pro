// index.cjs - Entry point for Railway deployment
// Delegates to the compiled TypeScript backend which has ALL routes + Socket.io
// Railway runs: node index.cjs (configured in dashboard)

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure backend dependencies are installed (may be missing after fresh deploy)
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (!fs.existsSync(path.join(backendNodeModules, 'express'))) {
  console.log('📦 Installing backend dependencies...');
  try {
    execSync('cd backend && npm install --production', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Backend dependencies installed');
  } catch (err) {
    console.error('❌ Failed to install backend deps:', err.message);
    process.exit(1);
  }
}

// Load the compiled TypeScript backend
console.log('🚀 Loading compiled backend from backend/dist/server.js...');
require('./backend/dist/server');
