# Backup Smart PromptIQ
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "Creating backup..." -ForegroundColor Cyan
Set-Location "C:\smartpromptiqpro"
git add .
git commit -m "Backup: $timestamp"
Write-Host "✓ Backup created with timestamp: $timestamp" -ForegroundColor Green
