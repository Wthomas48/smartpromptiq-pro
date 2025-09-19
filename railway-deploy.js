#!/usr/bin/env node

/**
 * Railway Deployment Script for SmartPromptIQ Pro
 * Handles building and deploying the application to Railway
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Railway deployment process...');

// Check if Railway CLI is installed
try {
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI found');
} catch (error) {
  console.error('❌ Railway CLI not found. Please install it first:');
  console.error('npm install -g @railway/cli');
  process.exit(1);
}

// Verify environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

console.log('🔍 Checking required environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
  console.log('💡 Set them in Railway dashboard or use "railway variables set"');
}

// Build frontend
console.log('🏗️  Building frontend...');
try {
  process.chdir('client');
  execSync('npm ci', { stdio: 'inherit' });
  execSync('CI=false npm run build', { stdio: 'inherit', env: { ...process.env, CI: 'false', NODE_ENV: 'production' } });
  console.log('✅ Frontend built successfully');
  process.chdir('..');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  console.error('💡 Try running: cd client && CI=false npm run build');
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  process.chdir('backend');
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
  process.chdir('..');
} catch (error) {
  console.error('❌ Backend dependency installation failed:', error.message);
  process.exit(1);
}

// Check if database needs migration
console.log('🗄️  Checking database setup...');
try {
  process.chdir('backend');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Note: Migrations should be run manually in production
  console.log('💡 Remember to run database migrations on Railway:');
  console.log('   railway run npx prisma migrate deploy');
  console.log('   railway run npx prisma db seed');

  process.chdir('..');
} catch (error) {
  console.warn('⚠️  Database setup issue:', error.message);
}

// Deploy to Railway
console.log('🚂 Deploying to Railway...');
try {
  execSync('railway up', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

// Post-deployment checks
console.log('🔍 Running post-deployment checks...');
console.log('📋 Deployment checklist:');
console.log('  ✓ Frontend built and included');
console.log('  ✓ Backend dependencies installed');
console.log('  ✓ Prisma client generated');
console.log('  • Set environment variables in Railway dashboard');
console.log('  • Run database migrations: railway run npx prisma migrate deploy');
console.log('  • Seed database: railway run npx prisma db seed');
console.log('  • Configure custom domain (optional)');
console.log('  • Set up Stripe webhooks with your Railway URL');

console.log('🎉 Deployment process completed!');
console.log('🌐 Check your Railway dashboard for the live URL');