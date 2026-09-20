import React from "react";
import type { CompiledFormField } from "../form/form-timing";
import { resolveMessagePresentation } from "../message/message-states";
import { TextFieldInteraction } from "./TextFieldInteraction";
import { ChoiceFieldInteraction } from "./ChoiceFieldInteraction";
import { MultiChoiceFieldInteraction } from "./MultiChoiceFieldInteraction";
import { RatingFieldInteraction } from "./RatingFieldInteraction";

// One field = one interaction component (spec §13). The dispatcher resolves
// the semantic state presentation and delegates to the typed interaction.
export const FormField: React.FC<{
  timed: CompiledFormField;
}> = ({ timed }) => {
  const { field } = timed;
  const startFrame = timed.startFrame;
  const interactionAt = timed.interactionAt;

  if (field.type === "text") {
    return (
      <TextFieldInteraction
        field={field}
        presentation={resolveMessagePresentation({
          text: field.answer,
          state: field.state,
        })}
        startFrame={startFrame}
        interactionAt={interactionAt}
        endFrame={timed.endFrame}
      />
    );
  }

  if (field.type === "choice") {
    return (
      <ChoiceFieldInteraction
        field={field}
        startFrame={startFrame}
        interactionAt={interactionAt}
      />
    );
  }

  if (field.type === "multi-choice") {
    return (
      <MultiChoiceFieldInteraction
        field={field}
        startFrame={startFrame}
        interactionAt={interactionAt}
      />
    );
  }

  return (
    <RatingFieldInteraction
      field={field}
      startFrame={startFrame}
      interactionAt={interactionAt}
    />
  );
};
