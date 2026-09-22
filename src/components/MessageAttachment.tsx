import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { MessageAttachment } from "../schema/video";
import { slackTheme as discord } from "../theme/theme";
import { typography } from "../theme/typography";

// Attachments (spec §14–§18): rich content INSIDE the message container —
// image, document, link, or a voice note with a deterministic waveform.

const documentColor = (icon?: string): string => {
  if (icon === "pdf") {
    return discord.danger;
  }
  if (icon === "doc") {
    return discord.accent;
  }
  return discord.mutedText;
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Deterministic waveform derived from the duration when none is provided.
const waveformOf = (attachment: Extract<MessageAttachment, { type: "audio" }>): number[] => {
  if (attachment.waveform?.length) {
    return attachment.waveform;
  }
  const bars = Math.max(12, Math.round(attachment.durationSeconds * 2));
  return Array.from(
    { length: bars },
    (_, i) => 0.3 + 0.65 * Math.abs(Math.sin(i * 2.399 + attachment.durationSeconds)),
  );
};

const AudioNote: React.FC<{
  attachment: Extract<MessageAttachment, { type: "audio" }>;
  enterFrame: number;
}> = ({ attachment, enterFrame }) => {
  const frame = useCurrentFrame();
  const bars = waveformOf(attachment);
  const totalFrames = Math.max(1, attachment.durationSeconds * 30);
  const progress = attachment.autoplay
    ? interpolate(frame - enterFrame, [0, totalFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const playedBars = Math.round(progress * bars.length);

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        borderRadius: 999,
        padding: "10px 18px",
        marginTop: 10,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          backgroundColor: discord.positive,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        ▶
      </div>
      <div style={{ display: "flex", flexDirection: "row", gap: 3, alignItems: "center", direction: "rtl" }}>
        {bars.map((height, index) => (
          <div
            key={index}
            style={{
              width: 5,
              height: Math.max(6, Math.round(height * 36)),
              borderRadius: 3,
              backgroundColor:
                index < playedBars ? discord.positive : discord.mutedText,
              opacity: index < playedBars ? 1 : 0.5,
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: typography.family,
          fontSize: 24,
          color: discord.secondaryText,
        }}
      >
        {formatDuration(attachment.durationSeconds)}
      </span>
    </div>
  );
};

export const MessageAttachmentView: React.FC<{
  attachment: MessageAttachment;
  enterFrame: number;
}> = ({ attachment, enterFrame }) => {
  if (attachment.type === "image") {
    return (
      <div
        style={{
          marginTop: 10,
          borderRadius: 12,
          overflow: "hidden",
          height: 300,
        }}
      >
        <Img
          src={staticFile(attachment.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: attachment.fit === "contain" ? "contain" : "cover",
          }}
        />
      </div>
    );
  }

  if (attachment.type === "document") {
    return (
      <div
        dir="rtl"
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          border: `1px solid ${discord.separator}`,
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            backgroundColor: documentColor(attachment.icon),
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {(attachment.icon ?? "file").toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <bdi
            style={{
              fontFamily: typography.family,
              fontWeight: 600,
              fontSize: 28,
              color: discord.primaryText,
            }}
          >
            {attachment.title}
          </bdi>
          {attachment.meta ? (
            <span
              style={{
                fontFamily: typography.family,
                fontSize: 22,
                color: discord.mutedText,
              }}
            >
              {attachment.meta}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  if (attachment.type === "link") {
    return (
      <div
        dir="rtl"
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          border: `1px solid ${discord.separator}`,
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        {attachment.domain ? (
          <span style={{ fontFamily: typography.family, fontSize: 22, color: discord.mutedText }}>
            {attachment.domain}
          </span>
        ) : null}
        <bdi
          style={{
            fontFamily: typography.family,
            fontWeight: 600,
            fontSize: 28,
            color: discord.primaryText,
          }}
        >
          {attachment.title}
        </bdi>
        {attachment.description ? (
          <span style={{ fontFamily: typography.family, fontSize: 24, color: discord.secondaryText }}>
            {attachment.description}
          </span>
        ) : null}
      </div>
    );
  }

  return <AudioNote attachment={attachment} enterFrame={enterFrame} />;
};
