@echo off
echo Testing Academy API on Railway...
echo.
echo Testing every 30 seconds until it returns JSON...
echo Press Ctrl+C to stop
echo.

:loop
echo [%TIME%] Testing API...
curl -s https://smartpromptiq-pro-production.up.railway.app/api/academy/courses > temp-response.txt
findstr /C:"success" temp-response.txt >nul
if %errorlevel%==0 (
    echo.
    echo ================================
    echo SUCCESS! API is returning JSON!
    echo ================================
    echo.
    type temp-response.txt | head -100
    del temp-response.txt
    pause
    exit /b 0
) else (
    echo Still returning HTML... waiting...
)

timeout /t 30 /nobreak >nul
goto loop
