// Dynamic Discord frame sizing (spec §4–§7, §42–§43, §53). The panel height
// is driven by actual content, clamped to a min/max range. Pure — no DOM —
// so the compiler and the renderer agree on layout deterministically.

import type { MessageScreen } from "../schema/video";
import { panel, panelWidth, theme } from "../theme/theme";

export const PANEL_MIN_HEIGHT = 360;
export const PANEL_MAX_HEIGHT = 1050;

export type PanelLayout = {
  estimatedContentHeight: number;
  panelHeight: number;
  overflow: boolean;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const CHAR_WIDTH_RATIO = 0.52;

const messageTextWidth =
  panelWidth -
  panel.contentPaddingX * 2 -
  theme.messagePaddingX * 2;

export const estimateMessageRows = (text: string): number => {
  const estimatedWidth =
    text.length * theme.messageFontSize * CHAR_WIDTH_RATIO;
  return Math.max(1, Math.min(6, Math.ceil(estimatedWidth / messageTextWidth)));
};

const estimateMessageHeight = (text: string): number =>
  estimateMessageRows(text) *
    theme.messageFontSize *
    theme.messageLineHeight +
  theme.messagePaddingY * 2;

// Reply rows and attachments add fixed heights (kept in sync with the
// rendering components).
export const ATTACHMENT_HEIGHTS = {
  image: 320,
  document: 96,
  link: 130,
  audio: 84,
  reply: 46,
  reaction: 52,
} as const;

export const estimateMessageExtras = (message: {
  replyTo?: unknown;
  attachment?: { type: string } | null;
  lifecycle?: { after?: { type: string }[] } | null;
}): number => {
  let extra = 0;
  if (message.replyTo) {
    extra += ATTACHMENT_HEIGHTS.reply + 8;
  }
  if (message.attachment) {
    const key = message.attachment.type as keyof typeof ATTACHMENT_HEIGHTS;
    extra += (ATTACHMENT_HEIGHTS[key] ?? 0) + 10;
  }
  const hasReaction = (message.lifecycle?.after ?? []).some(
    (a) => a.type === "reaction",
  );
  if (hasReaction) {
    extra += ATTACHMENT_HEIGHTS.reaction;
  }
  return extra;
};

export const calculateMessagePanelLayout = (
  screen: MessageScreen,
): PanelLayout => {
  const messagesHeight = screen.messages.reduce(
    (sum, message) =>
      sum + estimateMessageHeight(message.text) + estimateMessageExtras(message),
    0,
  );
  const gaps =
    Math.max(0, screen.messages.length - 1) * theme.messageContainerGapPx;

  const estimatedContentHeight =
    panel.contentPaddingTop +
    theme.avatarSize +
    theme.headerToMessagesGapPx +
    messagesHeight +
    gaps +
    panel.contentPaddingBottom;

  const naturalHeight = panel.headerHeight + estimatedContentHeight;
  return {
    estimatedContentHeight,
    panelHeight: Math.round(clamp(naturalHeight, PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT)),
    overflow: naturalHeight > PANEL_MAX_HEIGHT,
  };
};

// ---- Group events: compact frame sized around the event (spec §42) ----

export const calculateGroupEventPanelLayout = (
  eventText: string,
): PanelLayout => {
  const textWidth = panelWidth - theme.eventBodyPadding * 2 - 60;
  const textRows = Math.max(
    1,
    Math.min(
      3,
      Math.ceil(
        (eventText.length * theme.eventTextFontSize * CHAR_WIDTH_RATIO) /
          textWidth,
      ),
    ),
  );

  const estimatedContentHeight =
    theme.eventBodyPadding +
    theme.eventAvatarSize +
    30 +
    textRows * theme.eventTextFontSize * 1.45 +
    30 +
    theme.eventTimestampFontSize * 1.3 +
    theme.eventBodyPadding;

  const naturalHeight = panel.headerHeight + estimatedContentHeight;
  return {
    estimatedContentHeight,
    panelHeight: Math.round(clamp(naturalHeight, PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT)),
    overflow: naturalHeight > PANEL_MAX_HEIGHT,
  };
};

// ---- Media screens fill the largest allowed frame ----

export const calculateMediaPanelLayout = (): PanelLayout => ({
  estimatedContentHeight: PANEL_MAX_HEIGHT - panel.headerHeight,
  panelHeight: PANEL_MAX_HEIGHT,
  overflow: false,
});
