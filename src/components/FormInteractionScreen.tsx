import React from "react";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { FormInteractionScreen as FormInteractionScreenData } from "../schema/video";
import {
  formLayout,
  formTheme,
  formTypography,
  panel,
} from "../theme/theme";
import { typography } from "../theme/typography";
import { timing } from "../animation/timings";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { Avatar } from "./Avatar";

// Form interaction screen (spec §11–§12, §18–§20): a polished dark form
// card inside the panel. Fields reveal and answer progressively; the
// container height comes from the compiled form layout.
const actorVerb: Record<string, string> = {
  survey: "بيملأ الاستبيان",
  application: "بيملأ الطلب",
  quiz: "بيحل الاختبار",
  feedback: "بيملأ الاستبيان",
  generic: "بيملأ النموذج",
};

export const FormInteractionScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as FormInteractionScreenData;
  const form = compiled.form;
  if (!form) {
    return null;
  }

  const actor = compiled.person;

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: 0,
        paddingTop: panel.contentPaddingTop,
        paddingBottom: panel.contentPaddingBottom,
        paddingLeft: panel.contentPaddingX,
        paddingRight: panel.contentPaddingX,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          backgroundColor: formTheme.background,
          border: `1px solid ${formTheme.border}`,
          borderRadius: formTheme.radius,
          padding: formLayout.cardPadding,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {actor ? (
          <div
            dir="rtl"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Avatar person={actor} personId={screen.actor ?? "actor"} size={30} />
            <span
              style={{
                fontFamily: typography.family,
                fontWeight: 500,
                fontSize: formTypography.actorFontSize,
                color: formTheme.muted,
              }}
            >
              {actor.name} {actorVerb[screen.formStyle ?? "generic"]}
            </span>
          </div>
        ) : null}

        {screen.title ? (
          <div
            style={{
              fontFamily: typography.family,
              fontWeight: 700,
              fontSize: formTypography.titleFontSize,
              lineHeight: 1.35,
              color: formTheme.text,
              textAlign: "right",
              unicodeBidi: "plaintext",
              marginBottom: 10,
            }}
          >
            {screen.title}
          </div>
        ) : null}

        {screen.subtitle ? (
          <div
            style={{
              fontFamily: typography.family,
              fontWeight: 500,
              fontSize: formTypography.subtitleFontSize,
              lineHeight: 1.35,
              color: formTheme.muted,
              textAlign: "right",
              unicodeBidi: "plaintext",
              marginBottom: 10,
            }}
          >
            {screen.subtitle}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: formLayout.fieldGapPx,
          }}
        >
          {form.fields.map((timed) => (
            <FormField key={timed.startFrame} timed={timed} />
          ))}
        </div>

        {form.submitAt !== null ? (
          <SubmitButton
            label={screen.submit?.label ?? "إرسال"}
            pressAt={compiled.startFrame + form.submitAt}
            showAt={
              compiled.startFrame + form.submitAt - timing.formTiming.submitPauseFrames
            }
            success={true}
          />
        ) : null}
      </div>
    </div>
  );
};
