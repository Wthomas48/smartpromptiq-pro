/**
 * Icon Generator for SmartPromptIQ Chrome Extension
 *
 * This script creates placeholder PNG icons for the extension.
 * Run this with: node create-icons.js
 *
 * For production, replace these with professionally designed icons.
 */

const fs = require('fs');
const path = require('path');

// Simple PNG creator (creates a basic colored square)
// For proper icons, use a design tool or the HTML generator

function createSimplePNG(size, filename) {
  // PNG header and basic structure
  // This creates a simple gradient-colored icon

  const width = size;
  const height = size;

  // Create RGBA pixel data
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      // Calculate position for gradient
      const gradientPos = (x + y) / (width + height);

      // Purple to cyan gradient (SmartPromptIQ colors)
      const r = Math.floor(139 - gradientPos * 133); // 139 -> 6
      const g = Math.floor(92 + gradientPos * 90);   // 92 -> 182
      const b = Math.floor(246 - gradientPos * 34);  // 246 -> 212

      // Check if inside rounded rectangle
      const cornerRadius = size * 0.2;
      const inCorner = (
        (x < cornerRadius && y < cornerRadius && Math.sqrt(Math.pow(x - cornerRadius, 2) + Math.pow(y - cornerRadius, 2)) > cornerRadius) ||
        (x >= width - cornerRadius && y < cornerRadius && Math.sqrt(Math.pow(x - (width - cornerRadius), 2) + Math.pow(y - cornerRadius, 2)) > cornerRadius) ||
        (x < cornerRadius && y >= height - cornerRadius && Math.sqrt(Math.pow(x - cornerRadius, 2) + Math.pow(y - (height - cornerRadius), 2)) > cornerRadius) ||
        (x >= width - cornerRadius && y >= height - cornerRadius && Math.sqrt(Math.pow(x - (width - cornerRadius), 2) + Math.pow(y - (height - cornerRadius), 2)) > cornerRadius)
      );

      if (inCorner) {
        // Transparent
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      } else {
        // Draw "S" in center (simplified - just make center lighter)
        const centerX = width / 2;
        const centerY = height / 2;
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDist = size * 0.3;

        if (dist < maxDist) {
          // White-ish center for "S"
          const factor = 1 - (dist / maxDist) * 0.5;
          pixels[i] = Math.min(255, Math.floor(r + (255 - r) * factor));
          pixels[i + 1] = Math.min(255, Math.floor(g + (255 - g) * factor));
          pixels[i + 2] = Math.min(255, Math.floor(b + (255 - b) * factor));
          pixels[i + 3] = 255;
        } else {
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = 255;
        }
      }
    }
  }

  console.log(`Creating ${filename} (${size}x${size})...`);
  console.log('Note: For production, use professional PNG files or the HTML generator.');

  // Note: This just shows the structure - to create actual PNGs you need
  // a library like 'canvas' or 'sharp'. The HTML generator is recommended.
}

console.log('SmartPromptIQ Icon Generator');
console.log('============================\n');
console.log('To generate icons:');
console.log('');
console.log('OPTION 1 - Use HTML Generator (Recommended):');
console.log('  1. Open chrome-extension/icons/generate-icons.html in a browser');
console.log('  2. Click "Download All Icons" to save the PNG files');
console.log('  3. Move the downloaded files to the icons folder');
console.log('');
console.log('OPTION 2 - Use an online tool:');
console.log('  1. Go to https://www.canva.com or similar');
console.log('  2. Create a 128x128 icon with:');
console.log('     - Purple to cyan gradient background (#8b5cf6 to #06b6d4)');
console.log('     - Rounded corners');
console.log('     - White "S" or brain icon in center');
console.log('  3. Export at 16, 32, 48, and 128 pixels');
console.log('');
console.log('OPTION 3 - Placeholder icons:');
console.log('  Creating simple placeholder files...');

// Create placeholder files to prevent extension load errors
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = path.join(__dirname, filename);

  // Create a tiny valid PNG (1x1 purple pixel, scaled by browser)
  // This is a valid minimal PNG with a purple pixel
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width
    0x00, 0x00, 0x00, 0x01, // height
    0x08, 0x02,             // bit depth, color type (RGB)
    0x00, 0x00, 0x00,       // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0x90, // compressed data (purple-ish)
    0x5C, 0xF4, 0x00, 0x00,
    0x00, 0xE5, 0x00, 0xC1,
    0xBD, 0xB3, 0x19, 0x6E, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);

  fs.writeFileSync(filepath, minimalPNG);
  console.log(`  Created placeholder: ${filename}`);
});

console.log('\nPlaceholder icons created!');
console.log('Replace these with proper icons before publishing to Chrome Web Store.');
