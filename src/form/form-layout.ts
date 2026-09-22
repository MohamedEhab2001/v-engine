// Dynamic form container sizing (spec §19, §40, §48): the panel height is
// driven by title + fields + submit + padding, clamped like every screen.
// Pure — testable outside React.

import type { FormInteractionScreen } from "../schema/video";
import {
  formLayout,
  formTypography,
  mainColumnWidth,
  panel,
} from "../theme/theme";
import { PANEL_MAX_HEIGHT, PANEL_MIN_HEIGHT, type PanelLayout } from "../message/panel-layout";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const CHAR_WIDTH_RATIO = 0.52;

const textWidth =
  mainColumnWidth -
  panel.contentPaddingX * 2 -
  formLayout.cardPadding * 2 -
  formLayout.inputPaddingX * 2;

const estimateRows = (text: string, fontSize: number, maxWidth: number): number =>
  Math.max(1, Math.min(6, Math.ceil((text.length * fontSize * CHAR_WIDTH_RATIO) / maxWidth)));

const questionHeight = (question: string): number =>
  estimateRows(question, formTypography.questionFontSize, textWidth) *
  formTypography.questionFontSize *
  1.35;

const estimateFieldHeight = (screen: FormInteractionScreen, index: number): number => {
  const field = screen.fields[index];
  const question = questionHeight(field.question) + formLayout.controlGapPx;

  if (field.type === "choice" || field.type === "multi-choice") {
    return (
      question +
      field.options.length * formLayout.optionRowHeight +
      Math.max(0, field.options.length - 1) * formLayout.optionGapPx
    );
  }
  if (field.type === "rating") {
    return question + formLayout.optionRowHeight;
  }
  // text field: answer box sized to the full (final) answer for layout stability
  return (
    question +
    estimateRows(field.answer, formTypography.answerFontSize, textWidth) *
      formTypography.answerFontSize *
      1.4 +
    formLayout.inputPaddingY * 2
  );
};

export const calculateFormPanelLayout = (
  screen: FormInteractionScreen,
): PanelLayout => {
  const fieldsHeight = screen.fields.reduce(
    (sum, _, index) => sum + estimateFieldHeight(screen, index),
    0,
  );
  const fieldGaps = Math.max(0, screen.fields.length - 1) * formLayout.fieldGapPx;

  const headerHeight =
    (screen.actor ? formTypography.actorFontSize * 1.6 + 10 : 0) +
    (screen.title ? formTypography.titleFontSize * 1.35 + 10 : 0) +
    (screen.subtitle ? formTypography.subtitleFontSize * 1.35 + 10 : 0);

  const submitHeight =
    screen.submit?.show === false ? 0 : formLayout.submitHeight + 18;

  const cardHeight =
    formLayout.cardPadding * 2 +
    headerHeight +
    fieldsHeight +
    fieldGaps +
    submitHeight;

  const estimatedContentHeight =
    panel.contentPaddingTop + cardHeight + panel.contentPaddingBottom;

  const naturalHeight = panel.headerHeight + estimatedContentHeight;
  return {
    estimatedContentHeight,
    panelHeight: Math.round(clamp(naturalHeight, PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT)),
    overflow: naturalHeight > PANEL_MAX_HEIGHT,
  };
};
