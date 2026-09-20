// Camera layer math (spec §26–§28): subtle, deterministic motion. Never
// zoom beyond readability, never move Arabic text outside the safe area,
// never stack strong effects. Pure functions of the frame.

import { interpolate } from "remotion";
import type { CameraPreset } from "../schema/video";

export type CameraState = {
  scale: number;
  translateX: number;
  translateY: number;
};

const IDENTITY: CameraState = { scale: 1, translateX: 0, translateY: 0 };

// The frame the camera reacts to (a reveal/shock message, or the last one).
export const getCameraKeyFrame = (
  enterFrames: number[],
  states: string[],
): number | null => {
  if (enterFrames.length === 0) {
    return null;
  }
  const intensity = ["reveal", "shock", "bad-news", "important", "payoff"];
  for (let i = 0; i < states.length; i++) {
    if (intensity.includes(states[i] ?? "")) {
      return enterFrames[i];
    }
  }
  return enterFrames[enterFrames.length - 1];
};

export const getCameraState = (
  preset: CameraPreset,
  frame: number,
  screenStart: number,
  screenEnd: number,
  keyFrame: number | null,
): CameraState => {
  switch (preset) {
    case "slow-push":
      return {
        ...IDENTITY,
        scale: interpolate(
          frame,
          [screenStart, screenEnd],
          [1, 1.015],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      };

    case "focus-message":
      return {
        scale: interpolate(
          frame,
          [screenStart, screenEnd],
          [1, 1.02],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        translateX: 0,
        translateY: interpolate(
          frame,
          [screenStart, screenEnd],
          [0, 10],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      };

    case "focus-attachment":
      return {
        scale: interpolate(
          frame,
          [screenStart, screenEnd],
          [1, 1.025],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        translateX: 0,
        translateY: interpolate(
          frame,
          [screenStart, screenEnd],
          [0, 16],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      };

    case "micro-punch": {
      if (keyFrame === null) {
        return IDENTITY;
      }
      return {
        ...IDENTITY,
        scale: interpolate(frame - keyFrame, [0, 3, 9], [1, 1.025, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      };
    }

    case "micro-shake": {
      if (keyFrame === null) {
        return IDENTITY;
      }
      return {
        ...IDENTITY,
        translateX: interpolate(
          frame - keyFrame,
          [0, 1, 2, 3, 4],
          [0, -2, 2, -1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      };
    }

    case "static":
    default:
      return IDENTITY;
  }
};
