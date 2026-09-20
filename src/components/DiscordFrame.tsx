import React from "react";
import { useCurrentFrame } from "remotion";
import { timing } from "../animation/timings";
import { getFadeIn, getSlideUp } from "../animation/presets";
import {
  chatConfig,
  discordLikeTheme as discord,
  panel,
  panelMarginX,
  panelWidth,
  theme,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Discord-style frame (spec §50): channel header, dynamic height, dark
// background, safe padding. The height and vertical position come from the
// active screen's compiled layout — this component never decides sizing and
// never decides message state behavior.
export const DiscordFrame: React.FC<{
  height: number;
  top: number;
  enterFrame: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ height, top, enterFrame, opacity = 1, children }) => {
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
      style={{
        position: "absolute",
        top,
        height,
        left: panelMarginX,
        width: panelWidth,
        borderRadius: panel.radius,
        overflow: "hidden",
        backgroundColor: discord.chatBackground,
        opacity: enterOpacity * opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          height: panel.headerHeight,
          backgroundColor: discord.headerBackground,
          display: "flex",
          alignItems: "center",
          paddingLeft: 36,
          paddingRight: 36,
          flexShrink: 0,
        }}
      >
        <span
          dir="rtl"
          style={{
            fontFamily: typography.family,
            fontWeight: 600,
            fontSize: theme.channelFontSize,
            color: discord.secondaryText,
          }}
        >
          #{chatConfig.channelName}
        </span>
      </div>

      <div style={{ position: "relative", height: height - panel.headerHeight }}>
        {children}
      </div>
    </div>
  );
};
