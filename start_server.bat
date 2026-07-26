@echo off
setlocal enabledelayedexpansion
title Englishers Club Server Launcher
cd /d "%~dp0"

echo ========================================================
echo         ENGLISHERS CLUB - SERVER LAUNCHER
echo ========================================================
echo.

REM Run Smart Auto-Updater
call node scripts\auto_update.js
set EXIT_STATUS=%errorlevel%

if "%EXIT_STATUS%"=="42" (
    echo.
    echo [INFO] Restarting server launcher with updated codebase in 2 seconds...
    timeout /t 2 >nul
    call start_server.bat
    exit /b
)

echo.
REM Get LAN IP
set LAN_IP=127.0.0.1
for /f "delims=" %%i in ('node scripts\get_ip.js') do set LAN_IP=%%i

echo [INFO] Resolving network connection...
echo [SUCCESS] Server local LAN IP Address: %LAN_IP%
echo [INFO] Client devices on the network can access the portal at:
echo        http://%LAN_IP%:3000
echo.
echo [INFO] Starting Node.js server...
echo.

REM Automatically open browser directly to port 3000 after 2 seconds
start /b cmd /c "timeout /t 2 >nul && start http://%LAN_IP%:3000"

REM Start Node Express server
call node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with error code %errorlevel%.
    pause
)

pause