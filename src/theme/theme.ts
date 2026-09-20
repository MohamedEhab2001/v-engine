// Central visual configuration — Discord-like dark chat direction
// (migration spec §9, §11–§12, §35). Components must not invent magic
// numbers; everything visual lives here.

import { format, safeArea } from "./base";

export { format, safeArea };

// Discord-inspired palette (migration spec §9). Exact values may be tuned
// for video readability; the goal is the dark chat language, not cloning.
export const discordLikeTheme = {
  pageBackground: "#000000",
  chatBackground: "#313338",
  secondaryBackground: "#2B2D31",
  headerBackground: "#1E1F22",
  primaryText: "#F2F3F5",
  secondaryText: "#B5BAC1",
  mutedText: "#949BA4",
  separator: "#3F4147",
  accent: "#5865F2",
  danger: "#ED4245",
  positive: "#3BA55C",
};

// Static for this migration; the schema may support a channel name later.
export const chatConfig = {
  channelName: "الفريق",
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
  messageFontSize: 58,
  messageLineHeight: 1.45,
  nameLineHeight: 1.25,
  channelFontSize: 30,

  // Group event screens
  eventTextFontSize: 50,
  eventTimestampFontSize: 24,
  eventAvatarSize: 104,
  eventBodyPadding: 48,

  // Message layout: each message is its own subtle container (spec §9, §39).
  avatarSize: 78,
  avatarTextGapPx: 24,
  messageContainerGapPx: 14,
  messagePaddingY: 12,
  messagePaddingX: 16,
  headerToMessagesGapPx: 22,

  // Highlighted phrases: light accent for contrast on dark panels.
  highlightColor: "#C9D0FF",
};

// Form interaction screens (spec §34, §42).
export const formTheme = {
  background: "#2B2D31",
  fieldBackground: "#1E1F22",
  border: "#3F4147",
  text: "#F2F3F5",
  muted: "#949BA4",
  accent: "#5865F2",
  positive: "#3BA55C",
  danger: "#ED4245",
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

// Time passage screens.
export const timePassageTheme = {
  labelFontSize: 66,
  dateFontSize: 46,
  iconSize: 110,
  iconLineWidth: 5,
};

// Chat panel geometry (panel occupies ~90% of screen width). The panel
// HEIGHT is dynamic — computed per screen by message/panel-layout.ts.
export const panel = {
  widthRatio: 0.9,
  topMarginPx: 20,
  radius: 36,
  headerHeight: 96,
  contentPaddingX: 55,
  contentPaddingTop: 36,
  contentPaddingBottom: 36,
};

export const panelWidth = Math.round(format.width * panel.widthRatio);
export const panelMarginX = Math.round((format.width - panelWidth) / 2);

// Max width available to form questions and controls inside the card.
export const formControlMaxWidth =
  panelWidth - panel.contentPaddingX * 2 - formLayout.cardPadding * 2;

// Vertical space the dynamic panel can occupy (below the hook, above the
// bottom safe area).
export const chatRegionHeightPx = Math.round(
  format.height * (1 - theme.hookRegionRatio),
);
export const panelRegionHeightPx = chatRegionHeightPx - safeArea.bottom;
