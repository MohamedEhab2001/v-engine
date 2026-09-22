import React from "react";
import type { Person } from "../schema/video";
import { slackTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { Avatar } from "./Avatar";

// Speaker identity row (Slack-style): squared avatar, bold name + timestamp
// inline on the first line (e.g. "أحمد 8:31 م"), and the person's Arabic
// role as a small muted second line — isolated in <bdi> so an optional
// English role can never corrupt the RTL layout. Rendered once per screen.
export const SpeakerHeader: React.FC<{
  person: Person;
  personId: string;
  timestamp?: string;
}> = ({ person, personId, timestamp }) => {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.avatarTextGapPx,
      }}
    >
      <Avatar
        person={person}
        personId={personId}
        size={theme.avatarSize}
        squared
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: typography.family,
              fontWeight: typography.nameWeight,
              fontSize: theme.usernameFontSize,
              lineHeight: theme.nameLineHeight,
              color: discord.primaryText,
            }}
          >
            {person.name}
          </span>

          {timestamp ? (
            <bdi
              style={{
                fontFamily: typography.family,
                fontWeight: typography.metadataWeight,
                fontSize: theme.metadataFontSize,
                color: discord.mutedText,
              }}
            >
              {timestamp}
            </bdi>
          ) : null}
        </div>

        {person.role ? (
          <bdi
            style={{
              fontFamily: typography.family,
              fontWeight: typography.metadataWeight,
              fontSize: theme.metadataFontSize - 2,
              lineHeight: 1.3,
              color: discord.secondaryText,
              opacity: 0.75,
            }}
          >
            {person.role}
          </bdi>
        ) : null}
      </div>
    </div>
  );
};
