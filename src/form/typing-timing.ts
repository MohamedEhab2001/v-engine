// Deterministic typing timing (spec §21–§22, §32). Natural-feeling
// variation derived purely from character index + code point — no
// Math.random anywhere; the same answer always types identically.

import type { MessageState } from "../schema/video";

const SOFT_PUNCTUATION = ",،؛";
const STRONG_PUNCTUATION = ".؟?!…";

const baseDelay = (char: string, index: number): number => {
  if (char === " ") {
    return 1;
  }
  if (SOFT_PUNCTUATION.includes(char)) {
    return 3 + ((index * 3) % 3); // 3–5
  }
  if (STRONG_PUNCTUATION.includes(char)) {
    return 4 + ((index * 5) % 4); // 4–7
  }
  return 1 + ((index + char.charCodeAt(0)) % 2); // 1–2
};

// State + style typing speed multipliers (spec §30).
export const typingSpeedMultiplier = (
  typingStyle?: "natural" | "fast" | "slow",
  state?: MessageState,
): number => {
  const styleMult =
    typingStyle === "fast" ? 0.6 : typingStyle === "slow" ? 1.6 : 1;
  const stateMult =
    state === "hesitant"
      ? 1.35
      : state === "sarcastic"
        ? 1.25
        : state === "angry"
          ? 0.8
          : state === "reveal"
            ? 1.1
            : 1;
  return styleMult * stateMult;
};

const chars = (text: string): string[] => Array.from(text);

export const computeTypingDuration = (
  answer: string,
  typingStyle?: "natural" | "fast" | "slow",
  state?: MessageState,
): number => {
  const mult = typingSpeedMultiplier(typingStyle, state);
  return chars(answer).reduce(
    (sum, char, index) => sum + baseDelay(char, index) * mult,
    0,
  );
};

/** How many characters of `answer` are visible after `elapsedFrames`. */
export const typedTextAt = (
  answer: string,
  elapsedFrames: number,
  typingStyle?: "natural" | "fast" | "slow",
  state?: MessageState,
): string => {
  const mult = typingSpeedMultiplier(typingStyle, state);
  const list = chars(answer);
  let clock = 0;
  let count = 0;
  for (let i = 0; i < list.length; i++) {
    clock += baseDelay(list[i], i) * mult;
    if (clock <= elapsedFrames) {
      count = i + 1;
    } else {
      break;
    }
  }
  return list.slice(0, count).join("");
};

/** Extra suspense frames before an answer starts (spec §30). */
export const typingPauseBefore = (state?: MessageState): number =>
  state === "reveal" ? 10 : state === "hesitant" ? 6 : 0;
