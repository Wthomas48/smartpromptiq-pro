Write-Host "`n🛑 Stopping SmartPromptIQ Local Development" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red

Write-Host "`nStopping Docker containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n✅ All services stopped" -ForegroundColor Green
Write-Host "💡 To completely reset the database, run: npm run db:reset" -ForegroundColor Gray
