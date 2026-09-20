// Audio direction (spec §29–§35, §49): combines beat + explicit overrides
// into the ambient-bed behavior. UI sounds and story impacts stay in the
// soundtrack; this module owns ambience volume and ducking.

import type { CompiledScreen } from "../compiler/compile-screens";
import type { MessageScreen } from "../schema/video";
import { getScreenEnterOpacity, getScreenExitOpacity } from "../animation/presets";
import { resolveStoryBeat } from "./story-beats";

export type AudioDirection = {
  /** Ambient volume multiplier for this screen. */
  ambienceMultiplier: number;
};

export const resolveAudioDirection = (
  screen: CompiledScreen["screen"],
): AudioDirection => ({
  ambienceMultiplier:
    screen.type === "messages"
      ? resolveStoryBeat(screen as MessageScreen).ambienceMultiplier
      : 1,
});

// Deterministic per-frame ambience volume with smooth ducking across screen
// transitions (each visible screen contributes weighted by its transition
// opacity, so the bed dips and recovers naturally).
export const ambienceVolumeAt = (
  screens: CompiledScreen[],
  baseVolume: number,
  frame: number,
): number => {
  let volume = 0;
  for (const screen of screens) {
    if (frame < screen.startFrame || frame >= screen.endFrame) {
      continue;
    }
    const weight = Math.max(
      getScreenEnterOpacity(frame, screen.startFrame, screen.enterFrames),
      getScreenExitOpacity(frame, screen.endFrame, screen.exitFrames),
    );
    volume = Math.max(
      volume,
      baseVolume * resolveAudioDirection(screen.screen).ambienceMultiplier * weight,
    );
  }
  return volume;
};
