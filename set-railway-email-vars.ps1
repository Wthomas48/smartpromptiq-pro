# PowerShell script to set Railway environment variables for Zoho email
# Usage: .\set-railway-email-vars.ps1

Write-Host "🚀 Setting up Zoho Email Configuration on Railway..." -ForegroundColor Cyan
Write-Host ""

# Railway service name
$serviceName = "SmartPromptiq-pro"

Write-Host "📋 Service: $serviceName" -ForegroundColor Yellow
Write-Host ""

# Check if railway CLI is available
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: Before running this script, you need to:" -ForegroundColor Yellow
Write-Host "   1. Generate a Zoho App Password at: https://mail.zoho.com/" -ForegroundColor White
Write-Host "      Go to Settings → Security → App-Specific Passwords" -ForegroundColor White
Write-Host "   2. Copy the generated password" -ForegroundColor White
Write-Host ""

# Prompt for Zoho App Password
$zohoPassword = Read-Host "Enter your Zoho App Password (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($zohoPassword)) {
    Write-Host ""
    Write-Host "⚠️  No password provided. Please update SMTP_PASS manually in Railway dashboard." -ForegroundColor Yellow
    Write-Host ""
    $zohoPassword = "REPLACE_WITH_ZOHO_APP_PASSWORD"
}

Write-Host ""
Write-Host "📤 Setting environment variables on Railway..." -ForegroundColor Cyan
Write-Host ""

# Array of environment variables to set
$vars = @{
    "EMAIL_ENABLED" = "true"
    "MAIL_PROVIDER" = "smtp"
    "SMTP_HOST" = "smtp.zoho.com"
    "SMTP_PORT" = "465"
    "MAIL_SECURE" = "true"
    "SMTP_USER" = "noreply@smartpromptiq.com"
    "SMTP_PASS" = $zohoPassword
    "FROM_EMAIL" = "noreply@smartpromptiq.com"
    "FROM_NAME" = "SmartPromptIQ"
    "REPLY_TO" = "support@smartpromptiq.com"
    "APP_NAME" = "SmartPromptIQ"
    "SMTP_TLS_REJECT_UNAUTHORIZED" = "true"
}

$successCount = 0
$failCount = 0

foreach ($key in $vars.Keys) {
    $value = $vars[$key]

    Write-Host "Setting $key..." -NoNewline

    try {
        # Use railway variables set with the correct service name
        $output = railway variables --service $serviceName --set "${key}=$value" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌ Failed: $output" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "   ✅ Success: $successCount" -ForegroundColor Green
Write-Host "   ❌ Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Verify variables: railway variables --service $serviceName" -ForegroundColor White
    Write-Host "   2. Redeploy: railway up --service $serviceName" -ForegroundColor White
    Write-Host "   3. Test email: curl -X POST https://your-app.railway.app/api/utils/test-email -H 'Content-Type: application/json' -d '{\"to\":\"your-email@example.com\"}'" -ForegroundColor White
} else {
    Write-Host "⚠️  Some variables failed to set. Please check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you're logged in: railway login" -ForegroundColor White
    Write-Host "   2. Link to correct project: railway link" -ForegroundColor White
    Write-Host "   3. Check service name: railway service" -ForegroundColor White
    Write-Host "   4. Manually set variables in Railway dashboard" -ForegroundColor White
}

Write-Host ""
