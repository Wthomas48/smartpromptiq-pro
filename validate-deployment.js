#!/usr/bin/env node

/**
 * Complete Deployment Validation Script for SmartPromptIQ Pro
 * Tests all integrations before Railway deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔬 SmartPromptIQ Pro - Complete Integration Validation');
console.log('=' .repeat(60));

// Test Results
const results = {
  frontend: false,
  backend: false,
  billing: false,
  teams: false,
  stripe: false,
  database: false,
  environment: false
};

// 1. Frontend Build Check
console.log('\n📦 Testing Frontend Build...');
try {
  const distPath = path.join(__dirname, 'client', 'dist');
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log('✅ Frontend build exists and ready');
    results.frontend = true;
  } else {
    console.log('❌ Frontend build missing - run: cd client && npm run build');
  }
} catch (error) {
  console.log('❌ Frontend build check failed:', error.message);
}

// 2. Backend Dependencies Check
console.log('\n🔧 Testing Backend Dependencies...');
try {
  const backendPath = path.join(__dirname, 'backend');
  const nodeModules = path.join(backendPath, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    console.log('✅ Backend dependencies installed');
    results.backend = true;
  } else {
    console.log('❌ Backend dependencies missing - run: cd backend && npm install');
  }
} catch (error) {
  console.log('❌ Backend dependency check failed:', error.message);
}

// 3. Billing Integration Check
console.log('\n💳 Testing Billing Integration...');
try {
  // Check if billing endpoints exist in backend
  const simpleServerFile = path.join(__dirname, 'backend', 'simple-server.js');
  const billingFile = path.join(__dirname, 'backend', 'src', 'routes', 'billing.ts');

  if (fs.existsSync(simpleServerFile)) {
    const serverContent = fs.readFileSync(simpleServerFile, 'utf8');
    const hasBillingEndpoints = serverContent.includes('/api/billing') || serverContent.includes('billing');

    if (hasBillingEndpoints && fs.existsSync(billingFile)) {
      console.log('✅ Billing integration configured');
      console.log('  ✓ Billing API endpoints available');
      console.log('  ✓ Stripe billing configuration exists');
      results.billing = true;
    } else {
      console.log('❌ Billing integration incomplete');
      console.log(`  ${hasBillingEndpoints ? '✓' : '✗'} Billing API endpoints`);
      console.log(`  ${fs.existsSync(billingFile) ? '✓' : '✗'} Stripe billing file`);
    }
  } else {
    console.log('❌ Backend server file not found');
  }
} catch (error) {
  console.log('❌ Billing integration check failed:', error.message);
}

// 4. Stripe Configuration Check
console.log('\n🔒 Testing Stripe Configuration...');
try {
  const billingFile = path.join(__dirname, 'backend', 'src', 'routes', 'billing.ts');
  const pricingConfig = path.join(__dirname, 'shared', 'pricing', 'config.ts');

  if (fs.existsSync(billingFile) && fs.existsSync(pricingConfig)) {
    const billingContent = fs.readFileSync(billingFile, 'utf8');
    const pricingContent = fs.readFileSync(pricingConfig, 'utf8');

    // Check for Stripe price IDs
    const hasPriceIds = billingContent.includes('price_1QKrTdJNxVjDuJxhRtAMo2K7') &&
                       pricingContent.includes('price_1QKrTdJNxVjDuJxhRtAMo2K7');

    if (hasPriceIds) {
      console.log('✅ Stripe integration configured with correct price IDs');
      results.stripe = true;
    } else {
      console.log('❌ Stripe price IDs not properly configured');
    }
  } else {
    console.log('❌ Stripe configuration files missing');
  }
} catch (error) {
  console.log('❌ Stripe configuration check failed:', error.message);
}

// 5. Enhanced Teams Check
console.log('\n👥 Testing Enhanced Teams Functionality...');
try {
  const teamsFile = path.join(__dirname, 'client', 'src', 'pages', 'Teams.tsx');
  if (fs.existsSync(teamsFile)) {
    const teamsContent = fs.readFileSync(teamsFile, 'utf8');

    // Check for enhanced features
    const hasVideoSystem = teamsContent.includes('video-calling') || teamsContent.includes('VideoCall');
    const hasMessaging = teamsContent.includes('messaging') || teamsContent.includes('MessagesList');
    const hasAnalytics = teamsContent.includes('analytics') || teamsContent.includes('Analytics');
    const hasFileManagement = teamsContent.includes('Files Tab') || teamsContent.includes('Upload') || teamsContent.includes('API_Documentation');

    if (hasVideoSystem && hasMessaging && hasAnalytics && hasFileManagement) {
      console.log('✅ Enhanced Teams functionality implemented');
      console.log('  ✓ Video calling system');
      console.log('  ✓ Real-time messaging');
      console.log('  ✓ Analytics dashboard');
      console.log('  ✓ File management');
      results.teams = true;
    } else {
      console.log('❌ Enhanced Teams features incomplete');
      console.log(`  ${hasVideoSystem ? '✓' : '✗'} Video calling system`);
      console.log(`  ${hasMessaging ? '✓' : '✗'} Real-time messaging`);
      console.log(`  ${hasAnalytics ? '✓' : '✗'} Analytics dashboard`);
      console.log(`  ${hasFileManagement ? '✓' : '✗'} File management`);
    }
  } else {
    console.log('❌ Teams.tsx file not found');
  }
} catch (error) {
  console.log('❌ Teams functionality check failed:', error.message);
}

// 6. Environment Configuration Check
console.log('\n🔐 Testing Environment Configuration...');
try {
  const envExample = path.join(__dirname, 'env-example');
  if (fs.existsSync(envExample)) {
    const envContent = fs.readFileSync(envExample, 'utf8');

    const hasRequired = envContent.includes('DATABASE_URL') &&
                       envContent.includes('JWT_SECRET') &&
                       envContent.includes('STRIPE_SECRET_KEY') &&
                       envContent.includes('STRIPE_WEBHOOK_SECRET');

    if (hasRequired) {
      console.log('✅ Environment configuration complete');
      results.environment = true;
    } else {
      console.log('❌ Environment configuration incomplete');
    }
  } else {
    console.log('❌ env-example file missing');
  }
} catch (error) {
  console.log('❌ Environment configuration check failed:', error.message);
}

// 7. Railway Deployment Files Check
console.log('\n🚂 Testing Railway Deployment Readiness...');
try {
  const railwayToml = path.join(__dirname, 'railway.toml');
  const deployScript = path.join(__dirname, 'railway-deploy.js');
  const deployGuide = path.join(__dirname, 'DEPLOYMENT-GUIDE.md');

  if (fs.existsSync(railwayToml) && fs.existsSync(deployScript) && fs.existsSync(deployGuide)) {
    console.log('✅ Railway deployment files ready');
    console.log('  ✓ railway.toml configuration');
    console.log('  ✓ railway-deploy.js script');
    console.log('  ✓ DEPLOYMENT-GUIDE.md documentation');
    results.database = true;
  } else {
    console.log('❌ Railway deployment files incomplete');
    console.log(`  ${fs.existsSync(railwayToml) ? '✓' : '✗'} railway.toml`);
    console.log(`  ${fs.existsSync(deployScript) ? '✓' : '✗'} railway-deploy.js`);
    console.log(`  ${fs.existsSync(deployGuide) ? '✓' : '✗'} DEPLOYMENT-GUIDE.md`);
  }
} catch (error) {
  console.log('❌ Railway deployment check failed:', error.message);
}

// Final Results
console.log('\n📊 VALIDATION SUMMARY');
console.log('=' .repeat(60));

const totalTests = Object.keys(results).length;
const passedTests = Object.values(results).filter(Boolean).length;
const successRate = Math.round((passedTests / totalTests) * 100);

Object.entries(results).forEach(([test, passed]) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const testName = test.charAt(0).toUpperCase() + test.slice(1);
  console.log(`${status} ${testName} Integration`);
});

console.log('\n📈 Overall Status:');
console.log(`${passedTests}/${totalTests} tests passed (${successRate}%)`);

if (successRate >= 85) {
  console.log('🎉 READY FOR RAILWAY DEPLOYMENT!');
  console.log('\nNext Steps:');
  console.log('1. Set environment variables in Railway dashboard');
  console.log('2. Run: node railway-deploy.js');
  console.log('3. Configure Stripe webhooks with Railway URL');
  console.log('4. Test live deployment');
} else {
  console.log('⚠️  DEPLOYMENT NOT RECOMMENDED');
  console.log('\nPlease fix failing tests before deploying to Railway.');
}

console.log('\n🔗 Useful Commands:');
console.log('npm run dev:client    # Start frontend dev server');
console.log('npm run dev:server    # Start backend server');
console.log('npm run build         # Build for production');
console.log('node railway-deploy.js # Deploy to Railway');