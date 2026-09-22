import React from "react";
import type { Channel } from "../schema/video";
import { slackTheme as slack, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { hueFromString } from "./SlackSidebar";

// Standalone channel-create screen: the moment a new channel opens (fix
// spec's group-event pattern, applied to channels instead of people) — a
// large channel icon, "#name", topic, the Arabic "who opened it" sentence,
// and the timestamp — centered in the panel body, matching GroupEventScreen.
export const ChannelCreateScreen: React.FC<{
  channel: Channel;
  channelKey: string;
  eventText: string;
  timestamp?: string;
}> = ({ channel, channelKey, eventText, timestamp }) => {
  const hue = hueFromString(channelKey);
  const tint = channel.color ?? `hsl(${hue} 45% 38%)`;

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
        padding: theme.eventBodyPadding,
      }}
    >
      <div
        style={{
          width: theme.eventAvatarSize,
          height: theme.eventAvatarSize,
          borderRadius: 28,
          backgroundColor: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(theme.eventAvatarSize * 0.46),
          color: "#FFFFFF",
        }}
      >
        {channel.icon ?? channel.name.trim().charAt(0) ?? "#"}
      </div>

      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: theme.eventTextFontSize,
          color: slack.primaryText,
          unicodeBidi: "plaintext",
        }}
      >
        #{channel.name}
      </div>

      {channel.topic ? (
        <div
          dir="rtl"
          style={{
            fontFamily: typography.family,
            fontWeight: typography.metadataWeight,
            fontSize: theme.channelTopicFontSize + 4,
            color: slack.secondaryText,
            textAlign: "center",
            unicodeBidi: "plaintext",
          }}
        >
          {channel.topic}
        </div>
      ) : null}

      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 600,
          fontSize: 30,
          lineHeight: 1.4,
          color: slack.secondaryText,
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
            color: slack.mutedText,
          }}
        >
          {timestamp}
        </bdi>
      ) : null}
    </div>
  );
};
