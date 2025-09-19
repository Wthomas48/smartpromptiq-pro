#!/usr/bin/env node

// Railway-specific build script with timeout protection and error handling
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Railway Build Script Starting...');
console.log('📁 Working Directory:', process.cwd());
console.log('🕒 Build Timeout: 5 minutes');

// Set environment variables for Railway
process.env.NODE_ENV = 'production';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.VITE_NODE_ENV = 'production';

try {
  // Verify we're in the right directory
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('❌ package.json not found - wrong directory');
  }

  // Change to client directory
  const clientDir = path.join(process.cwd(), 'client');
  console.log('📂 Changing to client directory:', clientDir);

  if (!fs.existsSync(clientDir)) {
    throw new Error('❌ client directory not found');
  }

  // Verify required files exist
  const indexPath = path.join(clientDir, 'index.html');
  const mainPath = path.join(clientDir, 'src', 'main.tsx');
  const configPath = path.join(clientDir, 'vite.config.railway.mjs');

  console.log('🔍 Verifying required files...');
  if (!fs.existsSync(indexPath)) {
    throw new Error('❌ client/index.html not found');
  }
  if (!fs.existsSync(mainPath)) {
    throw new Error('❌ client/src/main.tsx not found');
  }
  if (!fs.existsSync(configPath)) {
    throw new Error('❌ client/vite.config.railway.mjs not found');
  }

  console.log('✅ All required files verified');
  console.log('🔨 Starting Vite build...');

  // Execute build with timeout
  const buildCommand = 'npx vite build --config vite.config.railway.mjs --mode production';

  execSync(buildCommand, {
    cwd: clientDir,
    stdio: 'inherit',
    timeout: 300000, // 5 minutes timeout
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Verify build output
  const distPath = path.join(clientDir, 'dist');
  const builtIndexPath = path.join(distPath, 'index.html');

  console.log('🔍 Verifying build output...');
  if (!fs.existsSync(distPath)) {
    throw new Error('❌ dist directory not created');
  }
  if (!fs.existsSync(builtIndexPath)) {
    throw new Error('❌ dist/index.html not found');
  }

  // Check for assets
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    throw new Error('❌ assets directory not created');
  }

  const assets = fs.readdirSync(assetsPath);
  console.log('📦 Generated assets:', assets.length, 'files');

  console.log('✅ Railway build completed successfully!');
  console.log('🎉 Ready for deployment');

} catch (error) {
  console.error('❌ Railway build failed:', error.message);
  process.exit(1);
}