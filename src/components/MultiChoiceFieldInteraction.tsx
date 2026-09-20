import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { MultiChoiceField } from "../schema/video";
import { getFadeIn, getSlideUp } from "../animation/presets";
import { timing } from "../animation/timings";
import {
  formLayout,
  formTheme,
  formTypography,
  formControlMaxWidth,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Multi-choice field (spec §16, §26): checkboxes appear, then selections
// fill in one at a time with a soft click each.
const selectionAt = (
  interactionAt: number,
  index: number,
): number =>
  interactionAt + index * (timing.formTiming.choiceSelectFrames + timing.formTiming.multiSelectGapFrames);

const Checkmark: React.FC = () => (
  <div style={{ position: "relative", width: 14, height: 14 }}>
    <div
      style={{
        position: "absolute",
        left: 1,
        top: 6,
        width: 5,
        height: 9,
        borderRight: "3px solid #FFFFFF",
        borderBottom: "3px solid #FFFFFF",
        transform: "rotate(40deg)",
      }}
    />
  </div>
);

export const MultiChoiceFieldInteraction: React.FC<{
  field: MultiChoiceField;
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
          const selectedIndex = field.selected.indexOf(option);
          const isSelected = selectedIndex >= 0;
          const checkedAt = isSelected ? selectionAt(interactionAt, selectedIndex) : Infinity;
          const checkedNow = frame >= checkedAt;
          const punch = isSelected
            ? interpolate(frame - checkedAt, [0, 3, 6], [1, 1.04, 1], {
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
                backgroundColor: checkedNow ? "rgba(88, 101, 242, 0.16)" : "transparent",
                transform: `scale(${punch})`,
                transformOrigin: "right center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `3px solid ${checkedNow ? formTheme.accent : formTheme.muted}`,
                  backgroundColor: checkedNow ? formTheme.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {checkedNow ? <Checkmark /> : null}
              </div>
              <span
                style={{
                  fontFamily: typography.family,
                  fontWeight: checkedNow ? 700 : 500,
                  fontSize: formTypography.optionFontSize,
                  color: checkedNow ? formTheme.text : formTheme.muted,
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
