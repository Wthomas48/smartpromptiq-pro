@echo off
echo ========================================
echo   SmartPromptIQ - Railway Deployment
echo ========================================
echo.

echo [1/5] Building frontend...
cd client
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend built successfully!
echo.

echo [2/5] Committing changes...
git add -A
git commit -m "Production build - Fix billing page"
echo ✓ Changes committed!
echo.

echo [3/5] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Git push failed!
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub!
echo.

echo [4/5] Waiting for Railway auto-deploy...
echo Railway will automatically detect the push and deploy.
echo.
echo Check deployment status at:
echo https://railway.app/project/shimmering-achievement
echo.

echo [5/5] Testing production...
timeout /t 30 /nobreak
echo.
echo Opening production site...
start "" "https://smartpromptiq.com/billing"
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Local: http://localhost:5173/billing
echo Production: https://smartpromptiq.com/billing
echo.
echo If page still shows errors:
echo 1. Wait 2-3 minutes for Railway to build
echo 2. Hard refresh browser (Ctrl+Shift+R)
echo 3. Check Railway dashboard for build status
echo.
pause
