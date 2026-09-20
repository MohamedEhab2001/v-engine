// Message timing inside one screen + the calculated reading hold.
// Lifecycle-aware (spec §3–§13, §30): typing indicators delay the message
// enter; after-actions extend the screen; story beats scale pacing.
// Pure functions — testable outside React.

import type {
  DiscordMessageData,
  MessageScreen,
} from "../schema/video";
import { timing } from "../animation/timings";
import {
  resolveMessagePresentation,
  type ResolvedMessagePresentation,
} from "./message-states";
import {
  afterActionDelay,
  AFTER_ACTION_FRAMES,
  buildTypingPhase,
  getTypingDuration,
} from "./message-lifecycle";
import type { CompiledAfterAction, TypingPhase } from "./message-lifecycle";
import type { ResolvedStoryBeat } from "./story-beats";

export type TimedMessage = {
  message: DiscordMessageData;
  presentation: ResolvedMessagePresentation;
  /** Typing begins (== enterFrame when there is no typing action). */
  startFrame: number;
  /** The message itself reveals (after typing). */
  enterFrame: number;
  typing: TypingPhase | null;
  /** Reply context resolved for rendering. */
  reply: { speakerName: string; previewText: string } | null;
  afterActions: CompiledAfterAction[];
};

export type MessageScreenTiming = {
  timedMessages: TimedMessage[];
  readingHold: number;
  /** Content fully settled (relative to screen start), incl. after-actions. */
  contentEnd: number;
};

export const countWords = (text: string): number =>
  text.split(/\s+/).filter((word) => word.length > 0).length;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const baseReadingHold = (messages: DiscordMessageData[]): number => {
  const words = messages.reduce(
    (sum, message) => sum + countWords(message.text),
    0,
  );
  const multiplier = Math.max(
    1,
    ...messages.map(
      (message) => resolveMessagePresentation(message).holdAfterMultiplier,
    ),
  );
  return Math.round(
    clamp(
      words * timing.readingFramesPerWord * multiplier +
        timing.normalHoldAfterAppearFrames,
      timing.screenMinimumReadingHoldFrames,
      timing.screenMaximumReadingHoldFrames,
    ),
  );
};

export const computeMessageScreenTiming = (
  screen: MessageScreen,
  beat: ResolvedStoryBeat,
  resolveSpeakerName: (key: string) => string,
): MessageScreenTiming => {
  const timed: TimedMessage[] = [];
  let cursor = timing.screenEnterFrames;
  const last = screen.messages.length - 1;

  screen.messages.forEach((message, index) => {
    const presentation = resolveMessagePresentation(message);

    // Comedic beat: brief intentional silence before the last message
    // (the punchline) — silence is stronger than constant sound (spec §33).
    if (index === last && last > 0 && beat.silenceBeforeLastMessageFrames > 0) {
      cursor += beat.silenceBeforeLastMessageFrames;
    }

    const typingAction = message.lifecycle?.before?.find(
      (a) => a.type === "typing",
    );
    const typingDuration = getTypingDuration(message, presentation) ?? 0;

    const startFrame = cursor;
    const enterFrame = cursor + typingDuration;

    const typing =
      typingAction && typingDuration > 0
        ? buildTypingPhase(typingAction, typingDuration, startFrame)
        : null;

    const reply = message.replyTo
      ? {
          speakerName: message.replyTo.speaker
            ? resolveSpeakerName(message.replyTo.speaker)
            : "",
          previewText: message.replyTo.previewText,
        }
      : null;

    const afterActions: CompiledAfterAction[] = (message.lifecycle?.after ?? []).map(
      (action) => ({
        action,
        at: enterFrame + timing.messageEnterFrames + afterActionDelay(action),
        fromName:
          action.type === "reaction" && action.from
            ? resolveSpeakerName(action.from)
            : null,
      }),
    );

    timed.push({
      message,
      presentation,
      startFrame,
      enterFrame,
      typing,
      reply,
      afterActions,
    });

    // Gap after this message (state + beat driven; explicit values win).
    let advance = typingDuration;
    if (index < last) {
      const next = screen.messages[index + 1];
      const nextPresentation = resolveMessagePresentation(next);
      const stateGap = Math.round(
        timing.messageGapFrames *
          beat.messageGapMultiplier *
          Math.max(
            presentation.holdAfterMultiplier,
            nextPresentation.pauseBeforeMultiplier,
          ),
      );
      const explicitGap = Math.max(
        next.pauseBeforeFrames ?? 0,
        message.holdAfterFrames ?? 0,
      );
      advance += Math.max(stateGap, explicitGap);
    }
    cursor = startFrame + advance;
  });

  const lastEnter = timed[timed.length - 1]?.enterFrame ?? timing.screenEnterFrames;
  const readingHold = Math.round(baseReadingHold(screen.messages) * beat.readingHoldMultiplier);

  // After-actions may outlive the reading hold; keep the screen until
  // everything settles (spec §12–§13).
  const afterEnd = timed.reduce(
    (max, item) =>
      Math.max(
        max,
        ...item.afterActions.map((a) => a.at + AFTER_ACTION_FRAMES),
        0,
      ),
    0,
  );
  const contentEnd = Math.max(
    lastEnter + timing.messageEnterFrames + readingHold,
    afterEnd > 0 ? afterEnd + 10 : 0,
  );

  return { timedMessages: timed, readingHold, contentEnd };
};

// Back-compat wrapper for callers without beats (validation tooling).
export const calculateReadingHold = baseReadingHold;
