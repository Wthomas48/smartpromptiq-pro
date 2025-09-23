#!/usr/bin/env node

/**
 * NUCLEAR DEPLOYMENT SCRIPT
 * Forces complete rebuild and deployment with cache busting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 NUCLEAR DEPLOYMENT: Force complete rebuild and deploy');
console.log('====================================================');

// Step 1: Clean everything
console.log('🧹 Step 1: Cleaning build artifacts...');
try {
  if (fs.existsSync('./client/dist')) {
    fs.rmSync('./client/dist', { recursive: true, force: true });
    console.log('✅ Removed client/dist');
  }
  if (fs.existsSync('./client/node_modules/.vite')) {
    fs.rmSync('./client/node_modules/.vite', { recursive: true, force: true });
    console.log('✅ Removed Vite cache');
  }
} catch (error) {
  console.log('⚠️ Clean step had minor issues:', error.message);
}

// Step 2: Update version numbers everywhere
console.log('🔄 Step 2: Updating version identifiers...');
const timestamp = Date.now();
const version = `v${timestamp}`;

// Update package.json version
const packagePath = './client/package.json';
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.version = `0.0.${timestamp}`;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log(`✅ Updated package.json version to ${pkg.version}`);
}

// Update HTML cache bust
const htmlPath = './client/index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(
    /<meta name="cache-bust" content="[^"]*"/,
    `<meta name="cache-bust" content="nuclear-deploy-${version}"`
  );
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ Updated HTML cache-bust to nuclear-deploy-${version}`);
}

// Step 3: Force rebuild
console.log('⚡ Step 3: Force rebuilding...');
process.chdir('./client');
execSync('npm run build', { stdio: 'inherit' });
process.chdir('../');

// Step 4: Update deployment marker
console.log('📝 Step 4: Creating deployment marker...');
fs.writeFileSync('./DEPLOYMENT_MARKER.txt', `Nuclear deployment: ${new Date().toISOString()}\nVersion: ${version}\nSignup fix: ACTIVE`);

console.log('');
console.log('🎯 NUCLEAR DEPLOYMENT COMPLETE!');
console.log('=====================================');
console.log(`📦 New Version: ${version}`);
console.log('🔥 Cache: COMPLETELY BUSTED');
console.log('🚀 Ready for Railway deployment');
console.log('');
console.log('Next: Git commit and push will trigger Railway deployment');