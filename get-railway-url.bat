@echo off
echo.
echo ========================================
echo Get Your Railway Production URL
echo ========================================
echo.
echo Please go to:
echo https://railway.app/dashboard
echo.
echo Then:
echo 1. Click "shimmering-achievement" project
echo 2. Click your app service (NOT the database)
echo 3. Look for "Domains" section
echo 4. Copy the URL (ends with .up.railway.app)
echo.
echo Example: smartpromptiq-production.up.railway.app
echo.
set /p RAILWAY_URL="Paste your Railway URL here: "
echo.
echo ========================================
echo Testing Your Production Site
echo ========================================
echo.
echo Testing: https://%RAILWAY_URL%
echo.
curl -s https://%RAILWAY_URL%/api/health
echo.
echo.
echo Testing Academy API:
echo https://%RAILWAY_URL%/api/academy/courses
echo.
curl -s https://%RAILWAY_URL%/api/academy/courses | findstr "success"
echo.
echo.
pause
