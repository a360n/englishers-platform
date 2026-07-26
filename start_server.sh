#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

while true; do
    echo "========================================================"
    echo "        ENGLISHERS CLUB - SERVER LAUNCHER"
    echo "========================================================"
    echo

    # Check if Node is installed
    if ! command -v node &> /dev/null
    then
        echo "[ERROR] Node.js could not be found. Please install it."
        exit 1
    fi

    # Check and install dependencies if node_modules or bytenode is missing
    if [ ! -d "node_modules/bytenode" ]; then
        echo "[INFO] Installing required system dependencies..."
        npm install
        echo "[SUCCESS] Dependencies installed successfully!"
        echo
    fi

    # Run Smart Auto-Updater (Checks network 10s -> git pull -> restarts launcher if updated)
    node scripts/auto_update.js
    AUTO_UPDATE_STATUS=$?

    if [ $AUTO_UPDATE_STATUS -eq 42 ]; then
        echo "[INFO] Restarting server launcher with updated codebase in 2 seconds..."
        sleep 2
        continue
    fi

    break
done

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

# Open default browser once the server port is active
(
  for i in {1..30}; do
    if nc -z localhost 3000 &>/dev/null; then
      if command -v open &> /dev/null; then
          open "http://$LAN_IP:3000"
      elif command -v xdg-open &> /dev/null; then
          xdg-open "http://$LAN_IP:3000"
      fi
      exit 0
    fi
    sleep 1
  done
) &

# Run Express server
node server.js
