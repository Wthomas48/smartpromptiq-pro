@echo off
echo Switching to PRODUCTION manifest...
copy /Y manifest.prod.json manifest.json
echo.
echo Done! Extension is now in PRODUCTION mode.
echo Reload the extension in chrome://extensions/
pause
