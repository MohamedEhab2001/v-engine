import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { CallScreen as CallScreenData } from "../schema/video";
import { slackTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";
import { Avatar } from "./Avatar";

// Call screen (spec §20): a story moment around a phone call — generic UI,
// never an iOS/Android clone. Incoming shows a ringing caller with pulsing
// rings and accept/decline buttons; the other modes show their outcome.
const modeText: Record<CallScreenData["mode"], string> = {
  incoming: "يتصل بك...",
  accepted: "تم الرد",
  declined: "تم الرفض",
  missed: "مكالمة فائتة",
};

export const CallScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as CallScreenData;
  const frame = useCurrentFrame();
  const local = frame - compiled.startFrame;
  const incoming = screen.mode === "incoming";

  const ringScale = incoming
    ? interpolate(local % 40, [0, 40], [1, 1.5])
    : 1;
  const ringOpacity = incoming
    ? interpolate(local % 40, [0, 40], [0.5, 0])
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        padding: 50,
      }}
    >
      <div style={{ position: "relative", lineHeight: 0 }}>
        {incoming ? (
          <div
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: "50%",
              border: `3px solid ${discord.secondaryText}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
            }}
          />
        ) : null}
        <Avatar
          person={compiled.person ?? { name: screen.caller }}
          personId={screen.caller}
          size={150}
        />
      </div>

      <div
        style={{
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: 56,
          color: discord.primaryText,
        }}
      >
        {compiled.person?.name ?? screen.caller}
      </div>

      <div
        style={{
          fontFamily: typography.family,
          fontWeight: 500,
          fontSize: 36,
          color: incoming ? discord.secondaryText : discord.mutedText,
        }}
      >
        {modeText[screen.mode]}
      </div>

      {screen.callDurationLabel ? (
        <div
          style={{
            fontFamily: typography.family,
            fontSize: 28,
            color: discord.mutedText,
          }}
        >
          {screen.callDurationLabel}
        </div>
      ) : null}

      {incoming ? (
        <div
          dir="rtl"
          style={{ display: "flex", flexDirection: "row", gap: 60, marginTop: 20 }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              backgroundColor: discord.danger,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 40,
            }}
          >
            ✕
          </div>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              backgroundColor: discord.positive,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 40,
            }}
          >
            ✆
          </div>
        </div>
      ) : null}
    </div>
  );
};
