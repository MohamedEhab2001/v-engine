import React from "react";
import { useCurrentFrame } from "remotion";
import { formTheme, formTypography } from "../theme/theme";
import { typography } from "../theme/typography";

// Typing cursor (spec §23): visible while typing, blinks on pause and
// briefly after finishing, then hides. Subtle by design.
export const TypingCursor: React.FC<{
  typing: boolean;
  doneFrame: number;
  height: number;
}> = ({ typing, doneFrame, height }) => {
  const frame = useCurrentFrame();

  const blinkOn = frame % 14 < 9;

  let opacity: number;
  if (typing) {
    opacity = blinkOn ? 1 : 0.25;
  } else if (frame - doneFrame < 24) {
    // brief post-typing blink, then gone
    opacity = blinkOn ? 1 : 0;
  } else {
    opacity = 0;
  }

  return (
    <span
      style={{
        display: "inline-block",
        width: 4,
        height,
        marginLeft: 5,
        borderRadius: 2,
        backgroundColor: formTheme.accent,
        opacity,
        verticalAlign: "middle",
        fontFamily: typography.family,
        fontSize: formTypography.answerFontSize,
      }}
    />
  );
};
