// Camera layer math (spec §26–§28): subtle, deterministic motion. Never
// zoom beyond readability, never move Arabic text outside the safe area,
// never stack strong effects. Pure functions of the frame.

import { Easing, interpolate } from "remotion";
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

// Deterministic "someone is holding this camera" idle sway — layered under
// every preset so even "static" never reads as a dead, locked-off frame.
// Two sine waves at different frequencies/phases keep X and Y from moving
// in lockstep; amplitude stays tiny so Arabic text never blurs or drifts
// out of the safe area.
const idleDrift = (frame: number): CameraState => ({
  scale: 1 + Math.sin(frame / 97) * 0.0015,
  translateX: Math.sin(frame / 61) * 1.5,
  translateY: Math.cos(frame / 83) * 1.2,
});

const withIdleDrift = (state: CameraState, frame: number): CameraState => {
  const drift = idleDrift(frame);
  return {
    scale: state.scale * drift.scale,
    translateX: state.translateX + drift.translateX,
    translateY: state.translateY + drift.translateY,
  };
};

const resolveCameraState = (
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

    case "channel-focus":
      // A slightly larger, slower push used for the channel-create reveal —
      // the sidebar icon and the centered card are both the point of
      // interest, so the push is a touch stronger than "slow-push".
      return {
        scale: interpolate(
          frame,
          [screenStart, screenEnd],
          [1, 1.03],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        translateX: interpolate(
          frame,
          [screenStart, screenEnd],
          [0, 4],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        translateY: interpolate(
          frame,
          [screenStart, screenEnd],
          [0, 8],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      };

    case "static":
    default:
      return IDENTITY;
  }
};

export const getCameraState = (
  preset: CameraPreset,
  frame: number,
  screenStart: number,
  screenEnd: number,
  keyFrame: number | null,
): CameraState =>
  withIdleDrift(
    resolveCameraState(preset, frame, screenStart, screenEnd, keyFrame),
    frame,
  );

// ---- Per-message zoom (schema: message.zoom) ----
// A deliberate push-in for the one line in a screen worth a camera
// reaction — ramps in, holds through the reading beat, eases back out.
// Composed ON TOP of whatever the screen's own camera state already is
// (multiplicative scale, additive translate), same pattern as idle drift,
// so it never replaces the screen's direction — it punctuates it.
export const MESSAGE_ZOOM_FRAMES = 46;

export const getMessageZoomState = (localFrame: number): CameraState => {
  if (localFrame < 0 || localFrame >= MESSAGE_ZOOM_FRAMES) {
    return IDENTITY;
  }
  const keyframes = [0, 10, 30, MESSAGE_ZOOM_FRAMES];
  const easing = { easing: Easing.out(Easing.cubic) };
  const clampBoth = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  return {
    scale: interpolate(localFrame, keyframes, [1, 1.09, 1.09, 1], { ...clampBoth, ...easing }),
    translateX: 0,
    translateY: interpolate(localFrame, keyframes, [0, 10, 10, 0], { ...clampBoth, ...easing }),
  };
};

export const composeCameraStates = (a: CameraState, b: CameraState): CameraState => ({
  scale: a.scale * b.scale,
  translateX: a.translateX + b.translateX,
  translateY: a.translateY + b.translateY,
});
