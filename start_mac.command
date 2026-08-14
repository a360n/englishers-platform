#!/bin/bash

# Navigate to the folder containing this script
cd "$(dirname "$0")"

clear
echo "========================================================"
echo "    ENGLISHERS CLUB PLATFORM - MAC SERVER LAUNCHER"
echo "========================================================"
echo

while true; do
    # Check Node.js installation
    if ! command -v node &> /dev/null
    then
        echo "[ERROR] Node.js is not installed on this Mac!"
        echo "Please install Node.js from https://nodejs.org/"
        echo
        read -p "Press Enter to exit..."
        exit 1
    fi

    # Install dependencies if missing
    if [ ! -d "node_modules/bytenode" ]; then
        echo "[INFO] Installing required dependencies..."
        npm install
        echo "[SUCCESS] Dependencies installed successfully!"
        echo
    fi

    # Run Smart Auto-Updater
    node scripts/auto_update.js
    AUTO_UPDATE_STATUS=$?

    if [ $AUTO_UPDATE_STATUS -eq 42 ]; then
        echo "[INFO] System updated! Restarting launcher in 2 seconds..."
        sleep 2
        continue
    fi

    break
done

# Start Postgres.app GUI if installed
if [ -d "/Applications/Postgres.app" ]; then
    echo "[INFO] Checking Postgres.app database..."
    open -a Postgres
    sleep 3
fi

# Get LAN IP Address
LAN_IP=$(node scripts/get_ip.js 2>/dev/null || echo "127.0.0.1")

echo
echo "========================================================"
echo " 🎉 ENGLISHERS CLUB PLATFORM IS RUNNING SUCCESSFULLY!"
echo "--------------------------------------------------------"
echo " 🌐 Local Browser: http://localhost:3000"
echo " 📡 LAN Wi-Fi IP:  http://$LAN_IP:3000"
echo "========================================================"
echo

# Auto open default browser in background
(
  sleep 2
  open "http://$LAN_IP:3000"
) &

# Run Express server
node server.js

echo
echo "[INFO] Server stopped."
read -p "Press Enter to exit..."
