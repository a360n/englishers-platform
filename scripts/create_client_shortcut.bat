@echo off
title Create Englishers Client Shortcut
cd /d "%~dp0"

echo ========================================================
echo        ENGLISHERS CLUB - CLIENT SHORTCUT CREATOR
echo ========================================================
echo.
echo This script will create a shortcut on your Desktop to access
echo the Englishers Club Platform hosted on the main server.
echo.

set /p SERVER_IP="Enter the Server LAN IP Address (e.g. 192.168.1.5): "

if "%SERVER_IP%"=="" (
    echo [ERROR] IP address cannot be empty!
    pause
    exit /b
)

set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Englishers Club.url"

echo [INFO] Creating Desktop shortcut pointing to http://%SERVER_IP%:3000 ...

(
echo [InternetShortcut]
echo URL=http://%SERVER_IP%:3000
echo IconFile=C:\Windows\system32\SHELL32.dll
echo IconIndex=14
) > "%SHORTCUT_PATH%"

echo.
echo [SUCCESS] Shortcut "Englishers Club" created on your Desktop!
echo You can now click it to open the platform directly.
echo.
pause
