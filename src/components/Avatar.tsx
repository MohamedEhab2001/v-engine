import React from "react";
import { Img, staticFile } from "remotion";
import type { Person } from "../schema/video";
import { theme } from "../theme/theme";
import { discordLikeTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Deterministic hue per person id — no randomness (spec §23).
const hueFromString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
};

export const Avatar: React.FC<{
  person: Person;
  personId: string;
  size?: number;
}> = ({ person, personId, size = theme.avatarSize }) => {
  if (person.avatar) {
    return (
      <Img
        src={staticFile(person.avatar)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          objectFit: "cover",
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }

  const initial = person.name.trim().charAt(0) || "؟";
  const hue = hueFromString(personId);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: `hsl(${hue} 42% 30%)`,
        color: discord.primaryText,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.42),
        fontWeight: typography.nameWeight,
        fontFamily: typography.family,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};
