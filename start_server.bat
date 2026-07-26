@echo off
title Englishers Club Server Launcher
cd /d "%~dp0"

echo ========================================================
echo         ENGLISHERS CLUB - SERVER LAUNCHER
echo ========================================================
echo.

node scripts\auto_update.js
if %errorlevel% equ 42 (
    echo [INFO] Update pulled. Restarting...
    timeout /t 2 >nul
    start_server.bat
    exit /b
)

echo [INFO] Starting Node.js server...
echo.

node server.js

pause