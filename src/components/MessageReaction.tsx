import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { MessageReactionAction } from "../schema/video";
import { slackTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Slack-style reaction chip: emoji + count in a tinted rounded rectangle
// (not a full pill — Slack's reactions are subtly rounded), pops in
// (0.7 → 1.08 → 1) and stays visible. The reactor's name rides along as a
// small muted aside so the viewer still knows who reacted.
export const MessageReaction: React.FC<{
  reaction: MessageReactionAction;
  at: number;
  fromName?: string;
}> = ({ reaction, at, fromName }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - at, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - at, [0, 2, 6], [0.7, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "right center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 12,
          paddingRight: 12,
          borderRadius: 10,
          border: `1px solid ${discord.accent}`,
          backgroundColor: "rgba(18, 100, 163, 0.16)",
        }}
      >
        <span style={{ fontSize: 30, lineHeight: 1 }}>{reaction.emoji}</span>
        <span
          style={{
            fontFamily: typography.family,
            fontWeight: 600,
            fontSize: 24,
            color: discord.accent,
          }}
        >
          1
        </span>
      </div>
      {fromName ? (
        <span
          style={{
            fontFamily: typography.family,
            fontSize: 22,
            color: discord.mutedText,
          }}
        >
          {fromName}
        </span>
      ) : null}
    </div>
  );
};
