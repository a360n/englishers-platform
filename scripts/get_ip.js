// Helper script to get the local network IPv4 address of the host machine (prioritizing Ethernet/Wi-Fi).
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    
    // First pass: prioritize Ethernet and Wi-Fi interfaces
    const priorityOrder = ['ethernet', 'eth', 'en', 'wi-fi', 'wifi', 'wlan'];
    for (const prefix of priorityOrder) {
        for (const name of Object.keys(interfaces)) {
            if (name.toLowerCase().includes(prefix)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
                        return iface.address;
                    }
                }
            }
        }
    }

    // Fallback pass: any non-internal IPv4
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
                return iface.address;
            }
        }
    }

    return '127.0.0.1';
}

module.exports = getLocalIp;

if (require.main === module) {
    console.log(getLocalIp());
}
