#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

echo "========================================================"
echo "        ENGLISHERS CLUB - MAC/LINUX SERVER LAUNCHER"
echo "========================================================"
echo

# Check if Node is installed
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js could not be found. Please install it."
    exit 1
fi

# Try to start Postgres App on macOS if installed
if [ -d "/Applications/Postgres.app" ]; then
    echo "[INFO] Starting Postgres.app GUI..."
    open -a Postgres
    sleep 4
fi

# Get LAN IP
LAN_IP=$(node scripts/get_ip.js)

echo "[INFO] Server local LAN IP Address: $LAN_IP"
echo "[INFO] Other devices on this Wi-Fi network can connect to:"
echo "       http://$LAN_IP:3000"
echo

# Open default browser
sleep 1.5
if command -v open &> /dev/null; then
    open "http://$LAN_IP:3000"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://$LAN_IP:3000"
fi

# Run Express server
node server.js
