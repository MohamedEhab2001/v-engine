// Time passage presets (spec §6–§9, §41): centralized style → sound
// behavior. Never hard-code this inside JSX.

import type { TimePassageSound, TimePassageStyle } from "../schema/video";

export type TimePassagePreset = {
  sound: TimePassageSound;
};

export const timePassagePresets: Record<TimePassageStyle, TimePassagePreset> = {
  minimal: {
    sound: "swoosh",
  },
  clock: {
    sound: "clock",
  },
  calendar: {
    sound: "swoosh",
  },
};
