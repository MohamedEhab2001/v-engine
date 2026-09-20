// Generates a placeholder sample image (PNG, no dependencies) in
// public/images. Replace it with real production media any time — the
// content file only references the path.
//
// Run with: node scripts/make-sample-image.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = join(projectRoot, "public", "images");
mkdirSync(imagesDir, { recursive: true });

const WIDTH = 1080;
const HEIGHT = 1080;

// simple deterministic gradient with soft circles
const pixel = (x, y) => {
  const diag = (x / WIDTH + y / HEIGHT) / 2;
  let r = 18 + diag * 26;
  let g = 20 + diag * 18;
  let b = 38 + diag * 44;

  const circles = [
    { cx: 360, cy: 380, radius: 210, cr: 255, cg: 213, cb: 74, alpha: 0.85 },
    { cx: 760, cy: 640, radius: 150, cr: 120, cg: 170, cb: 255, alpha: 0.55 },
    { cx: 560, cy: 880, radius: 90, cr: 255, cg: 120, cb: 140, alpha: 0.45 },
  ];

  for (const c of circles) {
    const d = Math.hypot(x - c.cx, y - c.cy);
    if (d < c.radius) {
      const edge = Math.min(1, (c.radius - d) / 40);
      const a = c.alpha * edge;
      r = r * (1 - a) + c.cr * a;
      g = g * (1 - a) + c.cg * a;
      b = b * (1 - a) + c.cb * a;
    }
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
};

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

const crc32 = (buffer) => {
  let crc = -1;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc(HEIGHT * (1 + WIDTH * 3));
for (let y = 0; y < HEIGHT; y++) {
  const rowStart = y * (1 + WIDTH * 3);
  raw[rowStart] = 0; // filter: none
  for (let x = 0; x < WIDTH; x++) {
    const [r, g, b] = pixel(x, y);
    const offset = rowStart + 1 + x * 3;
    raw[offset] = r;
    raw[offset + 1] = g;
    raw[offset + 2] = b;
  }
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const file = join(imagesDir, "sample-image.png");
writeFileSync(file, png);
console.log(`wrote ${file} (${WIDTH}x${HEIGHT})`);
