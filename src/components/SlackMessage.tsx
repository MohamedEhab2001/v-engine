import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import type { CompiledTimedMessage } from "../compiler/compile-screens";
import type { MessageEditAction } from "../schema/video";
import { getMessageEffectStyle } from "../message/message-effects";
import { slackTheme as discord, theme } from "../theme/theme";
import { typography } from "../theme/typography";
import { HighlightText } from "./HighlightText";
import { TypingIndicator } from "./TypingIndicator";
import { MessageReply } from "./MessageReply";
import { MessageReaction } from "./MessageReaction";
import { MessageAttachmentView } from "./MessageAttachment";

// One message = one flat Slack-style row with a full lifecycle (spec
// §3–§18): optional typing indicator → reply context + message + attachment
// → reactions / edits / deletes. The row never gets destroyed; edits and
// deletes transform it in place. Slack rows have no per-message card
// background — only a left accent bar marks emphasis states.
const accentColor = (accent: string): string | null => {
  if (accent === "warning") {
    return discord.warning;
  }
  if (accent === "positive") {
    return discord.positive;
  }
  if (accent === "negative") {
    return discord.danger;
  }
  return null;
};

export const SlackMessage: React.FC<{
  timed: CompiledTimedMessage;
  speakerName: string;
}> = ({ timed, speakerName }) => {
  const frame = useCurrentFrame();
  const { message, presentation } = timed;

  // ---- lifecycle resolution ----
  const typing = timed.typing;
  const beforeEnter = typing ? frame < timed.enterFrame : false;

  const editAction = timed.afterActions.find(
    (a): a is typeof a & { action: MessageEditAction } => a.action.type === "edit",
  );
  const deleteAction = timed.afterActions.find((a) => a.action.type === "delete");
  const reactions = timed.afterActions.filter(
    (a) => a.action.type === "reaction",
  );

  const deleted =
    deleteAction && frame >= deleteAction.at && deleteAction.action.type === "delete";

  const edited = editAction && frame >= editAction.at && editAction.action.type === "edit";

  const effect = getMessageEffectStyle(
    frame,
    timed.enterFrame,
    presentation.animation,
  );

  // While typing, the row shows the indicator in place of the text.
  const visibleOpacity = beforeEnter ? 1 : effect.opacity;
  const textOpacity = deleted
    ? interpolate(frame - (deleteAction?.at ?? 0), [0, 6], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : edited && editAction
      ? interpolate(
          frame - editAction.at,
          [0, 3, 5, 8],
          [1, 0.4, 0.4, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  const editedText =
    edited && editAction && editAction.action.type === "edit"
      ? editAction.action.text
      : message.text;
  const editedHighlights =
    edited && editAction && editAction.action.type === "edit"
      ? (editAction.action.highlights ?? message.highlights)
      : message.highlights;
  const editedWeight =
    edited && editAction && editAction.action.type === "edit" && editAction.action.state
      ? 700
      : presentation.fontWeight;

  const accent = accentColor(presentation.accent);

  const activeText = deleted && deleteAction.action.type === "delete"
    ? (deleteAction.action.replacementText ?? "تم حذف هذه الرسالة")
    : editedText;

  return (
    <div
      dir="rtl"
      style={{
        position: "relative",
        paddingTop: theme.messagePaddingY,
        paddingBottom: theme.messagePaddingY,
        paddingRight: 16,
        opacity: visibleOpacity,
        transform:
          beforeEnter
            ? undefined
            : `translate(${effect.translateX}px, ${effect.translateY}px) scale(${effect.scale})`,
        transformOrigin: "right center",
      }}
    >
      {accent && !deleted ? (
        <div
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            right: 0,
            width: 5,
            borderRadius: 3,
            backgroundColor: accent,
            opacity: 0.9,
          }}
        />
      ) : null}

      {beforeEnter && typing ? (
        <TypingIndicator
          start={typing.start}
          end={typing.end}
          gapStart={typing.gapStart}
          gapEnd={typing.gapEnd}
          style={typing.style}
          speakerName={speakerName}
        />
      ) : (
        <>
          {timed.reply && !deleted ? (
            <MessageReply
              speakerName={timed.reply.speakerName}
              previewText={timed.reply.previewText}
              enterFrame={timed.enterFrame}
            />
          ) : null}

          <div
            style={{
              fontFamily: typography.family,
              fontWeight: deleted ? 400 : editedWeight,
              fontSize: deleted
                ? Math.round(theme.messageFontSize * 0.72)
                : theme.messageFontSize,
              fontStyle: deleted ? "italic" : "normal",
              lineHeight: theme.messageLineHeight,
              color: deleted ? discord.mutedText : discord.primaryText,
              textAlign: "right",
              unicodeBidi: "plaintext",
              opacity: textOpacity,
            }}
          >
            <HighlightText
              text={activeText}
              highlights={deleted ? undefined : editedHighlights}
              color={theme.highlightColor}
            />
            {edited ? (
              <span
                style={{
                  fontFamily: typography.family,
                  fontSize: 24,
                  color: discord.mutedText,
                  marginRight: 10,
                }}
              >
                (تم التعديل)
              </span>
            ) : null}
          </div>

          {message.attachment && !deleted ? (
            <MessageAttachmentView
              attachment={message.attachment}
              enterFrame={timed.enterFrame}
            />
          ) : null}

          {reactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {reactions.map((compiledAction, index) =>
                compiledAction.action.type === "reaction" ? (
                  <MessageReaction
                    key={index}
                    reaction={compiledAction.action}
                    at={compiledAction.at}
                    fromName={compiledAction.fromName ?? undefined}
                  />
                ) : null,
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
