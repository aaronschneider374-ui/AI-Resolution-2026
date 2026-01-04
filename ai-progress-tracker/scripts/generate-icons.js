#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Generate PWA icons from SVG
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG content for the icon (simple version without emoji for better compatibility)
const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <text x="256" y="340" font-size="240" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">AI</text>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), simpleSvg);

  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);

    try {
      await sharp(Buffer.from(simpleSvg))
        .resize(size, size)
        .png()
        .toFile(filepath);

      console.log(`✓ Created ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to create ${filename}:`, error.message);
    }
  }

  // Also create favicon.ico equivalent
  try {
    await sharp(Buffer.from(simpleSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(iconsDir, 'favicon.png'));
    console.log('✓ Created favicon.png');
  } catch (error) {
    console.error('✗ Failed to create favicon.png:', error.message);
  }

  console.log('\nIcon generation complete!');
}

generateIcons().catch(console.error);
