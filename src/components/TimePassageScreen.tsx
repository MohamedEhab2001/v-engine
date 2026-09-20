import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { TimePassageScreen as TimePassageScreenData } from "../schema/video";
import { timing } from "../animation/timings";
import {
  discordLikeTheme as discord,
  timePassageTheme,
} from "../theme/theme";
import { typography } from "../theme/typography";

// Standalone cinematic time-passage screen (spec §3, §5–§7): centered,
// dark, large Arabic label, subtle icon — no UI chrome. Rendered full-screen
// outside the Discord frame.
const ClockIcon: React.FC<{ angle: number }> = ({ angle }) => {
  const size = timePassageTheme.iconSize;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${timePassageTheme.iconLineWidth}px solid ${discord.secondaryText}`,
        position: "relative",
        opacity: 0.9,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: timePassageTheme.iconLineWidth,
          height: size * 0.34,
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
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: discord.secondaryText,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
};

export const TimePassageScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as TimePassageScreenData;
  const frame = useCurrentFrame();

  const style = screen.style ?? "minimal";
  const local = frame - compiled.startFrame;

  // Calendar style: cycle through dates quickly, then reveal the label.
  const perDate = timing.timePassageTiming.calendarDateFrames;
  const dates = style === "calendar" ? (screen.dates ?? []) : [];
  const cycleStart = 2;
  const cycleEnd = dates.length ? cycleStart + dates.length * perDate : 0;
  const dateIndex = Math.min(
    dates.length - 1,
    Math.max(0, Math.floor((local - cycleStart) / perDate)),
  );
  const dateFade = interpolate(
    (local - cycleStart - dateIndex * perDate) % perDate,
    [0, 2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 38,
        padding: 60,
      }}
    >
      {dates.length > 0 ? (
        <div
          style={{
            height: timePassageTheme.dateFontSize * 1.5,
            display: "flex",
            alignItems: "center",
            opacity: dateFade,
          }}
        >
          <span
            dir="rtl"
            style={{
              fontFamily: typography.family,
              fontWeight: 600,
              fontSize: timePassageTheme.dateFontSize,
              color: discord.secondaryText,
              unicodeBidi: "plaintext",
            }}
          >
            {dates[dateIndex]}
          </span>
        </div>
      ) : (
        <ClockIcon angle={handAngle} />
      )}

      <div
        dir="rtl"
        style={{
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: timePassageTheme.labelFontSize,
          lineHeight: 1.35,
          color: discord.primaryText,
          textAlign: "center",
          unicodeBidi: "plaintext",
          opacity: labelOpacity,
        }}
      >
        {screen.label}
      </div>
    </div>
  );
};
