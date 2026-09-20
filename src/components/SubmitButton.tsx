import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { formTheme, formTypography } from "../theme/theme";
import { typography } from "../theme/typography";

// Submit button (spec §28): appears after the fields, a short pause, then a
// firm but small press with a click — followed by a subtle success state.
export const SubmitButton: React.FC<{
  label: string;
  pressAt: number;
  showAt: number;
  success: boolean;
}> = ({ label, pressAt, showAt, success }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - showAt, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const press = interpolate(frame - pressAt, [0, 3, 6], [1, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pressed = frame >= pressAt;

  return (
    <div style={{ opacity, display: "flex", justifyContent: "center", marginTop: 18 }}>
      <div
        style={{
          backgroundColor: pressed && success ? formTheme.positive : formTheme.accent,
          borderRadius: 14,
          paddingTop: 14,
          paddingBottom: 14,
          paddingLeft: 46,
          paddingRight: 46,
          transform: `scale(${press})`,
          boxShadow: pressed ? "0 0 24px rgba(59, 165, 92, 0.25)" : "none",
        }}
      >
        <span
          style={{
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: formTypography.submitFontSize,
            color: "#FFFFFF",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
