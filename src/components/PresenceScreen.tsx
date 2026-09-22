import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { PresenceScreen as PresenceScreenData, PresenceState } from "../schema/video";
import { slackTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { Avatar } from "./Avatar";

// Presence screen — a Slack-style status badge on the person's avatar (spec
// §21, §44): filled green for active, a hollow ring for away, a red dash
// glyph for do-not-disturb, and no badge at all for offline — matching
// Slack's real presence language — plus the Arabic status sentence below.
const statusText: Record<PresenceState, string> = {
  online: "متصل الآن",
  idle: "بعيد عن الكيبورد",
  offline: "غير متصل",
  dnd: "مشغول",
};

const PresenceBadge: React.FC<{ status: PresenceState }> = ({ status }) => {
  const size = 40;
  const ringWidth = 5;

  if (status === "offline") {
    return null;
  }

  if (status === "idle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${ringWidth}px solid ${discord.mutedText}`,
          backgroundColor: discord.chatBackground,
        }}
      />
    );
  }

  if (status === "dnd") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: discord.danger,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: size * 0.5,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: discord.positive,
      }}
    />
  );
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

  const person = compiled.person ?? { name: screen.person };

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
      <div style={{ position: "relative", lineHeight: 0 }}>
        <Avatar person={person} personId={screen.person} size={theme.eventAvatarSize} squared />

        <div
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            padding: 4,
            borderRadius: "50%",
            backgroundColor: discord.chatBackground,
            lineHeight: 0,
          }}
        >
          <PresenceBadge status={screen.status} />
        </div>
      </div>

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
        {person.name}{" "}
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
