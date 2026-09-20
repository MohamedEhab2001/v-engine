// Screen compiler: turns the screen-based content into calculated frame
// ranges, resolved message presentations, reading holds, and dynamic panel
// heights. Pure — no React, no DOM — runnable in plain Node.

import type {
  ChatVideo,
  GroupEventScreen,
  Person,
  VideoScreen,
} from "../schema/video";
import { timing } from "../animation/timings";
import {
  computeMessageTiming,
  computeScreenDuration,
  screenMotion,
} from "./duration";
import type { TimedMessage } from "../message/message-timing";
import { resolveStoryBeat } from "../message/story-beats";
import type { ResolvedStoryBeat } from "../message/story-beats";
import {
  calculateGroupEventPanelLayout,
  calculateMediaPanelLayout,
  calculateMessagePanelLayout,
} from "../message/panel-layout";
import { calculateFormPanelLayout } from "../form/form-layout";
import { computeFormTiming } from "../form/form-timing";
import type { CompiledForm } from "../form/form-timing";
import { PANEL_MIN_HEIGHT } from "../message/panel-layout";

export type CompiledTimedMessage = Omit<
  TimedMessage,
  "startFrame" | "enterFrame"
> & {
  /** Absolute start frame (typing begins) within the composition. */
  startFrame: number;
  /** Absolute enter frame (message reveals) within the composition. */
  enterFrame: number;
};

export type CompiledScreen = {
  index: number;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  /** Enter/exit durations for this screen type (drives ScreenTransition). */
  enterFrames: number;
  exitFrames: number;
  /** Dynamic Discord frame height for this screen (drives DiscordFrame). */
  panelHeight: number;
  /** Message screens: calculated reading hold in frames. */
  readingHold: number | null;
  /** Message screens: resolved story beat direction. */
  beat: ResolvedStoryBeat | null;
  /** Form screens: interaction timing with absolute frames. */
  form: CompiledForm | null;
  screen: VideoScreen;
  /** Message screens: messages with absolute start frames + presentation. */
  timedMessages: CompiledTimedMessage[];
  /** Message / group-event screens: resolved person (or fallback). */
  person: Person | null;
  /** Group-event screens: resolved "by" person when provided. */
  byPerson: Person | null;
  /** Group-event screens: the full Arabic event sentence. */
  eventText: string | null;
};

export type CompiledVideo = {
  hook: {
    text: string;
    highlights?: string[];
    startFrame: number;
    durationFrames: number;
  };
  screens: CompiledScreen[];
  totalFrames: number;
  issues: string[];
};

// Arabic event sentences. Verbs inflect for gender when declared.
export const groupEventText = (
  screen: GroupEventScreen,
  person: Person,
  byPerson: Person | null,
): string => {
  switch (screen.event) {
    case "joined":
      return `${person.name} ${person.gender === "f" ? "انضمت" : "انضم"} إلى المجموعة`;
    case "left":
      return `${person.name} ${person.gender === "f" ? "غادرت" : "غادر"} المجموعة`;
    case "added":
      return byPerson
        ? `${byPerson.name} ${byPerson.gender === "f" ? "أضافت" : "أضاف"} ${person.name} إلى المجموعة`
        : `تمت إضافة ${person.name} إلى المجموعة`;
    case "removed":
      return byPerson
        ? `${byPerson.name} ${byPerson.gender === "f" ? "أزالت" : "أزال"} ${person.name} من المجموعة`
        : `تمت إزالة ${person.name} من المجموعة`;
  }
};

