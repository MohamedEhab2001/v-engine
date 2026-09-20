// Deterministic text fitting (spec §11, §25).
// Greedy word-wrap driven by canvas measurement. The same input always
// produces the same lines and font size. When no DOM exists (running the
// timeline compiler in plain Node), an average-glyph-width estimate is used.

const FALLBACK_GLYPH_RATIO = 0.58;

let canvasCtx: CanvasRenderingContext2D | null = null;

const getCtx = (): CanvasRenderingContext2D | null => {
  if (typeof document === "undefined") {
    return null;
  }
  if (!canvasCtx) {
    const canvas = document.createElement("canvas");
    canvasCtx = canvas.getContext("2d");
  }
  return canvasCtx;
};

const fontCss = (weight: number, size: number, family: string): string =>
  `${weight} ${size}px ${family}`;

export const measureWidth = (text: string, font: string): number => {
  const ctx = getCtx();
  if (ctx) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }
  const match = /(\d+(?:\.\d+)?)px/.exec(font);
  const size = match ? Number(match[1]) : 48;
  return text.length * size * FALLBACK_GLYPH_RATIO;
};

export const wrapWords = (
  text: string,
  font: string,
  maxWidth: number,
): string[] => {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measureWidth(candidate, font) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
};

export type FittedText = {
  lines: string[];
  fontSize: number;
  overflow: boolean;
};

export const fitText = (options: {
  text: string;
  maxWidth: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  minFontSize: number;
  maxLines: number;
}): FittedText => {
  const { text, maxWidth, fontFamily, fontWeight, fontSize, minFontSize, maxLines } =
    options;

  let size = fontSize;
  let lines = wrapWords(text, fontCss(fontWeight, size, fontFamily), maxWidth);

  while (lines.length > maxLines && size > minFontSize) {
    size -= 2;
    lines = wrapWords(text, fontCss(fontWeight, size, fontFamily), maxWidth);
  }

  return { lines, fontSize: size, overflow: lines.length > maxLines };
};
