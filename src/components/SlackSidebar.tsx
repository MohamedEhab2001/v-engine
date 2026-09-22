import React from "react";
import { useCurrentFrame } from "remotion";
import type { Channel } from "../schema/video";
import { sidebar, slackTheme as slack } from "../theme/theme";
import { typography } from "../theme/typography";
import { getFadeIn, getEnterScale } from "../animation/presets";

const ICON_POP_FRAMES = 10;

// Deterministic hue per channel key — no randomness, mirrors Avatar's
// fallback-color approach for people.
export const hueFromString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
};

export type ChannelRailItem = {
  key: string;
  channel: Channel;
  /** Absolute frame this channel first becomes visible on the rail. */
  introducedAtFrame: number;
};

// Persistent Slack-style icon rail (spec: sidebar): workspace glyph on top,
// one rounded icon per channel introduced so far below it. The active
// channel is highlighted; a channel pops in the first time it appears.
export const SlackSidebar: React.FC<{
  workspaceName: string;
  channels: ChannelRailItem[];
  activeChannelKey: string | null;
}> = ({ workspaceName, channels, activeChannelKey }) => {
  const frame = useCurrentFrame();
  const workspaceInitial = workspaceName.trim().charAt(0) || "؟";

  return (
    <div
      style={{
        width: sidebar.widthPx,
        flexShrink: 0,
        height: "100%",
        backgroundColor: slack.sidebarBackground,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: sidebar.topPaddingPx,
        gap: sidebar.iconGapPx,
      }}
    >
      <div
        style={{
          width: sidebar.iconSize,
          height: sidebar.iconSize,
          borderRadius: sidebar.iconRadius,
          backgroundColor: "rgba(255, 255, 255, 0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: typography.family,
          fontWeight: typography.nameWeight,
          fontSize: Math.round(sidebar.iconSize * 0.42),
          color: slack.primaryText,
          marginBottom: sidebar.workspaceGapPx - sidebar.iconGapPx,
        }}
      >
        {workspaceInitial}
      </div>

      <div
        style={{
          width: "60%",
          height: 1,
          backgroundColor: "rgba(255, 255, 255, 0.14)",
        }}
      />

      {channels.map(({ key, channel, introducedAtFrame }) => {
        if (frame < introducedAtFrame) {
          return null;
        }
        const active = key === activeChannelKey;
        const enter = getFadeIn(frame, introducedAtFrame, ICON_POP_FRAMES);
        const scale = getEnterScale(frame, introducedAtFrame, ICON_POP_FRAMES, 0.5);
        const hue = hueFromString(key);
        const tint = channel.color ?? `hsl(${hue} 45% 42%)`;

        return (
          <div
            key={key}
            style={{
              position: "relative",
              width: sidebar.iconSize,
              height: sidebar.iconSize,
              opacity: enter,
              transform: `scale(${scale})`,
            }}
          >
            {active ? (
              <div
                style={{
                  position: "absolute",
                  right: -sidebar.iconGapPx / 2 - 3,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  borderRadius: 3,
                  backgroundColor: slack.primaryText,
                }}
              />
            ) : null}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: sidebar.iconRadius,
                backgroundColor: active ? slack.sidebarActive : tint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: typography.family,
                fontWeight: typography.nameWeight,
                fontSize: Math.round(sidebar.iconSize * 0.44),
                color: "#FFFFFF",
                boxShadow: active
                  ? "0 0 0 2px rgba(255,255,255,0.9)"
                  : "none",
              }}
            >
              {channel.icon ?? channel.name.trim().charAt(0) ?? "#"}
            </div>
          </div>
        );
      })}
    </div>
  );
};
