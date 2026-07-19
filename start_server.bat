@echo off
title Englishers Club Server Launcher
cd /d "%~dp0"

echo ========================================================
echo         ENGLISHERS CLUB - SERVER LAUNCHER
echo ========================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Get LAN IP
for /f "delims=" %%i in ('node scripts/get_ip.js') do set LAN_IP=%%i

echo [INFO] Resolving network connection...
echo [SUCCESS] Server local LAN IP Address: %LAN_IP%
echo [INFO] Client devices on the network can access the portal at:
echo        http://%LAN_IP%:3000
echo.
echo [INFO] Starting Postgres database service check...
echo [INFO] Starting Node.js server...
echo.

:: Open browser in 2 seconds
start /b cmd /c "timeout /t 2 >nul && start http://%LAN_IP%:3000"

:: Start Node Express server
node server.js

pause
