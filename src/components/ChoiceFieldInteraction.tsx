import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { ChoiceField } from "../schema/video";
import { getFadeIn, getSlideUp } from "../animation/presets";
import { timing } from "../animation/timings";
import {
  formLayout,
  formTheme,
  formTypography,
  formControlMaxWidth,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Choice field (spec §15, §25): options appear, a decision pause passes,
// then the selected option fills in with a small punch and stays selected.
export const ChoiceFieldInteraction: React.FC<{
  field: ChoiceField;
  startFrame: number;
  interactionAt: number;
}> = ({ field, startFrame, interactionAt }) => {
  const frame = useCurrentFrame();

  const questionOpacity = getFadeIn(frame, startFrame, timing.formTiming.questionEnterFrames);
  const questionY = getSlideUp(frame, startFrame, timing.formTiming.questionEnterFrames, 6);

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

      <div style={{ display: "flex", flexDirection: "column", gap: formLayout.optionGapPx, maxWidth: formControlMaxWidth }}>
        {field.options.map((option) => {
          const isSelected = option === field.selected;
          const selectedNow = isSelected && frame >= interactionAt;
          const punch = isSelected
            ? interpolate(frame - interactionAt, [0, 3, 6], [1, 1.04, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

          return (
            <div
              key={option}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                height: formLayout.optionRowHeight,
                padding: "0 16px",
                borderRadius: 12,
                backgroundColor: selectedNow ? "rgba(88, 101, 242, 0.16)" : "transparent",
                transform: `scale(${punch})`,
                transformOrigin: "right center",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `3px solid ${selectedNow ? formTheme.accent : formTheme.muted}`,
                  backgroundColor: selectedNow ? formTheme.accent : "transparent",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: typography.family,
                  fontWeight: selectedNow ? 700 : 500,
                  fontSize: formTypography.optionFontSize,
                  color: selectedNow ? formTheme.text : formTheme.muted,
                  unicodeBidi: "plaintext",
                }}
              >
                {option}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
