# Clean Install Smart PromptIQ
Write-Host "Performing clean installation..." -ForegroundColor Cyan
Set-Location "C:\smartpromptiqpro"
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
npm cache clean --force
npm install
Write-Host "✓ Clean installation completed" -ForegroundColor Green
