// Story beat layer (spec §22–§25, §47): screen-level direction that shapes
// pacing, camera, and audio. Message states control single messages; a beat
// directs the whole screen. Never rewrites message content.

import type { CameraPreset, MessageScreen, StoryBeat } from "../schema/video";

export type StoryBeatPreset = {
  /** Multiplies gaps between messages inside the screen. */
  messageGapMultiplier: number;
  /** Multiplies the calculated reading hold. */
  readingHoldMultiplier: number;
  /** Camera preset used when the screen doesn't specify one. */
  camera: CameraPreset;
  /** Ambient bed volume multiplier (audio ducking, spec §34–§35). */
  ambienceMultiplier: number;
  /** Extra intentional silence before the last message (comedic punchline). */
  silenceBeforeLastMessageFrames: number;
};

export const storyBeatPresets: Record<StoryBeat, StoryBeatPreset> = {
  normal: {
    messageGapMultiplier: 1,
    readingHoldMultiplier: 1,
    camera: "static",
    ambienceMultiplier: 1,
    silenceBeforeLastMessageFrames: 0,
  },
  tension: {
    messageGapMultiplier: 1.15,
    readingHoldMultiplier: 1.15,
    camera: "slow-push",
    ambienceMultiplier: 0.8,
    silenceBeforeLastMessageFrames: 0,
  },
  "awkward-pause": {
    messageGapMultiplier: 1.35,
    readingHoldMultiplier: 1.3,
    camera: "static",
    ambienceMultiplier: 0.1,
    silenceBeforeLastMessageFrames: 0,
  },
  reveal: {
    messageGapMultiplier: 1.1,
    readingHoldMultiplier: 1.35,
    camera: "slow-push",
    ambienceMultiplier: 0.15,
    silenceBeforeLastMessageFrames: 0,
  },
  shock: {
    messageGapMultiplier: 0.95,
    readingHoldMultiplier: 1.2,
    camera: "micro-punch",
    ambienceMultiplier: 0.3,
    silenceBeforeLastMessageFrames: 0,
  },
  conflict: {
    messageGapMultiplier: 0.85,
    readingHoldMultiplier: 1,
    camera: "slow-push",
    ambienceMultiplier: 0.6,
    silenceBeforeLastMessageFrames: 0,
  },
  relief: {
    messageGapMultiplier: 0.95,
    readingHoldMultiplier: 1,
    camera: "static",
    ambienceMultiplier: 1,
    silenceBeforeLastMessageFrames: 0,
  },
  payoff: {
    messageGapMultiplier: 1,
    readingHoldMultiplier: 1.4,
    camera: "micro-punch",
    ambienceMultiplier: 0.4,
    silenceBeforeLastMessageFrames: 0,
  },
  sad: {
    messageGapMultiplier: 1.3,
    readingHoldMultiplier: 1.3,
    camera: "slow-push",
    ambienceMultiplier: 0.3,
    silenceBeforeLastMessageFrames: 0,
  },
  comedic: {
    messageGapMultiplier: 1.1,
    readingHoldMultiplier: 1.25,
    camera: "static",
    ambienceMultiplier: 0.5,
    silenceBeforeLastMessageFrames: 12,
  },
};

export type ResolvedStoryBeat = StoryBeatPreset & { beat: StoryBeat };

// Resolution order (spec §38): explicit screen camera → beat preset → static.
export const resolveStoryBeat = (screen: MessageScreen): ResolvedStoryBeat => {
  const beat: StoryBeat = screen.beat ?? "normal";
  const preset = storyBeatPresets[beat];
  const camera: CameraPreset =
    !screen.camera || screen.camera === "auto"
      ? preset.camera
      : screen.camera;
  return { beat, ...preset, camera };
};
