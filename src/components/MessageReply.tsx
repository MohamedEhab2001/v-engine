import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import { slackTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Reply context (spec §9–§10): thin line, small name, compact preview —
// enters slightly before the main message. No loud SFX.
export const MessageReply: React.FC<{
  speakerName: string;
  previewText: string;
  enterFrame: number;
}> = ({ speakerName, previewText, enterFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - (enterFrame - 3), [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
        opacity,
      }}
    >
      <div
        style={{
          width: 4,
          height: 38,
          borderRadius: 2,
          backgroundColor: discord.mutedText,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          fontFamily: typography.family,
          fontWeight: 600,
          fontSize: 26,
          color: discord.secondaryText,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 600,
          unicodeBidi: "plaintext",
        }}
      >
        {speakerName ? `${speakerName}: ` : ""}
        {previewText}
      </div>
    </div>
  );
};
