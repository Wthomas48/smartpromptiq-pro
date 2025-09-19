#!/bin/bash

echo "🚀 Force Railway Deployment - Signup Fix"
echo "======================================="

# Build client fresh
echo "📦 Building client..."
cd client
rm -rf dist node_modules/.vite
npm ci
npm run build
cd ..

# Create production build info
echo "📝 Creating build info..."
echo "Build: $(date -u +%Y-%m-%dT%H:%M:%S) - Signup Fix v3" > client/dist/build-info.txt

# Check build files
echo "📁 Checking build files..."
ls -la client/dist/

# Commit and push
echo "📤 Committing build..."
git add .
git commit -m "Force Railway deployment - Signup Fix v3 - $(date -u +%Y-%m-%dT%H:%M:%S)"
git push

echo "✅ Deployment forced - check Railway dashboard!"
echo "🔍 Look for this commit hash in Railway deployments"
echo "🌐 After deployment, check live site for:"
echo "   - Build footer: 2025-09-19T15:00 - Signup Fix v2"
echo "   - Signup/Signin toggle buttons"
echo "   - Complete signup form with all fields"