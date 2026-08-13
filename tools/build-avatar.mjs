#!/usr/bin/env node
// Rebuilds profile.jpg from a high-resolution source photo.
//
//   node tools/build-avatar.mjs [source-image]
//
// Auto-detects the flat background, crops to the subject with a little breathing
// room, then sharpens for the low pixel budget a terminal gives us. Not shipped
// to npm - it only exists so the avatar can be regenerated from a new photo.

import { Jimp, intToRGBA } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'profile.jpg');

// Only Kitty/iTerm2-class terminals use this resolution; the ANSI half-block
// fallback renders at ~40x100px no matter how large the source is. Override with
// AVATAR_WIDTH / AVATAR_QUALITY to trade file size against native-render sharpness.
// 448px matches a 44-column native render at 1:1 (~10px per cell), which is the
// widest this CLI ever draws the avatar.
const TARGET_WIDTH = Number(process.env.AVATAR_WIDTH) || 448;
const TARGET_RATIO = 3 / 4; // width : height
const PAD = 0.06;           // fraction of subject size kept as margin
const QUALITY = Number(process.env.AVATAR_QUALITY) || 80;

const source = process.argv[2] ?? OUT;
if (!fs.existsSync(source)) {
  console.error(`Source image not found: ${source}`);
  process.exit(1);
}

const img = await Jimp.read(source);
const { width: W, height: H } = img.bitmap;
console.log(`source        ${W}x${H}  (${(fs.statSync(source).size / 1024).toFixed(1)} KB)`);

// Learn the background colour from the corners, then find the subject's extent.
const corners = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]
  .map(([x, y]) => intToRGBA(img.getPixelColor(x, y)));
const bg = corners[0];
const isBackground = (p) =>
  Math.abs(p.r - bg.r) + Math.abs(p.g - bg.g) + Math.abs(p.b - bg.b) < 90;

let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y += 2) {
  for (let x = 0; x < W; x += 2) {
    if (!isBackground(intToRGBA(img.getPixelColor(x, y)))) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const detected = minX < maxX && minY < maxY;
console.log(
  detected
    ? `subject bbox  x ${minX}-${maxX}, y ${minY}-${maxY}  (trimming L${minX} R${W - maxX} T${minY} B${H - maxY})`
    : 'subject bbox  not detected, using full frame'
);

let cropX = 0, cropY = 0, cropW = W, cropH = H;

if (detected) {
  const padX = (maxX - minX) * PAD;
  const padY = (maxY - minY) * PAD;
  let x0 = Math.max(0, minX - padX);
  let y0 = Math.max(0, minY - padY);
  let x1 = Math.min(W, maxX + padX);
  let y1 = Math.min(H, maxY + padY);

  // Grow the shorter axis so the crop matches TARGET_RATIO without squashing.
  let w = x1 - x0;
  let h = y1 - y0;
  if (w / h > TARGET_RATIO) {
    const wanted = w / TARGET_RATIO;
    const grow = (wanted - h) / 2;
    y0 = Math.max(0, y0 - grow);
    y1 = Math.min(H, y1 + grow);
  } else {
    const wanted = h * TARGET_RATIO;
    const grow = (wanted - w) / 2;
    x0 = Math.max(0, x0 - grow);
    x1 = Math.min(W, x1 + grow);
  }

  cropX = Math.round(x0);
  cropY = Math.round(y0);
  cropW = Math.round(x1 - x0);
  cropH = Math.round(y1 - y0);
  img.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
  console.log(`cropped       ${cropW}x${cropH}`);
}

img.resize({ w: TARGET_WIDTH });
console.log(`resized       ${img.bitmap.width}x${img.bitmap.height}`);

// A terminal renders this at roughly 40x100 pixels, so a little extra contrast
// and edge definition survives the downscale far better than a soft image.
if (typeof img.contrast === 'function') img.contrast(0.08);
if (typeof img.convolute === 'function') {
  img.convolute([
    [0, -0.5, 0],
    [-0.5, 3, -0.5],
    [0, -0.5, 0],
  ]);
  console.log('sharpened     3x3 kernel, contrast +0.08');
}

const buffer = await img.getBuffer('image/jpeg', { quality: QUALITY });
fs.writeFileSync(OUT, buffer);
console.log(`written       ${OUT}  (${(buffer.length / 1024).toFixed(1)} KB)`);
