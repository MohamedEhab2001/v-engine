import { Easing, interpolate } from "remotion";
import { timing } from "./timings";

// Reusable animation presets (migration spec §8, §14, §24, §32). All motion
// is frame-based, deterministic, and flows through the helpers below —
// components never re-implement interpolation.

const clampBoth = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = { easing: Easing.out(Easing.cubic) };
const easeIn = { easing: Easing.in(Easing.cubic) };

// ---- Message line reveal (spec §14) ----

export const messageEnterPreset = {
  translateY: 10,
  scaleFrom: 0.99,
  durationFrames: timing.messageEnterFrames,
};

export const getFadeIn = (
  frame: number,
  startFrame: number,
  duration: number,
): number =>
  interpolate(frame - startFrame, [0, duration], [0, 1], {
    ...clampBoth,
    ...easeOut,
  });

export const getSlideUp = (
  frame: number,
  startFrame: number,
  duration: number,
  distance: number,
): number =>
  interpolate(frame - startFrame, [0, duration], [distance, 0], {
    ...clampBoth,
    ...easeOut,
  });

export const getEnterScale = (
  frame: number,
  startFrame: number,
  duration: number,
  scaleFrom: number,
): number =>
  interpolate(frame - startFrame, [0, duration], [scaleFrom, 1], {
    ...clampBoth,
    ...easeOut,
  });

// ---- Emphasis punch (fix spec §11): 1 → 1.035 → 1 over 6–9 frames ----

export const emphasisPunchPreset = {
  peakScale: 1.035,
  peakFrame: 3,
  settleFrame: 8,
};

export const getPunchScale = (frame: number, startFrame: number): number =>
  interpolate(
    frame - startFrame,
    [0, emphasisPunchPreset.peakFrame, emphasisPunchPreset.settleFrame],
    [1, emphasisPunchPreset.peakScale, 1],
    { ...clampBoth, easing: Easing.out(Easing.quad) },
  );

// ---- Screen transitions (fix spec §4) ----
// Outgoing: opacity 1 → 0, translateY 0 → -20px.
// Incoming: opacity 0 → 1, translateY 20px → 0.
// The next screen starts entering while the previous one exits, so there is
// never a completely empty chat area between screens.

export const screenTransitionPreset = {
  enterTranslateY: 20,
  exitTranslateY: -20,
};

export const getScreenEnterOpacity = (
  frame: number,
  startFrame: number,
  enterFrames: number,
): number =>
  interpolate(frame - startFrame, [0, enterFrames], [0, 1], {
    ...clampBoth,
    ...easeOut,
  });

export const getScreenEnterTranslateY = (
  frame: number,
  startFrame: number,
  enterFrames: number,
): number =>
  interpolate(
    frame - startFrame,
    [0, enterFrames],
    [screenTransitionPreset.enterTranslateY, 0],
    { ...clampBoth, ...easeOut },
  );

export const getScreenExitOpacity = (
  frame: number,
  endFrame: number,
  exitFrames: number,
): number =>
  interpolate(
    frame - (endFrame - exitFrames),
    [0, exitFrames],
    [1, 0],
    { ...clampBoth, ...easeIn },
  );

export const getScreenExitTranslateY = (
  frame: number,
  endFrame: number,
  exitFrames: number,
): number =>
  interpolate(
    frame - (endFrame - exitFrames),
    [0, exitFrames],
    [0, screenTransitionPreset.exitTranslateY],
    { ...clampBoth, ...easeIn },
  );

// Optional settle-in scale for event screens (0.94 → 1).
export const getScreenScaleFrom = (
  frame: number,
  startFrame: number,
  scaleFrom: number,
  enterFrames: number,
): number =>
  interpolate(frame - startFrame, [0, enterFrames], [scaleFrom, 1], {
    ...clampBoth,
    ...easeOut,
  });

// ---- Composition ending (fix spec §1): the whole frame fades to black
// over the final frames — no empty Discord panel, no padding. The fade
// reaches full black one frame before the composition ends so the video
// never cuts from a half-visible frame. ----
export const getVideoEndFade = (
  frame: number,
  totalFrames: number,
  fadeFrames: number,
): number =>
  interpolate(
    frame - (totalFrames - fadeFrames - 1),
    [0, fadeFrames],
    [1, 0],
    { ...clampBoth, ...easeIn },
  );
