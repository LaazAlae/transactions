// Simple script to create basic PWA icons
// In production, you should use proper icon generation tools

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create basic SVG icon content
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1d4ed8" rx="${size * 0.1}"/>
  <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" fill="white" rx="${size * 0.05}"/>
  <text x="${size * 0.5}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.3}" fill="#1d4ed8" text-anchor="middle" font-weight="bold">B</text>
</svg>
`;

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent.trim());
  console.log(`Generated icon-${size}x${size}.svg`);
});

console.log('Icon generation complete. For production, convert SVGs to PNG using a proper tool.');