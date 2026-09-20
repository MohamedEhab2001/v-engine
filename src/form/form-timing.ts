// Form interaction timing (spec §20, §31–§33): every field contributes
// question reveal + interaction time to the screen duration. Pure — no
// React, no DOM.

import type {
  FormField,
  FormInteractionScreen,
  MessageState,
} from "../schema/video";
import { timing } from "../animation/timings";
import { computeTypingDuration, typingPauseBefore } from "./typing-timing";

export type CompiledFormField = {
  field: FormField;
  /** Question reveal starts (frames, relative to the screen). */
  startFrame: number;
  /** Selection / typing begins (relative). */
  interactionAt: number;
  /** Interaction complete (relative). */
  endFrame: number;
  /** Text fields: total typing duration in frames. */
  typingDuration: number | null;
};

export type CompiledForm = {
  fields: CompiledFormField[];
  /** Submit press moment (relative), or null when the button is hidden. */
  submitAt: number | null;
  /** Content fully settled including the final hold (relative). */
  contentEnd: number;
};

export const computeFormTiming = (
  screen: FormInteractionScreen,
): CompiledForm => {
  const ft = timing.formTiming;
  let cursor = timing.screenEnterFrames;
  const fields: CompiledFormField[] = [];

  for (const field of screen.fields) {
    const start = cursor;
    const questionEnd = start + ft.questionEnterFrames;
    const state = (field as { state?: MessageState }).state;

    let interactionAt: number;
    let end: number;
    let typingDuration: number | null = null;

    if (field.type === "text") {
      interactionAt =
        questionEnd + ft.textStartPauseFrames + typingPauseBefore(state);
      typingDuration = computeTypingDuration(
        field.answer,
        field.typingStyle,
        state,
      );
      end = interactionAt + Math.max(6, Math.round(typingDuration));
    } else if (field.type === "choice") {
      interactionAt = questionEnd + ft.choiceDecisionPauseFrames;
      end = interactionAt + ft.choiceSelectFrames;
    } else if (field.type === "multi-choice") {
      interactionAt = questionEnd + ft.choiceDecisionPauseFrames;
      end =
        interactionAt +
        field.selected.length *
          (ft.choiceSelectFrames + ft.multiSelectGapFrames);
    } else {
      interactionAt = questionEnd + ft.choiceDecisionPauseFrames;
      end = interactionAt + ft.ratingFillFrames;
    }

    fields.push({ field, startFrame: start, interactionAt, endFrame: end, typingDuration });
    cursor = end + ft.fieldGapFrames;
  }

  const showSubmit = screen.submit?.show !== false;
  let submitAt: number | null = null;
  if (showSubmit) {
    submitAt = cursor + ft.submitPauseFrames;
    cursor = submitAt + ft.submitPressFrames;
  }

  return { fields, submitAt, contentEnd: cursor + ft.finalHoldFrames };
};
