import React, { useEffect, useMemo, useState } from "react";
import { format, safeArea, theme } from "../theme/theme";
import { slackTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";
import { fitHighlightedText } from "./HighlightText";
import { HighlightWords } from "./HighlightText";

// `loadFont()` (theme/fonts.ts) delays Remotion's render/playback start
// until every weight is loaded, but it does NOT delay React's first
// synchronous render pass — so the very first canvas measurement below can
// still land before `document.fonts` actually has the custom face, locking
// in a wrap computed against a fallback font that never gets recomputed
// (the flicker between two different line-break layouts). This flag forces
// exactly one clean recompute once the fonts are confirmed ready.
const hookFontCss = `${typography.hookWeight} ${theme.hookFontSize}px ${typography.family}`;

const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(
    () => typeof document !== "undefined" && document.fonts.check(hookFontCss),
  );
  useEffect(() => {
    if (ready || typeof document === "undefined") {
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);
  return ready;
};

// Hook / title region (spec §11): pinned to the top third of the frame,
// horizontally centered, 1–3 lines of bold Arabic with optional highlighted
// phrases. Font size auto-reduces within a bounded range; if the text still
// does not fit, warn the creator instead of shrinking to unreadable sizes.
export const Hook: React.FC<{
  text: string;
  highlights?: string[];
}> = ({ text, highlights }) => {
  const availableWidth = format.width - safeArea.left - safeArea.right;
  const fontsReady = useFontsReady();

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
    // fontsReady is a recompute trigger, not a value the calculation reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, highlights, availableWidth, fontsReady],
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
