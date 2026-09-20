// Counts pixels matching given target colors (with tolerance) in a PNG.
// usage: node scripts/probe-color.mjs <png> <r> <g> <b> [tolerance] [minY]
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const file = process.argv[2];
const tr = Number(process.argv[3]);
const tg = Number(process.argv[4]);
const tb = Number(process.argv[5]);
const tol = Number(process.argv[6] ?? 36);
const minY = Number(process.argv[7] ?? 0);

const buffer = readFileSync(file);
let offset = 8;
let width = 0;
let height = 0;
let colorType = 0;
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
let count = 0;
let minYFound = -1;
let maxYFound = -1;
for (let y = minY; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = y * stride + x * bpp;
    const dr = Math.abs(pixels[i] - tr);
    const dg = Math.abs(pixels[i + 1] - tg);
    const db = Math.abs(pixels[i + 2] - tb);
    if (dr < tol && dg < tol && db < tol) {
      count++;
      if (minYFound === -1) minYFound = y;
      maxYFound = y;
    }
  }
}
console.log(`${file}: ${count} px matching (${tr},${tg},${tb})±${tol} below y=${minY}; rows ${minYFound}-${maxYFound}`);
