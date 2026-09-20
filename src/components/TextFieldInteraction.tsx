import React from "react";
import { useCurrentFrame } from "remotion";
import type { TextField } from "../schema/video";
import type { ResolvedMessagePresentation } from "../message/message-states";
import { getFadeIn, getSlideUp } from "../animation/presets";
import { timing } from "../animation/timings";
import { typedTextAt } from "../form/typing-timing";
import {
  formLayout,
  formTheme,
  formTypography,
  formControlMaxWidth,
} from "../theme/theme";
import { typography } from "../theme/typography";
import { TypingCursor } from "./TypingCursor";

// Text field (spec §14, §21–§24): the question reveals, then the answer is
// visibly typed with deterministic natural timing and a cursor.
export const TextFieldInteraction: React.FC<{
  field: TextField;
  presentation: ResolvedMessagePresentation;
  startFrame: number;
  interactionAt: number;
  endFrame: number;
}> = ({ field, presentation, startFrame, interactionAt, endFrame }) => {
  const frame = useCurrentFrame();

  const questionOpacity = getFadeIn(frame, startFrame, timing.formTiming.questionEnterFrames);
  const questionY = getSlideUp(frame, startFrame, timing.formTiming.questionEnterFrames, 6);

  const typed = typedTextAt(
    field.answer,
    frame - interactionAt,
    field.typingStyle,
    field.state,
  );
  const typing = frame >= interactionAt && frame < endFrame;

  return (
    <div dir="rtl" style={{ opacity: questionOpacity, transform: `translateY(${questionY}px)` }}>
      <div
        style={{
          fontFamily: typography.family,
          fontWeight: 600,
          fontSize: formTypography.questionFontSize,
          lineHeight: 1.35,
          color: formTheme.text,
          textAlign: "right",
          unicodeBidi: "plaintext",
          marginBottom: formLayout.controlGapPx,
        }}
      >
        {field.question}
      </div>

      <div
        dir="rtl"
        style={{
          backgroundColor: formTheme.fieldBackground,
          border: `1px solid ${formTheme.border}`,
          borderRadius: 12,
          paddingTop: formLayout.inputPaddingY,
          paddingBottom: formLayout.inputPaddingY,
          paddingLeft: formLayout.inputPaddingX,
          paddingRight: formLayout.inputPaddingX,
          maxWidth: formControlMaxWidth,
        }}
      >
        <span
          style={{
            fontFamily: typography.family,
            fontWeight: presentation.fontWeight,
            fontSize: formTypography.answerFontSize,
            lineHeight: 1.4,
            color: formTheme.text,
            textAlign: "right",
            unicodeBidi: "plaintext",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {typed}
        </span>
        <TypingCursor
          typing={typing}
          doneFrame={endFrame}
          height={formTypography.answerFontSize}
        />
      </div>
    </div>
  );
};
