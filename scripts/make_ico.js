const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'images', 'vertical_logo.png');
const icoPath = path.join(__dirname, '..', 'public', 'images', 'logo.ico');

if (!fs.existsSync(pngPath)) {
    console.error('PNG logo not found!');
    process.exit(1);
}

const pngBuffer = fs.readFileSync(pngPath);
const pngSize = pngBuffer.length;

// Create 22-byte ICO header for a single PNG image
const icoHeader = Buffer.alloc(22);

// Header
icoHeader.writeUInt16LE(0, 0);     // Reserved (0)
icoHeader.writeUInt16LE(1, 2);     // Image type (1 for ICO)
icoHeader.writeUInt16LE(1, 4);     // Number of images (1)

// Directory Entry
icoHeader.writeUInt8(0, 6);        // Width (0 means 256px)
icoHeader.writeUInt8(0, 7);        // Height (0 means 256px)
icoHeader.writeUInt8(0, 8);        // Color count (0 for >= 256 colors)
icoHeader.writeUInt8(0, 9);        // Reserved (0)
icoHeader.writeUInt16LE(1, 10);    // Color planes (1)
icoHeader.writeUInt16LE(32, 12);   // Bits per pixel (32)
icoHeader.writeUInt32LE(pngSize, 14); // Size of the PNG image data
icoHeader.writeUInt32LE(22, 18);   // Offset of the PNG image data (22 bytes header)

// Combine header and PNG data
const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);

fs.writeFileSync(icoPath, icoBuffer);
console.log('Successfully generated logo.ico at public/images/logo.ico');
