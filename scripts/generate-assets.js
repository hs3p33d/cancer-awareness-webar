import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function writeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // No filter
    rgbaBuffer.copy(rawData, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate Open Graph Image (1200 x 630)
function generateOGImage() {
  const w = 1200;
  const h = 630;
  const buf = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Dark background gradient
      const dy = y / h;
      let r = 10 + Math.round(dy * 12);
      let g = 10 + Math.round(dy * 12);
      let b = 15 + Math.round(dy * 20);

      // Radial purple / pink aura in top center
      const distFromCenter = Math.hypot(x - w / 2, y - h * 0.38);
      if (distFromCenter < 450) {
        const factor = (1 - distFromCenter / 450) ** 2;
        r = Math.min(255, r + Math.round(140 * factor));
        g = Math.min(255, g + Math.round(60 * factor));
        b = Math.min(255, b + Math.round(210 * factor));
      }

      // Outer border highlight
      if (x < 12 || x >= w - 12 || y < 12 || y >= h - 12) {
        r = Math.min(255, r + 40);
        g = Math.min(255, g + 30);
        b = Math.min(255, b + 60);
      }

      // Inner card container border
      if (
        (x >= 60 && x <= w - 60 && (y === 60 || y === h - 60)) ||
        (y >= 60 && y <= h - 60 && (x === 60 || x === w - 60))
      ) {
        r = Math.min(255, r + 60);
        g = Math.min(255, g + 40);
        b = Math.min(255, b + 90);
      }

      // Draw stylized ribbon shape (center-top loop)
      const rx = (x - w / 2) / 60;
      const ry = (y - 230) / 75;
      const ribbonDist = Math.hypot(rx, ry);
      if (ribbonDist > 0.55 && ribbonDist < 0.95 && y < 290) {
        r = 244;
        g = 114;
        b = 182;
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
  }

  return encodePNG(w, h, buf);
}

// Generate App Icon (Square with ribbon)
function generateSquareIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.46;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dist = Math.hypot(x - center, y - center);

      if (dist < radius) {
        // Dark metallic gradient
        const t = y / size;
        let r = 16 + Math.round(t * 18);
        let g = 14 + Math.round(t * 16);
        let b = 26 + Math.round(t * 30);

        // Subtle glow in center
        const glow = Math.max(0, 1 - dist / radius);
        r = Math.min(255, r + Math.round(80 * glow));
        g = Math.min(255, g + Math.round(40 * glow));
        b = Math.min(255, b + Math.round(130 * glow));

        // Ribbon loop in icon
        const rx = (x - center) / (size * 0.16);
        const ry = (y - center * 0.9) / (size * 0.22);
        const ribbonDist = Math.hypot(rx, ry);
        if (ribbonDist > 0.55 && ribbonDist < 0.95 && y < center * 1.25) {
          r = 244;
          g = 114;
          b = 182;
        }

        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = 255;
      } else {
        // Transparent outside circular / rounded area
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }

  return encodePNG(size, size, buf);
}

// Write files
const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'og-image.png'), generateOGImage());
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateSquareIcon(180));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generateSquareIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generateSquareIcon(512));

console.log('✅ Generated genuine high-resolution campaign assets:');
console.log(' - public/og-image.png (1200x630 OpenGraph card)');
console.log(' - public/apple-touch-icon.png (180x180)');
console.log(' - public/icon-192.png (192x192 PWA)');
console.log(' - public/icon-512.png (512x512 PWA)');
