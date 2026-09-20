import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { PresenceScreen as PresenceScreenData, PresenceState } from "../schema/video";
import { discordLikeTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";

// Presence screen (spec §21, §44): a subtle standalone status change —
// "أحمد أصبح غير متصل" — with a status-colored dot. Used after strong
// story moments.
const statusColor: Record<PresenceState, string> = {
  online: discord.positive,
  idle: "#F0B232",
  offline: discord.mutedText,
  dnd: discord.danger,
};

const statusText: Record<PresenceState, string> = {
  online: "متصل الآن",
  idle: "بعيد عن الكيبورد",
  offline: "غير متصل",
  dnd: "مشغول",
};

export const PresenceScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as PresenceScreenData;
  const frame = useCurrentFrame();
  const local = frame - compiled.startFrame;
  const delay = screen.delayFrames ?? 0;

  const opacity = interpolate(local - delay, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        padding: 50,
        opacity,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          backgroundColor: statusColor[screen.status],
        }}
      />

      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 600,
          fontSize: theme.eventTextFontSize,
          lineHeight: 1.45,
          color: discord.secondaryText,
          textAlign: "center",
          unicodeBidi: "plaintext",
        }}
      >
        {compiled.person?.name ?? screen.person}{" "}
        {compiled.person?.gender === "f" ? "أصبحت" : "أصبح"} {statusText[screen.status]}
      </div>

      {screen.status === "offline" ? (
        <div
          style={{
            fontFamily: typography.family,
            fontSize: theme.eventTimestampFontSize,
            color: discord.mutedText,
          }}
        >
          آخر ظهور الآن
        </div>
      ) : null}
    </div>
  );
};
