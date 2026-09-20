// Message lifecycle compiler (spec §3–§13, §46): typing phases, reply
// context, and after-actions (reactions / edits / deletes) with their
// frames. Pure — no React, no ad-hoc timing inside JSX.

import type {
  DiscordMessageData,
  MessageAfterAction,
  MessageState,
} from "../schema/video";
import type { ResolvedMessagePresentation } from "./message-states";

export type TypingPhase = {
  /** Absolute frames: full indicator span (including interruption gap). */
  start: number;
  end: number;
  style: "dots" | "label";
  interrupted: boolean;
  /** Interrupted typing: indicator hidden during [gapStart, gapEnd). */
  gapStart: number;
  gapEnd: number;
};

export type CompiledAfterAction = {
  action: MessageAfterAction;
  /** Absolute frame the action fires. */
  at: number;
  /** Reactions: resolved name of the person who reacted. */
  fromName: string | null;
};

// State-based typing defaults (spec §8) — used when the action omits a
// duration. Inference for messages WITHOUT an explicit typing action is
// off by default so existing stories keep their timing.
const defaultTypingFrames = (state?: MessageState): number => {
  if (state === "reveal" || state === "bad-news") {
    return 30;
  }
  if (state === "hesitant") {
    return 24;
  }
  return 18;
};

export const getTypingDuration = (
  message: DiscordMessageData,
  presentation: ResolvedMessagePresentation,
): number | null => {
  const action = message.lifecycle?.before?.find((a) => a.type === "typing");
  if (!action) {
    return null;
  }
  const base = action.durationFrames ?? defaultTypingFrames(presentation.state);
  // Interruption adds the stop-silence-restart phase (spec §7).
  return action.interrupted ? Math.round(base * 1.4) : base;
};

export const buildTypingPhase = (
  action: { style?: "dots" | "label"; interrupted?: boolean } | undefined,
  duration: number,
  start: number,
): TypingPhase => {
  const interrupted = action?.interrupted ?? false;
  const gapLength = interrupted ? Math.max(6, Math.round(duration * 0.2)) : 0;
  const firstPhase = Math.round(duration * 0.45);
  return {
    start,
    end: start + duration,
    style: action?.style ?? "dots",
    interrupted,
    gapStart: start + firstPhase,
    gapEnd: start + firstPhase + gapLength,
  };
};

// After-action default delays (spec examples) and durations.
export const afterActionDelay = (action: MessageAfterAction): number => {
  if (action.type === "reaction") {
    return action.delayFrames ?? 15;
  }
  if (action.type === "edit") {
    return action.delayFrames ?? 25;
  }
  return action.delayFrames ?? 30;
};

export const AFTER_ACTION_FRAMES = 8;
