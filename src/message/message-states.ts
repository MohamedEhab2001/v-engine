// Centralized message state presets + the pure presentation resolver
// (spec §15, §29, §46–§48). The content JSON describes meaning; this module
// converts meaning into sound, animation, weight, accent, and timing
// multipliers. Never hard-code state behavior inside JSX.

import type {
  AnimationPreset,
  DiscordMessageData,
  MessageAccent,
  MessageState,
  SoundPreset,
} from "../schema/video";

export type MessageStatePreset = {
  sound: SoundPreset;
  animation: AnimationPreset;
  fontWeight?: number;
  accent?: MessageAccent;
  pauseBeforeMultiplier?: number;
  holdAfterMultiplier?: number;
};

export const messageStatePresets: Record<MessageState, MessageStatePreset> = {
  normal: {
    sound: "message",
    animation: "normal",
    holdAfterMultiplier: 1,
  },

  question: {
    sound: "soft-message",
    animation: "normal",
    holdAfterMultiplier: 1.15,
  },

  important: {
    sound: "soft-impact",
    animation: "punch",
    fontWeight: 700,
    holdAfterMultiplier: 1.25,
  },

  shock: {
    sound: "impact",
    animation: "punch",
    fontWeight: 700,
    holdAfterMultiplier: 1.35,
  },

  angry: {
    sound: "low-hit",
    animation: "tiny-shake",
    fontWeight: 700,
    holdAfterMultiplier: 1.2,
  },

  sarcastic: {
    sound: "click",
    animation: "soft",
    holdAfterMultiplier: 1.35,
  },

  hesitant: {
    sound: "soft-message",
    animation: "slow-reveal",
    pauseBeforeMultiplier: 1.4,
    holdAfterMultiplier: 1.2,
  },

  reveal: {
    sound: "reveal",
    animation: "reveal",
    fontWeight: 700,
    pauseBeforeMultiplier: 1.5,
    holdAfterMultiplier: 1.45,
  },

  warning: {
    sound: "warning",
    animation: "punch",
    accent: "warning",
    holdAfterMultiplier: 1.25,
  },

  "good-news": {
    sound: "positive",
    animation: "positive",
    accent: "positive",
    holdAfterMultiplier: 1.2,
  },

  "bad-news": {
    sound: "low-hit",
    animation: "slow-reveal",
    accent: "negative",
    holdAfterMultiplier: 1.4,
  },
};

export type ResolvedMessagePresentation = {
  state: MessageState;
  sound: SoundPreset;
  animation: AnimationPreset;
  fontWeight: number;
  accent: MessageAccent;
  pauseBeforeMultiplier: number;
  holdAfterMultiplier: number;
};

const DEFAULT_MESSAGE_WEIGHT = 600;

// Resolution priority (spec §46): explicit override → state preset → normal.
export const resolveMessagePresentation = (
  message: DiscordMessageData,
): ResolvedMessagePresentation => {
  let state: MessageState = "normal";
  if (message.state) {
    if (messageStatePresets[message.state]) {
      state = message.state;
    } else {
      // Unknown states never crash rendering (spec §48).
      console.warn(
        `[validation] Unknown message state "${message.state}" — falling back to "normal"`,
      );
    }
  }

  const preset = messageStatePresets[state];

  const soundOverride = message.effects?.sound;
  const animationOverride = message.effects?.animation;

  return {
    state,
    sound:
      soundOverride && soundOverride !== "auto"
        ? soundOverride
        : preset.sound,
    animation:
      animationOverride && animationOverride !== "auto"
        ? animationOverride
        : preset.animation,
    fontWeight: preset.fontWeight ?? DEFAULT_MESSAGE_WEIGHT,
    accent: preset.accent ?? "none",
    pauseBeforeMultiplier: preset.pauseBeforeMultiplier ?? 1,
    holdAfterMultiplier: preset.holdAfterMultiplier ?? 1,
  };
};
