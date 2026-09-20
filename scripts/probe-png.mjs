// Pixel probe for rendered frames: classifies pixels as "gold" (accent color)
// vs white and reports gold cluster bands. Used to verify highlight styling
// and media transitions at the pixel level.
//
// Run with: node scripts/probe-png.mjs out/frame.png

import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const file = process.argv[2];
if (!file) {
  console.error("usage: node probe-png.mjs <png>");
  process.exit(1);
}

const buffer = readFileSync(file);
if (buffer.readUInt32BE(0) !== 0x89504e47) {
  throw new Error("not a PNG");
}

let offset = 8;
let width = 0;
let height = 0;
let colorType = 0;
const idatChunks = [];

while (offset < buffer.length) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.toString("ascii", offset + 4, offset + 8);
  const data = buffer.subarray(offset + 8, offset + 8 + length);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    colorType = data[9];
  } else if (type === "IDAT") {
    idatChunks.push(data);
  } else if (type === "IEND") {
    break;
  }
  offset += 12 + length;
}

const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
if (bytesPerPixel === 0) {
  throw new Error(`unsupported color type ${colorType}`);
}

const raw = inflateSync(Buffer.concat(idatChunks));
const stride = width * bytesPerPixel;

// un-filter scanlines
const pixels = Buffer.alloc(height * stride);
let inputOffset = 0;
const getByte = (scanline, x) => {
  if (x < 0) return 0;
  return pixels[scanline * stride + x];
};

for (let y = 0; y < height; y++) {
  const filter = raw[inputOffset++];
  for (let x = 0; x < stride; x++) {
    const value = raw[inputOffset++];
    const left = getByte(y, x - bytesPerPixel);
    const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
    const upLeft =
      y > 0 ? pixels[(y - 1) * stride + x - bytesPerPixel] : 0;
    let result;
    switch (filter) {
      case 0:
        result = value;
        break;
      case 1:
        result = value + left;
        break;
      case 2:
        result = value + up;
        break;
      case 3:
        result = value + ((left + up) >> 1);
        break;
      case 4: {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const predictor =
          pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        result = value + predictor;
        break;
      }
      default:
        throw new Error(`unsupported filter ${filter}`);
    }
    pixels[y * stride + x] = result & 0xff;
  }
}

const rows = new Array(height).fill(0);
let whiteCount = 0;
const xByRow = new Array(height);

for (let y = 0; y < height; y++) {
  let minX = width;
  let maxX = -1;
  for (let x = 0; x < width; x++) {
    const i = y * stride + x * bytesPerPixel;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r > 180 && g > 130 && b < 130 && r - b > 60) {
      rows[y]++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    } else if (r > 220 && g > 220 && b > 220) {
      whiteCount++;
    }
  }
  xByRow[y] = rows[y] > 0 ? [minX, maxX] : null;
}

console.log(`${file}: ${width}x${height}, colorType ${colorType}`);
console.log(`white pixels: ${whiteCount}`);

let bandStart = -1;
let bandCount = 0;
let bandMinX = width;
let bandMaxX = -1;
for (let y = 0; y <= height; y++) {
  const inBand = y < height && rows[y] > 0;
  if (inBand) {
    if (bandStart === -1) {
      bandStart = y;
      bandCount = 0;
      bandMinX = width;
      bandMaxX = -1;
    }
    bandCount += rows[y];
    const [minX, maxX] = xByRow[y];
    bandMinX = Math.min(bandMinX, minX);
    bandMaxX = Math.max(bandMaxX, maxX);
  } else if (bandStart !== -1) {
    console.log(
      `gold band rows ${bandStart}-${y - 1}: x ${bandMinX}-${bandMaxX}, ${bandCount} px`,
    );
    bandStart = -1;
  }
}
