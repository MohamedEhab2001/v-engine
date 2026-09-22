import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { TimePassageScreen as TimePassageScreenData } from "../schema/video";
import { timing } from "../animation/timings";
import {
  slackTheme as discord,
  timePassageTheme,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Cinematic time-passage screen, styled after Slack's date divider
// ("──── Today ────") blown up to full-bleed scale: a thin line on either
// side of a centered pill. Rendered full-screen outside the chat frame.
const ClockGlyph: React.FC<{ angle: number }> = ({ angle }) => {
  const size = timePassageTheme.iconSize;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${timePassageTheme.iconLineWidth}px solid ${discord.secondaryText}`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: timePassageTheme.iconLineWidth,
          height: size * 0.32,
          backgroundColor: discord.secondaryText,
          borderRadius: 3,
          transformOrigin: "50% 0%",
          transform: `translateX(-50%) rotate(${angle}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: discord.secondaryText,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
};

const DividerLine: React.FC = () => (
  <div
    style={{
      flex: 1,
      height: 1,
      backgroundColor: discord.separator,
    }}
  />
);

export const TimePassageScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as TimePassageScreenData;
  const frame = useCurrentFrame();

  const style = screen.style ?? "minimal";
  const local = frame - compiled.startFrame;

  // Calendar style: cycle through dates inside the pill, then settle on
  // the final label (same pill, content crossfades — no layout jump).
  const perDate = timing.timePassageTiming.calendarDateFrames;
  const dates = style === "calendar" ? (screen.dates ?? []) : [];
  const cycleStart = 2;
  const cycleEnd = dates.length ? cycleStart + dates.length * perDate : 0;
  const dateIndex = Math.min(
    dates.length - 1,
    Math.max(0, Math.floor((local - cycleStart) / perDate)),
  );
  const cyclingOpacity = dates.length
    ? interpolate(local - cycleEnd, [0, 4], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const labelOpacity = dates.length
    ? interpolate(local - cycleEnd, [0, 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Clock style: the hand sweeps subtly during the hold.
  const handAngle =
    style === "clock"
      ? interpolate(local, [0, compiled.durationFrames], [40, 170])
      : 40;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          width: timePassageTheme.dividerWidth,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
        }}
      >
        <DividerLine />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
            backgroundColor: discord.secondaryBackground,
            border: `1px solid ${discord.separator}`,
            borderRadius: timePassageTheme.pillRadius,
            paddingTop: timePassageTheme.pillPaddingY,
            paddingBottom: timePassageTheme.pillPaddingY,
            paddingLeft: timePassageTheme.pillPaddingX,
            paddingRight: timePassageTheme.pillPaddingX,
          }}
        >
          {style === "clock" ? <ClockGlyph angle={handAngle} /> : null}

          <div style={{ position: "relative" }}>
            {dates.length > 0 ? (
              <span
                dir="rtl"
                style={{
                  position: labelOpacity > 0 ? "absolute" : "static",
                  right: 0,
                  fontFamily: typography.family,
                  fontWeight: 600,
                  fontSize: timePassageTheme.dateFontSize,
                  color: discord.secondaryText,
                  unicodeBidi: "plaintext",
                  opacity: cyclingOpacity,
                  whiteSpace: "nowrap",
                }}
              >
                {dates[dateIndex]}
              </span>
            ) : null}

            <span
              dir="rtl"
              style={{
                position: dates.length > 0 && labelOpacity === 0 ? "absolute" : "static",
                right: 0,
                fontFamily: typography.family,
                fontWeight: 700,
                fontSize: timePassageTheme.labelFontSize,
                lineHeight: 1.3,
                color: discord.primaryText,
                unicodeBidi: "plaintext",
                opacity: labelOpacity,
                whiteSpace: "nowrap",
              }}
            >
              {screen.label}
            </span>
          </div>
        </div>

        <DividerLine />
      </div>
    </div>
  );
};
