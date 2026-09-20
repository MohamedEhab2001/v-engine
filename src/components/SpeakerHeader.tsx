import React from "react";
import type { Person } from "../schema/video";
import { discordLikeTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { Avatar } from "./Avatar";

// Speaker identity row: avatar, username, and one Arabic-first metadata line
// "{Arabic role} • {Arabic-friendly time}" (fix spec §5) — e.g.
// "مطور • 8:31 م". The line is isolated in <bdi> so an optional English role
// can never corrupt the RTL layout. Rendered once per message screen.
export const SpeakerHeader: React.FC<{
  person: Person;
  personId: string;
  timestamp?: string;
}> = ({ person, personId, timestamp }) => {
  const metadata = [person.role, timestamp].filter(Boolean).join(" • ");

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: theme.avatarTextGapPx,
      }}
    >
      <Avatar person={person} personId={personId} size={theme.avatarSize} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: typography.family,
            fontWeight: typography.nameWeight,
            fontSize: theme.usernameFontSize,
            lineHeight: theme.nameLineHeight,
            color: discord.primaryText,
          }}
        >
          {person.name}
        </div>

        {metadata ? (
          <bdi
            style={{
              fontFamily: typography.family,
              fontWeight: typography.metadataWeight,
              fontSize: theme.metadataFontSize,
              lineHeight: 1.3,
              color: discord.secondaryText,
              opacity: 0.72,
            }}
          >
            {metadata}
          </bdi>
        ) : null}
      </div>
    </div>
  );
};
