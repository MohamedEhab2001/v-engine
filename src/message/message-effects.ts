// Animation math for message entrance effects (spec §16–§26, §28).
// Every style is a pure function of the frame — deterministic, no DOM.

import { Easing, interpolate } from "remotion";
import type { AnimationPreset } from "../schema/video";
import { timing } from "../animation/timings";

export type MessageEffectStyle = {
  opacity: number;
  translateY: number;
  translateX: number;
  scale: number;
};

const clampBoth = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const outCubic = { easing: Easing.out(Easing.cubic) };
const outQuad = { easing: Easing.out(Easing.quad) };

// Tiny horizontal shake for the angry state (spec §20): 0, -3, +3, -2, 0
// AFTER the entrance lands.
const tinyShakeX = (localFrame: number, enterFrames: number): number => {
  const shakeStart = enterFrames + 1;
  return interpolate(
    localFrame,
    [shakeStart, shakeStart + 1, shakeStart + 2, shakeStart + 3, shakeStart + 4],
    [0, -3, 3, -2, 0],
    clampBoth,
  );
};

export const getMessageEffectStyle = (
  frame: number,
  startFrame: number,
  animation: AnimationPreset,
): MessageEffectStyle => {
  const local = frame - startFrame;
  const enter = timing.messageEnterFrames;

  switch (animation) {
    case "none":
      return { opacity: local >= 0 ? 1 : 0, translateY: 0, translateX: 0, scale: 1 };

    case "soft": {
      // Sarcastic: slightly slower, quieter entrance (spec §21).
      const duration = Math.round(enter * 1.5);
      return {
        opacity: interpolate(local, [0, duration], [0, 1], { ...clampBoth, easing: Easing.out(Easing.quad) }),
        translateY: interpolate(local, [0, duration], [4, 0], { ...clampBoth, ...outQuad }),
        translateX: 0,
        scale: 1,
      };
    }

    case "punch": {
      // Important / shock: normal entrance + a quick scale punch (spec §18–§19).
      const punch = interpolate(local, [0, 3, 9], [1, 1.04, 1], {
        ...clampBoth,
        easing: Easing.out(Easing.quad),
      });
      return {
        opacity: interpolate(local, [0, enter], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, enter], [8, 0], { ...clampBoth, ...outCubic }),
        translateX: 0,
        scale:
          interpolate(local, [0, enter], [0.99, 1], { ...clampBoth, ...outCubic }) *
          punch,
      };
    }

    case "tiny-shake": {
      // Angry: normal entrance, then a tiny horizontal shake (spec §20).
      return {
        opacity: interpolate(local, [0, enter], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, enter], [8, 0], { ...clampBoth, ...outCubic }),
        translateX: tinyShakeX(local, enter),
        scale: interpolate(local, [0, enter], [0.99, 1], { ...clampBoth, ...outCubic }),
      };
    }

    case "slow-reveal": {
      // Hesitant / bad-news: slow, quiet reveal (spec §22, §26).
      const duration = Math.round(enter * 2);
      return {
        opacity: interpolate(local, [0, duration], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, duration], [6, 0], { ...clampBoth, ...outCubic }),
        translateX: 0,
        scale: 1,
      };
    }

    case "reveal": {
      // Reveal: controlled, slightly ceremonious entrance (spec §23).
      const duration = Math.round(enter * 1.7);
      return {
        opacity: interpolate(local, [0, Math.round(duration * 0.7)], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, duration], [10, 0], { ...clampBoth, ...outCubic }),
        translateX: 0,
        scale: interpolate(local, [0, Math.round(duration * 0.6), duration], [0.96, 1.02, 1], {
          ...clampBoth,
          easing: Easing.out(Easing.quad),
        }),
      };
    }

    case "positive": {
      // Good news: subtle scale-up into place (spec §25).
      return {
        opacity: interpolate(local, [0, enter], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, enter], [8, 0], { ...clampBoth, ...outCubic }),
        translateX: 0,
        scale: interpolate(local, [0, enter + 2], [0.97, 1], { ...clampBoth, ...outCubic }),
      };
    }

    case "normal":
    default: {
      // Normal: fade + slide up + tiny scale (spec §16).
      return {
        opacity: interpolate(local, [0, enter], [0, 1], { ...clampBoth, ...outCubic }),
        translateY: interpolate(local, [0, enter], [8, 0], { ...clampBoth, ...outCubic }),
        translateX: 0,
        scale: interpolate(local, [0, enter], [0.99, 1], { ...clampBoth, ...outCubic }),
      };
    }
  }
};