// Simple readable validation (spec §41, §48, §62) — warnings, not a framework.
const validateVideo = (video: ChatVideo): string[] => {
  const issues: string[] = [];

  video.screens.forEach((screen, index) => {
    const label = `screen ${index} (${screen.type})`;

    if (screen.type === "messages") {
      if (!video.people[screen.speaker]) {
        issues.push(
          `${label}: speaker "${screen.speaker}" is not defined in people`,
        );
      }
      if (screen.messages.length === 0) {
        issues.push(`${label}: message screen has no messages`);
      }
      const layout = calculateMessagePanelLayout(screen);
      if (layout.overflow) {
        issues.push(
          `${label}: MessageScreen exceeds maximum safe height. Split this speaking turn into multiple screens.`,
        );
      }
      screen.messages.forEach((message, messageIndex) => {
        if (message.replyTo?.speaker && !video.people[message.replyTo.speaker]) {
          issues.push(
            `${label}: message ${messageIndex}: reply speaker "${message.replyTo.speaker}" is not defined in people`,
          );
        }
        const reactionFrom = (message.lifecycle?.after ?? []).find(
          (a) => a.type === "reaction",
        );
        if (
          reactionFrom &&
          reactionFrom.type === "reaction" &&
          reactionFrom.from &&
          !video.people[reactionFrom.from]
        ) {
          issues.push(
            `${label}: message ${messageIndex}: reaction from "${reactionFrom.from}" is not defined in people`,
          );
        }
        if (message.attachment?.type === "image" && !message.attachment.src) {
          issues.push(
            `${label}: message ${messageIndex}: image attachment has no src`,
          );
        }
      });
    } else if (screen.type === "group-event") {
      if (!video.people[screen.person]) {
        issues.push(
          `${label}: event person "${screen.person}" is not defined in people`,
        );
      }
      if (screen.by && !video.people[screen.by]) {
        issues.push(
          `${label}: event by "${screen.by}" is not defined in people`,
        );
      }
    } else if (screen.type === "time-passage") {
      if (!screen.label) {
        issues.push(`${label}: time-passage screen has no label`);
      }
    } else if (screen.type === "form-interaction") {
      if (screen.actor && !video.people[screen.actor]) {
        issues.push(
          `${label}: actor "${screen.actor}" is not defined in people`,
        );
      }
      if (screen.fields.length === 0) {
        issues.push(`${label}: form screen has no fields`);
      }
      screen.fields.forEach((field, fieldIndex) => {
        if (field.type === "choice" && !field.options.includes(field.selected)) {
          issues.push(
            `${label}: field ${fieldIndex}: selected "${field.selected}" is not one of the options`,
          );
        }
        if (field.type === "multi-choice") {
          for (const selected of field.selected) {
            if (!field.options.includes(selected)) {
              issues.push(
                `${label}: field ${fieldIndex}: selected "${selected}" is not one of the options`,
              );
            }
          }
        }
        if (field.type === "rating" && (field.selected < 0 || field.selected > field.max)) {
          issues.push(
            `${label}: field ${fieldIndex}: rating ${field.selected} out of range 0–${field.max}`,
          );
        }
      });
      const layout = calculateFormPanelLayout(screen);
      if (layout.overflow) {
        issues.push(
          `${label}: FormInteractionScreen exceeds safe height. Split the form into multiple screens.`,
        );
      }
    } else if (screen.type === "call") {
      if (!video.people[screen.caller]) {
        issues.push(
          `${label}: caller "${screen.caller}" is not defined in people`,
        );
      }
    } else if (screen.type === "presence") {
      if (!video.people[screen.person]) {
        issues.push(
          `${label}: person "${screen.person}" is not defined in people`,
        );
      }
    } else {
      if (!screen.src) {
        issues.push(`${label}: media screen has no src`);
      }
      if (screen.durationFrames <= 0) {
        issues.push(`${label}: media screen durationFrames must be positive`);
      }
    }
  });

  return issues;
};

