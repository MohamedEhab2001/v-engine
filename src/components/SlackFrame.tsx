import React from "react";
import { useCurrentFrame } from "remotion";
import { timing } from "../animation/timings";
import { getFadeIn, getSlideUp } from "../animation/presets";
import {
  panel,
  panelMarginX,
  panelWidth,
  slackTheme as slack,
  theme,
} from "../theme/theme";
import { typography } from "../theme/typography";
import { SlackSidebar } from "./SlackSidebar";
import type { ChannelRailItem } from "./SlackSidebar";
import type { Channel } from "../schema/video";

// Slack-style frame (replaces the old Discord frame): persistent icon rail
// + a main column with a channel header (name + topic) and dynamic-height
// content below it. The height and vertical position come from the active
// screen's compiled layout — this component never decides sizing and never
// decides message state behavior.
export const SlackFrame: React.FC<{
  height: number;
  top: number;
  enterFrame: number;
  opacity?: number;
  workspaceName: string;
  channelRail: ChannelRailItem[];
  activeChannelKey: string | null;
  activeChannel: Channel | null;
  children: React.ReactNode;
}> = ({
  height,
  top,
  enterFrame,
  opacity = 1,
  workspaceName,
  channelRail,
  activeChannelKey,
  activeChannel,
  children,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = getFadeIn(frame, enterFrame, timing.screenEnterFrames);
  const translateY = getSlideUp(
    frame,
    enterFrame,
    timing.screenEnterFrames,
    14,
  );

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        height,
        left: panelMarginX,
        width: panelWidth,
        borderRadius: panel.radius,
        overflow: "hidden",
        backgroundColor: slack.chatBackground,
        opacity: enterOpacity * opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <SlackSidebar
        workspaceName={workspaceName}
        channels={channelRail}
        activeChannelKey={activeChannelKey}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            height: panel.headerHeight,
            backgroundColor: slack.headerBackground,
            borderBottom: `1px solid ${slack.separator}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 36,
            paddingRight: 36,
            flexShrink: 0,
            gap: 4,
          }}
        >
          <span
            dir="rtl"
            style={{
              fontFamily: typography.family,
              fontWeight: 700,
              fontSize: theme.channelFontSize,
              color: slack.primaryText,
              unicodeBidi: "plaintext",
              textAlign: "right",
            }}
          >
            #{activeChannel?.name ?? ""}
          </span>
          {activeChannel?.topic ? (
            <span
              dir="rtl"
              style={{
                fontFamily: typography.family,
                fontWeight: typography.metadataWeight,
                fontSize: theme.channelTopicFontSize,
                color: slack.secondaryText,
                opacity: 0.8,
                textAlign: "right",
              }}
            >
              {activeChannel.topic}
            </span>
          ) : null}
        </div>

        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
