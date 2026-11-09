import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // Generate image data (raw uncompressed scanlines: 1 filter byte + 4*width bytes per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  // Safe zone for maskable vs standard
  const padding = isMaskable ? Math.floor(width * 0.15) : Math.floor(width * 0.05);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Dark slate background: #020617 to #0f172a
      let r = 2;
      let g = 6;
      let b = 23;
      let a = 255;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Soft vignette background
      const grad = Math.min(1, dist / (width * 0.7));
      r = Math.floor(2 + (15 - 2) * grad);
      g = Math.floor(6 + (23 - 6) * grad);
      b = Math.floor(23 + (42 - 23) * grad);

      // Grid line pattern
      const gridInterval = Math.max(12, Math.floor(width / 16));
      if (x % gridInterval === 0 || y % gridInterval === 0) {
        r = Math.min(255, r + 15);
        g = Math.min(255, g + 25);
        b = Math.min(255, b + 35);
      }

      // Draw Snake Body segments (curving path inside safe bounds)
      // Central icon geometry scaled to width
      const scale = (width - padding * 2) / 360;
      const sx = (x - padding) / scale;
      const sy = (y - padding) / scale;

      // Snake body tiles
      const inSegment = (px, py, pw, ph) => (sx >= px && sx <= px + pw && sy >= py && sy <= py + ph);

      // Segments
      if (inSegment(80, 200, 40, 40) || inSegment(120, 200, 40, 40) ||
          inSegment(160, 200, 40, 40) || inSegment(160, 160, 40, 40) ||
          inSegment(200, 160, 40, 40) || inSegment(240, 160, 40, 40)) {
        // Emerald body
        r = 16;
        g = 185;
        b = 129;
      }

      // Snake Head (Turtle shape)
      if (inSegment(280, 155, 48, 50)) {
        // Bright emerald green
        r = 52;
        g = 211;
        b = 153;

        // Turtle eyes
        if ((sx >= 305 && sx <= 315 && sy >= 165 && sy <= 175) ||
            (sx >= 305 && sx <= 315 && sy >= 185 && sy <= 195)) {
          r = 2;
          g = 6;
          b = 23;
        }
      }

      // Red food target (Apple circle at 280, 260)
      const fdx = sx - 280;
      const fdy = sy - 260;
      const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
      if (fdist <= 22) {
        r = 239;
        g = 68;
        b = 68;
        if (fdist <= 6 && fdx < 0 && fdy < 0) {
          // Highlight
          r = 255;
          g = 200;
          b = 200;
        }
      }

      // Border glow
      if (!isMaskable) {
        const cornerR = width * 0.18;
        // Keep within rounded rectangle if desired or square
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('Successfully generated all PWA PNG icons!');
