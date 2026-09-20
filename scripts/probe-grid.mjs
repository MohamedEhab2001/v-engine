// Prints a coarse average-color grid of a PNG (default 12 cols x 21 rows).
// usage: node scripts/probe-grid.mjs <png> [cols] [rows]
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const file = process.argv[2];
const COLS = Number(process.argv[3] ?? 12);
const ROWS = Number(process.argv[4] ?? 21);

const buffer = readFileSync(file);
let offset = 8;
let width = 0, height = 0, colorType = 0;
const idat = [];
while (offset < buffer.length) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.toString("ascii", offset + 4, offset + 8);
  const data = buffer.subarray(offset + 8, offset + 8 + length);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    colorType = data[9];
  } else if (type === "IDAT") idat.push(data);
  else if (type === "IEND") break;
  offset += 12 + length;
}
const bpp = colorType === 6 ? 4 : 3;
const raw = inflateSync(Buffer.concat(idat));
const stride = width * bpp;
const pixels = Buffer.alloc(height * stride);
let p = 0;
for (let y = 0; y < height; y++) {
  const filter = raw[p++];
  for (let x = 0; x < stride; x++) {
    const v = raw[p++];
    const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
    const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
    const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0;
    let r;
    if (filter === 0) r = v;
    else if (filter === 1) r = v + left;
    else if (filter === 2) r = v + up;
    else if (filter === 3) r = v + ((left + up) >> 1);
    else {
      const paeth = left + up - upLeft;
      const pa = Math.abs(paeth - left), pb = Math.abs(paeth - up), pc = Math.abs(paeth - upLeft);
      r = v + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
    }
    pixels[y * stride + x] = r & 0xff;
  }
}

const cellW = Math.floor(width / COLS);
const cellH = Math.floor(height / ROWS);
const lines = [`${file}: ${width}x${height} grid ${COLS}x${ROWS} (each cell avg RGB)`];
for (let row = 0; row < ROWS; row++) {
  const parts = [];
  for (let col = 0; col < COLS; col++) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = row * cellH; y < (row + 1) * cellH; y += 4) {
      for (let x = col * cellW; x < (col + 1) * cellW; x += 4) {
        const i = y * stride + x * bpp;
        r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; n++;
      }
    }
    parts.push(`${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)}`.padStart(11));
  }
  lines.push(`y${String(row * cellH).padStart(4)}: ${parts.join("")}`);
}
console.log(lines.join("\n"));
