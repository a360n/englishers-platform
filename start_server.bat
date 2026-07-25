@echo off
title Englishers Club Server Launcher
cd /d "%~dp0"

:START_LAUNCHER
cls
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

:: Run Smart Auto-Updater (Checks network 10s -> git pull -> restarts launcher if updated)
node scripts/auto_update.js
if %errorlevel% equ 42 (
    echo.
    echo [INFO] Restarting server launcher with updated codebase in 2 seconds...
    timeout /t 2 >nul
    goto START_LAUNCHER
)

echo.
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

:: Wait for port 3000 to be active before opening the browser (prevents connection refused error)
start /b cmd /c "for /l %%x in (1,1,30) do (netstat -ano | findstr :3000 >nul && (start http://%LAN_IP%:3000 && exit) || (timeout /t 1 >nul))"

:: Start Node Express server
node server.js

pause
