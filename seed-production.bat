@echo off
echo.
echo ========================================
echo SmartPromptIQ Production Seed Script
echo ========================================
echo.

echo Step 1: Get DATABASE_URL from Railway
echo ----------------------------------------
echo.
echo 1. Go to: https://railway.app/dashboard
echo 2. Click your SmartPromptIQ project
echo 3. Click PostgreSQL database service
echo 4. Click 'Connect' tab
echo 5. Copy 'Postgres Connection URL'
echo.

set /p DATABASE_URL="Paste your DATABASE_URL here: "

if "%DATABASE_URL%"=="" (
    echo.
    echo ERROR: No DATABASE_URL provided
    echo.
    pause
    exit /b 1
)

echo.
echo DATABASE_URL received!
echo.

echo Step 2: Running migrations...
echo ----------------------------------------
cd backend
call npx prisma generate >nul 2>&1
call npx prisma migrate deploy >nul 2>&1
echo Migrations complete!
echo.

echo Step 3: Seeding courses (30 seconds)...
echo ----------------------------------------
echo.
call npm run seed
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Production seeded with 57 courses!
    echo ========================================
    echo.
    echo Visit: https://your-app.railway.app/api/academy/courses
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Seeding failed!
    echo ========================================
    echo.
)

cd ..
pause
