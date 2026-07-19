// Helper script to get the local network IPv4 address of the host machine.
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Check for IPv4 and skip internal/loopback addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                // Prioritize common LAN interface names (Wi-Fi, Ethernet, en0, eth0)
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

console.log(getLocalIp());
