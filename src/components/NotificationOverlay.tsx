import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { NotificationOverlay as NotificationOverlayData } from "../schema/video";
import { formTheme } from "../theme/theme";
import { typography } from "../theme/typography";

// Notification overlay (spec §19): a compact card sliding in from the top
// over an active screen, holding briefly, then sliding out. Non-blocking.
export const NotificationOverlayCard: React.FC<{
  overlay: NotificationOverlayData;
  startFrame: number;
}> = ({ overlay, startFrame }) => {
  const frame = useCurrentFrame();
  const duration = overlay.durationFrames ?? 50;
  const local = frame - startFrame;

  const enter = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(local, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enter, exit);
  const translateY = interpolate(local, [0, 6], [-90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (local < 0 || local >= duration) {
    return null;
  }

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 18,
        left: "50%",
        transform: `translate(-50%, ${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: formTheme.fieldBackground,
        border: `1px solid ${formTheme.border}`,
        borderRadius: 18,
        padding: "14px 22px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: formTheme.accent,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {overlay.icon ?? "●"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: typography.family, fontSize: 22, color: formTheme.muted }}>
          {overlay.source}
        </span>
        <span style={{ fontFamily: typography.family, fontWeight: 700, fontSize: 28, color: formTheme.text }}>
          {overlay.title}
        </span>
        {overlay.body ? (
          <span style={{ fontFamily: typography.family, fontSize: 24, color: formTheme.muted }}>
            {overlay.body}
          </span>
        ) : null}
      </div>
    </div>
  );
};
