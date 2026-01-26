@echo off
echo Switching to DEVELOPMENT manifest...
copy /Y manifest.json manifest.prod.json >nul 2>&1
copy /Y manifest.dev.json manifest.json
echo.
echo Done! Extension is now in DEV mode.
echo Reload the extension in chrome://extensions/
pause
