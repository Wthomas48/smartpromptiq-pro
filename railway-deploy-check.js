#!/usr/bin/env node

// Railway deployment readiness check
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway Deployment Readiness Check\n');

const checks = [
  {
    name: 'Root package.json build script',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build === 'cd client && npm run build:railway';
    },
    fix: 'Update root package.json: "build": "cd client && npm run build:railway"'
  },
  {
    name: 'Client Railway build script exists',
    test: () => fs.existsSync('client/build-railway.cjs'),
    fix: 'Missing client/build-railway.cjs - this should be created'
  },
  {
    name: 'Client Railway Vite config exists',
    test: () => fs.existsSync('client/vite.config.railway.cjs'),
    fix: 'Missing client/vite.config.railway.cjs - this should be created'
  },
  {
    name: 'Client package.json build:railway script',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
      return pkg.scripts && pkg.scripts['build:railway'] === 'node build-railway.cjs';
    },
    fix: 'Update client/package.json: "build:railway": "node build-railway.cjs"'
  },
  {
    name: 'Railway.toml configuration',
    test: () => {
      const config = fs.readFileSync('railway.toml', 'utf8');
      return config.includes('startCommand = "npm run railway:start"');
    },
    fix: 'Update railway.toml: startCommand = "npm run railway:start"'
  },
  {
    name: 'Nixpacks.toml build configuration',
    test: () => {
      const config = fs.readFileSync('nixpacks.toml', 'utf8');
      return config.includes('npm run build');
    },
    fix: 'Update nixpacks.toml build phase to include "npm run build"'
  },
  {
    name: 'Client source files exist',
    test: () => fs.existsSync('client/src/main.tsx') && fs.existsSync('client/index.html'),
    fix: 'Ensure client/src/main.tsx and client/index.html exist'
  }
];

let allPassed = true;

checks.forEach((check, i) => {
  try {
    const passed = check.test();
    console.log(`${i + 1}. ${check.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    if (!passed) {
      console.log(`   Fix: ${check.fix}\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`${i + 1}. ${check.name}: ❌ ERROR - ${error.message}`);
    console.log(`   Fix: ${check.fix}\n`);
    allPassed = false;
  }
});

console.log(allPassed ? '\n🎉 All checks passed! Ready for Railway deployment.' : '\n⚠️  Please fix the issues above before deploying.');

process.exit(allPassed ? 0 : 1);