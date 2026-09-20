import React from "react";
import type { GroupEventType } from "../schema/video";
import { discordLikeTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { Avatar } from "./Avatar";

// Standalone group-event screen (fix spec §6): the real avatar when one
// exists, a small contextual badge (+ / → / −), the Arabic event sentence in
// emphasis, and the timestamp — centered in the panel body.
const eventBadge = (
  event: GroupEventType,
): { glyph: string; color: string } => {
  if (event === "joined" || event === "added") {
    return { glyph: "+", color: discord.positive };
  }
  if (event === "removed") {
    return { glyph: "−", color: discord.danger };
  }
  return { glyph: "→", color: discord.mutedText };
};

export const GroupEventScreen: React.FC<{
  event: GroupEventType;
  eventText: string;
  personName: string;
  personId: string;
  avatarSrc?: string;
  timestamp?: string;
}> = ({ event, eventText, personName, personId, avatarSrc, timestamp }) => {
  const badge = eventBadge(event);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        padding: theme.eventBodyPadding,
      }}
    >
      <div style={{ position: "relative", lineHeight: 0 }}>
        <Avatar
          person={{ name: personName, avatar: avatarSrc }}
          personId={personId}
          size={theme.eventAvatarSize}
        />

        <div
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: badge.color,
            border: `5px solid ${discord.chatBackground}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: 30,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {badge.glyph}
        </div>
      </div>

      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: theme.eventTextFontSize,
          lineHeight: 1.45,
          color: discord.primaryText,
          textAlign: "center",
          unicodeBidi: "plaintext",
        }}
      >
        {eventText}
      </div>

      {timestamp ? (
        <bdi
          style={{
            fontFamily: typography.family,
            fontWeight: typography.metadataWeight,
            fontSize: theme.eventTimestampFontSize,
            color: discord.mutedText,
          }}
        >
          {timestamp}
        </bdi>
      ) : null}
    </div>
  );
};
