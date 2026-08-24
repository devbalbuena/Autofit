@echo off
title AutoFit - Offline Photo Print Sizer
cd /d "%~dp0"

echo ===================================================
echo   AutoFit - Offline Photo Print Sizer
echo   Starting local application server...
echo ===================================================

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies...
    call npm install
)

:: Start Vite dev server and open browser
echo [INFO] Launching browser at http://localhost:5173/ ...
start "" "http://localhost:5173/"

npm run dev
pause
