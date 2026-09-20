import React, { useMemo } from "react";
import { format, safeArea, theme } from "../theme/theme";
import { discordLikeTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";
import { fitHighlightedText } from "./HighlightText";
import { HighlightWords } from "./HighlightText";

// Hook / title region (spec §11): pinned to the top third of the frame,
// horizontally centered, 1–3 lines of bold Arabic with optional highlighted
// phrases. Font size auto-reduces within a bounded range; if the text still
// does not fit, warn the creator instead of shrinking to unreadable sizes.
export const Hook: React.FC<{
  text: string;
  highlights?: string[];
}> = ({ text, highlights }) => {
  const availableWidth = format.width - safeArea.left - safeArea.right;

  const { lines, fontSize, overflow } = useMemo(
    () =>
      fitHighlightedText({
        text,
        highlights,
        maxWidth: availableWidth,
        fontFamily: typography.family,
        fontWeight: typography.hookWeight,
        fontSize: theme.hookFontSize,
        minFontSize: theme.hookMinFontSize,
        maxLines: theme.hookMaxLines,
      }),
    [text, highlights, availableWidth],
  );

  if (overflow) {
    console.warn(
      `Hook does not fit ${theme.hookMaxLines} lines even at ${theme.hookMinFontSize}px: "${text}"`,
    );
  }

  return (
    <div
      dir="rtl"
      style={{
        height: `${theme.hookRegionRatio * 100}%`,
        paddingTop: safeArea.top,
        paddingLeft: safeArea.left,
        paddingRight: safeArea.right,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {lines.map((words, index) => (
        <div
          key={index}
          style={{
            fontFamily: typography.family,
            fontWeight: typography.hookWeight,
            fontSize,
            lineHeight: theme.hookLineHeight,
            color: discord.primaryText,
            unicodeBidi: "plaintext",
          }}
        >
          <HighlightWords words={words} color={theme.highlightColor} />
        </div>
      ))}
    </div>
  );
};