export const compileScreens = (video: ChatVideo): CompiledVideo => {
  const issues = validateVideo(video);
  for (const issue of issues) {
    console.warn(`[validation] ${issue}`);
  }

  // Fast start: the hook is visible from frame 0 and the first screen
  // enters after a short delay.
  const firstStart = timing.firstScreenDelayFrames;
  let cursor = firstStart;

  const screens: CompiledScreen[] = video.screens.map((screen, index) => {
    const isLast = index === video.screens.length - 1;

    const resolveSpeakerName = (key: string): string =>
      video.people[key]?.name ?? key;

    const beat =
      screen.type === "messages" ? resolveStoryBeat(screen) : null;

    const messageTiming =
      screen.type === "messages" && beat
        ? computeMessageTiming(screen, beat, resolveSpeakerName)
        : null;
    const formTimingRelative =
      screen.type === "form-interaction" ? computeFormTiming(screen) : null;
    const durationFrames = computeScreenDuration(
      screen,
      messageTiming,
      isLast,
      formTimingRelative,
    );
    const motion = screenMotion(screen);

    const startFrame = cursor;
    const endFrame = cursor + durationFrames;

    // Overlap: the next screen starts entering while this one exits.
    cursor = isLast ? endFrame : endFrame - motion.exitFrames;

    let person: Person | null = null;
    let byPerson: Person | null = null;
    let eventText: string | null = null;
    let panelHeight: number;
    let form: CompiledForm | null = null;

    if (screen.type === "messages") {
      person = video.people[screen.speaker] ?? { name: screen.speaker };
      panelHeight = calculateMessagePanelLayout(screen).panelHeight;
    } else if (screen.type === "group-event") {
      person = video.people[screen.person] ?? { name: screen.person };
      byPerson = screen.by ? (video.people[screen.by] ?? { name: screen.by }) : null;
      eventText = groupEventText(screen, person, byPerson);
      panelHeight = calculateGroupEventPanelLayout(eventText).panelHeight;
    } else if (screen.type === "time-passage") {
      // Rendered full-screen without the Discord frame; the height is only
      // used for interpolation safety.
      panelHeight = PANEL_MIN_HEIGHT;
    } else if (screen.type === "form-interaction") {
      person = screen.actor ? (video.people[screen.actor] ?? { name: screen.actor }) : null;
      panelHeight = calculateFormPanelLayout(screen).panelHeight;
      form = formTimingRelative
        ? {
            fields: formTimingRelative.fields.map((field) => ({
              ...field,
              startFrame: startFrame + field.startFrame,
              interactionAt: startFrame + field.interactionAt,
              endFrame: startFrame + field.endFrame,
            })),
            submitAt:
              formTimingRelative.submitAt === null
                ? null
                : startFrame + formTimingRelative.submitAt,
            contentEnd: startFrame + formTimingRelative.contentEnd,
          }
        : null;
    } else if (screen.type === "call") {
      person = video.people[screen.caller] ?? { name: screen.caller };
      panelHeight = calculateGroupEventPanelLayout(person.name).panelHeight + 160;
    } else if (screen.type === "presence") {
      person = video.people[screen.person] ?? { name: screen.person };
      panelHeight = calculateGroupEventPanelLayout(person.name).panelHeight;
    } else {
      panelHeight = calculateMediaPanelLayout().panelHeight;
    }

    return {
      index,
      startFrame,
      endFrame,
      durationFrames,
      enterFrames: motion.enterFrames,
      exitFrames: motion.exitFrames,
      panelHeight,
      readingHold: messageTiming ? messageTiming.readingHold : null,
      beat,
      form,
      screen,
      timedMessages: (messageTiming?.timedMessages ?? []).map((timed) => ({
        message: timed.message,
        presentation: timed.presentation,
        startFrame: startFrame + timed.startFrame,
        enterFrame: startFrame + timed.enterFrame,
        typing: timed.typing
          ? {
              ...timed.typing,
              start: startFrame + timed.typing.start,
              end: startFrame + timed.typing.end,
              gapStart: startFrame + timed.typing.gapStart,
              gapEnd: startFrame + timed.typing.gapEnd,
            }
          : null,
        reply: timed.reply,
        afterActions: timed.afterActions.map((action) => ({
          ...action,
          at: startFrame + action.at,
        })),
      })),
      person,
      byPerson,
      eventText,
    };
  });

  // Composition ends exactly at the final screen's endFrame — no padding.
  const lastEnd = screens.length
    ? screens[screens.length - 1].endFrame
    : firstStart + timing.finalVideoHoldFrames;

  return {
    hook: {
      text: video.hook.text,
      highlights: video.hook.highlights,
      startFrame: 0,
      durationFrames: firstStart,
    },
    screens,
    totalFrames: lastEnd,
    issues,
  };
};
