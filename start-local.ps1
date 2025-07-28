# SmartPromptIQ Local Development Starter
Write-Host "`n🚀 Starting SmartPromptIQ Local Development" -ForegroundColor Magenta
Write-Host "===========================================" -ForegroundColor Magenta

# Check if Docker is running
Write-Host "`n🐳 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Start PostgreSQL
Write-Host "`n1️⃣ Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database
Write-Host "`n⏳ Waiting for database to be ready..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 30
while ($attempts -lt $maxAttempts) {
    try {
        docker exec smartpromptiq-db pg_isready -U postgres | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database is ready!" -ForegroundColor Green
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
    $attempts++
    Write-Host "." -NoNewline
}

if ($attempts -eq $maxAttempts) {
    Write-Host "`n❌ Database failed to start" -ForegroundColor Red
    exit 1
}

# Start backend server
Write-Host "`n2️⃣ Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Backend Server' -ForegroundColor Cyan; npm run dev:local"

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend
Write-Host "`n3️⃣ Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev:frontend"

# Show status
Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "`n📋 Services running:" -ForegroundColor Cyan
Write-Host "  🗄️  Database:    postgresql://localhost:5432/smartpromptiq" -ForegroundColor White
Write-Host "  🔧 Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "  🎨 Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "  - View database logs: npm run db:logs" -ForegroundColor Gray
Write-Host "  - Access database shell: npm run db:shell" -ForegroundColor Gray
Write-Host "  - Stop all services: .\stop-local.ps1" -ForegroundColor Gray
Write-Host "`n🎯 Happy coding!" -ForegroundColor Magenta
