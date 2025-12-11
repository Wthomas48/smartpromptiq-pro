@echo off
echo.
echo ========================================
echo Seeding Production Database NOW
echo ========================================
echo.

set DATABASE_URL=postgresql://postgres:xYiuuCchtQPUaaKVejYWcUSuSBiqCsIM@metro.proxy.rlwy.net:36720/railway

echo Database: Railway Production (metro.proxy.rlwy.net)
echo.
echo Starting seed in 3 seconds...
timeout /t 3 >nul

cd backend
echo.
echo Running migrations...
call npx prisma migrate deploy
echo.
echo.
echo Seeding 57 courses + 555 lessons...
echo This will take about 30 seconds...
echo.
call npm run seed
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! 57 courses seeded!
    echo ========================================
    echo.
    echo Check: https://smartpromptiq-production.up.railway.app/api/academy/courses
    echo.
) else (
    echo.
    echo ERROR: Seeding failed
    echo.
)

cd ..
pause
