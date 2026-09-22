// Screen duration math. Pure functions, no React and no DOM — testable in
// plain Node.
//
// Model (spec §54–§55):
// - Message screens: screen enter + message starts + reading hold + tail.
//   Duration derives from message count, text volume, states, explicit
//   pauses, and the calculated reading hold — never a fixed value.
// - The final screen ends with a hold and no exit; the composition fades out.

import type { MessageScreen, VideoScreen } from "../schema/video";
import { timing } from "../animation/timings";
import { computeMessageScreenTiming } from "../message/message-timing";
import type { MessageScreenTiming } from "../message/message-timing";
import type { ResolvedStoryBeat } from "../message/story-beats";
import type { CompiledForm } from "../form/form-timing";

export type ScreenMotion = {
  enterFrames: number;
  exitFrames: number;
};

export const screenMotion = (screen: VideoScreen): ScreenMotion => {
  if (screen.type === "channel-create") {
    return {
      enterFrames: timing.channelCreateTiming.enterFrames,
      exitFrames: timing.channelCreateTiming.exitFrames,
    };
  }
  if (
    screen.type === "group-event" ||
    screen.type === "time-passage" ||
    screen.type === "call" ||
    screen.type === "presence"
  ) {
    return {
      enterFrames: timing.timePassageTiming.enterFrames,
      exitFrames: timing.timePassageTiming.exitFrames,
    };
  }
  return {
    enterFrames: timing.screenEnterFrames,
    exitFrames: timing.screenExitFrames,
  };
};

export const computeMessageTiming = (
  screen: MessageScreen,
  beat: ResolvedStoryBeat,
  resolveSpeakerName: (key: string) => string,
): MessageScreenTiming =>
  computeMessageScreenTiming(screen, beat, resolveSpeakerName);

export const computeScreenDuration = (
  screen: VideoScreen,
  messageTiming: MessageScreenTiming | null,
  isLast: boolean,
  formTiming: CompiledForm | null = null,
): number => {
  const { enterFrames, exitFrames } = screenMotion(screen);
  const tailFrames = isLast ? timing.finalVideoHoldFrames : exitFrames;

  if (screen.type === "messages" && messageTiming) {
    return messageTiming.contentEnd + tailFrames;
  }

  if (screen.type === "group-event") {
    const hold = screen.durationFrames ?? timing.eventHoldFrames;
    return enterFrames + Math.max(1, hold) + tailFrames;
  }

  if (screen.type === "time-passage") {
    const hold = screen.durationFrames ?? timing.timePassageTiming.holdFrames;
    return enterFrames + Math.max(1, hold) + tailFrames;
  }

  if (screen.type === "call") {
    const hold = screen.durationFrames ?? timing.eventHoldFrames;
    return enterFrames + Math.max(1, hold) + tailFrames;
  }

  if (screen.type === "presence") {
    const hold = (screen.delayFrames ?? 0) + timing.eventHoldFrames;
    return enterFrames + Math.max(1, hold) + tailFrames;
  }

  if (screen.type === "channel-create") {
    const hold = screen.durationFrames ?? timing.channelCreateTiming.holdFrames;
    return enterFrames + Math.max(1, hold) + tailFrames;
  }

  if (screen.type === "form-interaction") {
    return (formTiming?.contentEnd ?? enterFrames + 30) + tailFrames;
  }

  if (screen.type === "media") {
    // the required durationFrames is the hold time
    return (
      enterFrames + Math.max(1, Math.round(screen.durationFrames)) + tailFrames
    );
  }

  // Message screen without timing data (should not happen) — safe fallback.
  return enterFrames + timing.screenMaximumReadingHoldFrames + tailFrames;
};
