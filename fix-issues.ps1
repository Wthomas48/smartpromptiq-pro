# Smart PromptIQ - Fix All Issues Script
Write-Host "=== FIXING SMART PROMPTIQ ISSUES ===" -ForegroundColor Magenta
Write-Host "Addressing all identified problems..." -ForegroundColor Green

# Step 1: Create missing directories
Write-Host "`n1. CREATING MISSING DIRECTORIES" -ForegroundColor Yellow
$missingDirs = @("pages", "pages/api", "styles")
foreach ($dir in $missingDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "✓ Already exists: $dir" -ForegroundColor Gray
    }
}

# Step 2: Create next.config.js
$nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
}
module.exports = nextConfig
"@
Set-Content -Path "next.config.js" -Value $nextConfig -Encoding UTF8
Write-Host "✓ Created: next.config.js" -ForegroundColor Green

# Step 3: Create global styles
$globalStyles = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .feature-card {
    transition: all 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-4px);
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
}
"@
Set-Content -Path "styles/globals.css" -Value $globalStyles -Encoding UTF8
Write-Host "✓ Created: styles/globals.css" -ForegroundColor Green

Write-Host "`n=== BASIC FIXES COMPLETE ===" -ForegroundColor Magenta
Write-Host "Now run: npm install && npm run dev" -ForegroundColor Yellow
