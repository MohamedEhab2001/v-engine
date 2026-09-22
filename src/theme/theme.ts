// Central visual configuration — Slack-like dark workspace direction.
// Components must not invent magic numbers; everything visual lives here.

import { format, safeArea } from "./base";

export { format, safeArea };

// Slack dark-mode inspired palette. Exact values may be tuned for video
// readability; the goal is the dark Slack chat language, not a pixel clone.
export const slackTheme = {
  pageBackground: "#000000",
  chatBackground: "#1A1D21",
  secondaryBackground: "#222529",
  headerBackground: "#222529",
  sidebarBackground: "#3F0E40",
  sidebarActive: "#1164A3",
  sidebarIconMuted: "rgba(255, 255, 255, 0.55)",
  primaryText: "#D1D2D3",
  secondaryText: "#ABABAD",
  mutedText: "#868686",
  separator: "#35363A",
  accent: "#1264A3",
  danger: "#E01E5A",
  positive: "#2BAC76",
  warning: "#ECB22E",
};

export const theme = {
  // Hook (spec §11–§12)
  hookFontSize: 82,
  hookMinFontSize: 58,
  hookMaxLines: 3,
  hookLineHeight: 1.3,
  hookRegionRatio: 0.33,

  // Chat typography — mobile-first sizes; messages are the second most
  // important element after the hook and never shrink (fix spec §2, §14).
  usernameFontSize: 38,
  metadataFontSize: 24,
  messageFontSize: 50,
  messageLineHeight: 1.45,
  nameLineHeight: 1.25,
  channelFontSize: 30,
  channelTopicFontSize: 22,

  // Group event / channel-create screens
  eventTextFontSize: 50,
  eventTimestampFontSize: 24,
  eventAvatarSize: 104,
  eventBodyPadding: 48,

  // Message layout: flat Slack rows — avatar, name+time, text (spec §9, §39).
  avatarSize: 78,
  avatarRadius: 16,
  avatarTextGapPx: 24,
  messageContainerGapPx: 22,
  messagePaddingY: 4,
  messagePaddingX: 0,
  headerToMessagesGapPx: 22,

  // Highlighted phrases: light accent for contrast on dark panels.
  highlightColor: "#C9D0FF",
};

// Form interaction screens (spec §34, §42).
export const formTheme = {
  background: "#222529",
  fieldBackground: "#1A1D21",
  border: "#35363A",
  text: "#D1D2D3",
  muted: "#868686",
  accent: "#1264A3",
  positive: "#2BAC76",
  danger: "#E01E5A",
  radius: 20,
};

export const formTypography = {
  titleFontSize: 46,
  subtitleFontSize: 26,
  questionFontSize: 38,
  answerFontSize: 36,
  optionFontSize: 34,
  submitFontSize: 34,
  actorFontSize: 24,
};

export const formLayout = {
  cardPadding: 30,
  fieldGapPx: 20,
  optionRowHeight: 54,
  optionGapPx: 8,
  inputPaddingY: 14,
  inputPaddingX: 18,
  controlGapPx: 10,
  submitHeight: 64,
};

// Time passage screens — rendered as a Slack-style date-divider pill
// ("──── Today ────") blown up to full-bleed cinematic scale.
export const timePassageTheme = {
  labelFontSize: 52,
  dateFontSize: 40,
  iconSize: 42,
  iconLineWidth: 4,
  dividerWidth: 820,
  pillPaddingY: 22,
  pillPaddingX: 44,
  pillRadius: 999,
};

// Chat panel geometry (panel occupies ~90% of screen width). The panel
// HEIGHT is dynamic — computed per screen by message/panel-layout.ts.
export const panel = {
  widthRatio: 0.9,
  topMarginPx: 20,
  radius: 36,
  headerHeight: 108,
  contentPaddingX: 40,
  contentPaddingTop: 32,
  contentPaddingBottom: 36,
};

// Sidebar rail: persistent, thin, Slack-style workspace/channel icon strip.
// Sits on the visual right in this RTL layout (mirrors Slack's LTR left
// rail) — see SlackFrame.tsx.
export const sidebar = {
  widthPx: 128,
  iconSize: 76,
  iconRadius: 20,
  iconGapPx: 22,
  topPaddingPx: 28,
  workspaceGapPx: 26,
};

export const panelWidth = Math.round(format.width * panel.widthRatio);
export const panelMarginX = Math.round((format.width - panelWidth) / 2);

// Width of the main chat column, i.e. the panel minus the sidebar rail —
// every text-wrapping estimate inside the chat column must use this, not
// the full panel width.
export const mainColumnWidth = panelWidth - sidebar.widthPx;

// Max width available to form questions and controls inside the card.
export const formControlMaxWidth =
  mainColumnWidth - panel.contentPaddingX * 2 - formLayout.cardPadding * 2;

// Vertical space the dynamic panel can occupy (below the hook, above the
// bottom safe area).
export const chatRegionHeightPx = Math.round(
  format.height * (1 - theme.hookRegionRatio),
);
export const panelRegionHeightPx = chatRegionHeightPx - safeArea.bottom;
