import React from "react";
import { useCurrentFrame } from "remotion";
import { discordLikeTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Typing indicator (spec §5–§7): three dots cycling subtly, or a
// "فلان يكتب..." label. Interrupted typing hides during the gap frames.
export const TypingIndicator: React.FC<{
  start: number;
  end: number;
  gapStart: number;
  gapEnd: number;
  style: "dots" | "label";
  speakerName: string;
}> = ({ start, end, gapStart, gapEnd, style, speakerName }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (frame < start || frame >= end) {
    return null;
  }
  const inGap = frame >= gapStart && frame < gapEnd;

  if (style === "label") {
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 500,
          fontSize: 30,
          color: discord.secondaryText,
          opacity: inGap ? 0.25 : 0.9,
        }}
      >
        {speakerName} يكتب...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 8, height: 40, alignItems: "center", opacity: inGap ? 0.15 : 1 }}>
      {[0, 1, 2].map((dot) => {
        const phase = (local / 6) % 3;
        const active = Math.floor(phase) === dot;
        return (
          <div
            key={dot}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: discord.secondaryText,
              opacity: active ? 1 : 0.3,
              transform: `translateY(${active ? -3 : 0}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
