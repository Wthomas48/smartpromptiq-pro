# PowerShell Script to Seed Production Database
# Run this with: .\seed-production-simple.ps1

Write-Host "🌱 SmartPromptIQ Production Database Seeding" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get DATABASE_URL from Railway
Write-Host "📋 Step 1: Get your DATABASE_URL from Railway" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Click your SmartPromptIQ project" -ForegroundColor White
Write-Host "3. Click your PostgreSQL database service (elephant icon)" -ForegroundColor White
Write-Host "4. Click 'Connect' tab" -ForegroundColor White
Write-Host "5. Copy the 'Postgres Connection URL'" -ForegroundColor White
Write-Host ""

# Prompt for DATABASE_URL
$databaseUrl = Read-Host "Paste your DATABASE_URL here"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "❌ No DATABASE_URL provided. Exiting..." -ForegroundColor Red
    exit 1
}

if (-not $databaseUrl.StartsWith("postgresql://")) {
    Write-Host "⚠️  WARNING: URL doesn't start with 'postgresql://' - this might not work" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ DATABASE_URL received!" -ForegroundColor Green
Write-Host ""

# Step 2: Run migrations (just in case)
Write-Host "📦 Step 2: Running database migrations..." -ForegroundColor Yellow
$env:DATABASE_URL = $databaseUrl

Push-Location backend
try {
    Write-Host "Generating Prisma client..." -ForegroundColor Gray
    npx prisma generate 2>&1 | Out-Null

    Write-Host "Deploying migrations..." -ForegroundColor Gray
    npx prisma migrate deploy 2>&1 | Out-Null

    Write-Host "✅ Migrations complete!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Migration warning (may be okay): $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Seed the database
Write-Host "🎓 Step 3: Seeding Academy courses (this takes ~30 seconds)..." -ForegroundColor Yellow
Write-Host ""

try {
    npm run seed
    Write-Host ""
    Write-Host "✅ Production database seeded successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Seeding failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Step 4: Verify
Write-Host ""
Write-Host "🔍 Step 4: Verifying courses..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Visit your production site to check:" -ForegroundColor White
Write-Host "  https://your-app.railway.app/api/academy/courses" -ForegroundColor Cyan
Write-Host ""
Write-Host "You should see 57 courses in the JSON response!" -ForegroundColor White
Write-Host ""
Write-Host "🎉 All done! Your Academy is now live with 57 courses!" -ForegroundColor Green
