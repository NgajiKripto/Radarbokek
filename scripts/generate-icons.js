#!/usr/bin/env node
/**
 * Generate PWA icons: 192x192 and 512x512 PNG
 * Pure Node.js — no external dependencies
 * Creates solid-background square icons with "RB" text
 */
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { createHash } from 'crypto';

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function generateIcon(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);   // width
  ihdrData.writeUInt32BE(size, 4);   // height
  ihdrData[8] = 8;                    // bit depth
  ihdrData[9] = 2;                    // color type: RGB
  ihdrData[10] = 0;                   // compression
  ihdrData[11] = 0;                   // filter
  ihdrData[12] = 0;                   // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Generate pixel data: chili-red (#FF5733) background with center circle
  const rawData = Buffer.alloc(size * (1 + size * 3)); // filter byte + RGB per row
  const centerX = size / 2;
  const centerY = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.3;
  const smallR = size * 0.14;
  const dotR = size * 0.06;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 3);
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 3;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default: chili red background
      let r = 0xFF, g = 0x57, b = 0x33;

      // White rings and elements
      const isOuterRing = Math.abs(dist - outerR) < size * 0.03;
      const isInnerRing = Math.abs(dist - innerR) < size * 0.025;
      const isMiddleRing = Math.abs(dist - (outerR + innerR) / 2) < size * 0.02;
      const isCenterDot = dist < dotR;
      const isSmallCircle = dist < smallR;

      // Thin rings for radar effect
      if (isOuterRing || isInnerRing || isMiddleRing) {
        r = 0xFF; g = 0xFF; b = 0xFF;
      }

      // Center dot
      if (isCenterDot) {
        r = 0xFF; g = 0xFF; b = 0xFF;
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  // IDAT
  const compressed = deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

writeFileSync('public/icons/icon-192.png', icon192);
writeFileSync('public/icons/icon-512.png', icon512);

console.log(`Generated icon-192.png (${icon192.length} bytes)`);
console.log(`Generated icon-512.png (${icon512.length} bytes)`);
