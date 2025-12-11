# Test Production Deployment
# Run this to check if Railway has deployed the latest code

Write-Host "🔍 Testing Production Deployment..." -ForegroundColor Cyan
Write-Host ""

# Get Railway URL
$railwayUrl = Read-Host "Enter your Railway URL (e.g., smartpromptiq-production.up.railway.app)"

if ([string]::IsNullOrWhiteSpace($railwayUrl)) {
    Write-Host "❌ No URL provided" -ForegroundColor Red
    exit 1
}

# Add https:// if not present
if (-not $railwayUrl.StartsWith("http")) {
    $railwayUrl = "https://$railwayUrl"
}

Write-Host "Testing: $railwayUrl" -ForegroundColor White
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$railwayUrl/api/health" -Method Get
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Academy API
Write-Host "Test 2: Academy Courses API" -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$railwayUrl/api/academy/courses" -Method Get
    if ($courses.success -and $courses.data) {
        $courseCount = $courses.data.Count
        Write-Host "✅ Academy API works! Found $courseCount courses" -ForegroundColor Green
        Write-Host "   First 3 courses:" -ForegroundColor Gray
        $courses.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.title) ($($_.accessTier))" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  API responded but no courses found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Academy API failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This means the new code is NOT deployed yet" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If Academy API failed:" -ForegroundColor Yellow
Write-Host "1. Check Railway dashboard for deployment status" -ForegroundColor White
Write-Host "2. Look for build errors in Railway logs" -ForegroundColor White
Write-Host "3. Make sure the deployment shows 'Success'" -ForegroundColor White
Write-Host ""
Write-Host "Visit: https://railway.app/dashboard" -ForegroundColor Cyan
