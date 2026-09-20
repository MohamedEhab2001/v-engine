import React, { useMemo } from "react";
import { theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { measureWidth } from "../theme/text-fit";

// Phrase highlighting for Arabic text (spec §19).
//
// The text is split into segments at phrase boundaries only — never inside a
// word — so Arabic shaping and the original character order are preserved.
// Mixed-direction tokens (numbers, Latin) inside a segment stay intact and
// are handled by the browser's bidi algorithm.

export type TextSegment = {
  text: string;
  highlighted: boolean;
};

export type HighlightWord = {
  word: string;
  highlighted: boolean;
};

const buildSegments = (
  text: string,
  highlights: string[],
): TextSegment[] => {
  const matches: { start: number; end: number }[] = [];
  const foundPhrases = new Set<string>();

  for (const phrase of highlights) {
    if (!phrase) {
      continue;
    }
    let from = 0;
    for (;;) {
      const index = text.indexOf(phrase, from);
      if (index === -1) {
        break;
      }
      const end = index + phrase.length;
      const overlaps = matches.some(
        (match) => index < match.end && end > match.start,
      );
      if (!overlaps) {
        matches.push({ start: index, end });
        foundPhrases.add(phrase);
      }
      from = index + 1;
    }
  }

  for (const phrase of highlights) {
    if (phrase && !foundPhrases.has(phrase)) {
      console.warn(`Highlight phrase not found: "${phrase}" in "${text}"`);
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start), highlighted: false });
    }
    segments.push({
      text: text.slice(match.start, match.end),
      highlighted: true,
    });
    cursor = match.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments.length ? segments : [{ text, highlighted: false }];
};

const segmentsToWords = (segments: TextSegment[]): HighlightWord[] =>
  segments.flatMap((segment) =>
    segment.text
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => ({ word, highlighted: segment.highlighted })),
  );

const fontCss = (weight: number, size: number, family: string): string =>
  `${weight} ${size}px ${family}`;

const wrapWordsWithFlags = (
  words: HighlightWord[],
  font: string,
  maxWidth: number,
): HighlightWord[][] => {
  const lines: HighlightWord[][] = [];
  let current: HighlightWord[] = [];
  let currentText = "";

  for (const word of words) {
    const candidateText = currentText
      ? `${currentText} ${word.word}`
      : word.word;
    if (!currentText || measureWidth(candidateText, font) <= maxWidth) {
      current.push(word);
      currentText = candidateText;
    } else {
      lines.push(current);
      current = [word];
      currentText = word.word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
};

// Word-level fitting that keeps highlight flags, so a highlighted phrase
// stays highlighted even when it wraps across lines (used by the hook).
export const fitHighlightedText = (options: {
  text: string;
  highlights?: string[];
  maxWidth: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  minFontSize: number;
  maxLines: number;
}): {
  lines: HighlightWord[][];
  fontSize: number;
  overflow: boolean;
} => {
  const { text, highlights, maxWidth, fontFamily, fontWeight, fontSize, minFontSize, maxLines } =
    options;

  const words = segmentsToWords(buildSegments(text, highlights ?? []));

  let size = fontSize;
  let lines = wrapWordsWithFlags(
    words,
    fontCss(fontWeight, size, fontFamily),
    maxWidth,
  );

  while (lines.length > maxLines && size > minFontSize) {
    size -= 2;
    lines = wrapWordsWithFlags(
      words,
      fontCss(fontWeight, size, fontFamily),
      maxWidth,
    );
  }

  return { lines, fontSize: size, overflow: lines.length > maxLines };
};

// Renders a single logical line with phrase highlights (used by MessageLine).
export const HighlightText: React.FC<{
  text: string;
  highlights?: string[];
  color?: string;
}> = ({ text, highlights, color }) => {
  const segments = useMemo(
    () => buildSegments(text, highlights ?? []),
    [text, highlights],
  );

  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <span
            key={index}
            style={{
              color: color ?? theme.highlightColor,
              fontWeight: typography.emphasisWeight,
              fontSize: "1.06em",
            }}
          >
            {segment.text}
          </span>
        ) : (
          <React.Fragment key={index}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
};

// Word renderer for pre-fitted highlighted lines (used by the hook).
export const HighlightWords: React.FC<{
  words: HighlightWord[];
  color?: string;
}> = ({ words, color }) => {
  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          {index > 0 ? " " : null}
          {word.highlighted ? (
            <span style={{ color: color ?? theme.highlightColor }}>
              {word.word}
            </span>
          ) : (
            word.word
          )}
        </React.Fragment>
      ))}
    </>
  );
};
