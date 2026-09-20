import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { MessageReactionAction } from "../schema/video";
import { discordLikeTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Reaction chip (spec §11): pops in (0.7 → 1.08 → 1) and stays visible.
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
        gap: 8,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 999,
        border: `1px solid ${discord.separator}`,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "right center",
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>{reaction.emoji}</span>
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
