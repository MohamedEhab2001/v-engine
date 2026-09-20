import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { RatingField } from "../schema/video";
import { getFadeIn, getSlideUp } from "../animation/presets";
import { timing } from "../animation/timings";
import {
  formLayout,
  formTheme,
  formTypography,
  formControlMaxWidth,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Rating field (spec §17, §27): circles appear empty, then fill up to the
// selected value sequentially.
export const RatingFieldInteraction: React.FC<{
  field: RatingField;
  startFrame: number;
  interactionAt: number;
}> = ({ field, startFrame, interactionAt }) => {
  const frame = useCurrentFrame();
  const ft = timing.formTiming;

  const questionOpacity = getFadeIn(frame, startFrame, ft.questionEnterFrames);
  const questionY = getSlideUp(frame, startFrame, ft.questionEnterFrames, 6);

  const fillAt = (star: number): number =>
    interactionAt +
    Math.round(((star - 1) / Math.max(1, field.selected)) * ft.ratingFillFrames);

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
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          gap: 18,
          alignItems: "center",
          height: formLayout.optionRowHeight,
          maxWidth: formControlMaxWidth,
          padding: "0 16px",
        }}
      >
        {Array.from({ length: field.max }, (_, index) => index + 1).map((star) => {
          const filled = star <= field.selected && frame >= fillAt(star);
          const punch = interpolate(frame - fillAt(star), [0, 3, 6], [1, 1.15, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={star}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `3px solid ${filled ? formTheme.accent : formTheme.muted}`,
                backgroundColor: filled ? formTheme.accent : "transparent",
                transform: `scale(${punch})`,
                flexShrink: 0,
              }}
            />
          );
        })}

        <span
          style={{
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: formTypography.optionFontSize,
            color:
              frame >= interactionAt + ft.ratingFillFrames
                ? formTheme.text
                : formTheme.muted,
          }}
        >
          {frame >= interactionAt + ft.ratingFillFrames ? `${field.selected}/${field.max}` : ""}
        </span>
      </div>
    </div>
  );
};
