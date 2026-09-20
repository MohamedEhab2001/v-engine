import type {
  GroupEventType,
  SoundPreset,
} from "../schema/video";

// Central audio presets (spec §27). Content files reference preset names,
// never file paths — swapping a sound file only touches this module.
export const audioPresets = {
  message: {
    src: "sounds/message-pop.wav",
    volume: 0.35,
  },

  "soft-message": {
    src: "sounds/soft-message.wav",
    volume: 0.22,
  },

  impact: {
    src: "sounds/impact.wav",
    volume: 0.5,
  },

  "soft-impact": {
    src: "sounds/soft-impact.wav",
    volume: 0.34,
  },

  "low-hit": {
    src: "sounds/low-hit.wav",
    volume: 0.32,
  },

  reveal: {
    src: "sounds/reveal.wav",
    volume: 0.4,
  },

  positive: {
    src: "sounds/positive.wav",
    volume: 0.32,
  },

  warning: {
    src: "sounds/warning.wav",
    volume: 0.26,
  },

  click: {
    src: "sounds/click.wav",
    volume: 0.2,
  },

  clock: {
    src: "sounds/clock.wav",
    volume: 0.25,
  },

  ring: {
    src: "sounds/ring.wav",
    volume: 0.28,
  },

  typing: {
    src: "sounds/typing.wav",
    volume: 0.12,
  },

  swoosh: {
    src: "sounds/swoosh.wav",
    volume: 0.35,
  },

  join: {
    src: "sounds/join.wav",
    volume: 0.3,
  },

  leave: {
    src: "sounds/leave.wav",
    volume: 0.28,
  },
};

// Screen transitions keep the swoosh subtle.
export const screenTransitionVolume = 0.22;

// Group-event semantic presets (spec §44): positive pops for joins, subtle
// low hits for exits — removed is noticeably stronger than left.
export const groupEventPresets: Record<
  GroupEventType,
  { sound: Exclude<SoundPreset, "none">; volume: number }
> = {
  joined: { sound: "positive", volume: 0.32 },
  added: { sound: "positive", volume: 0.32 },
  left: { sound: "low-hit", volume: 0.24 },
  removed: { sound: "low-hit", volume: 0.38 },
};
