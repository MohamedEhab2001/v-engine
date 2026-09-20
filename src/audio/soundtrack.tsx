import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { CompiledVideo } from "../compiler/compile-screens";
import {
  audioPresets,
  groupEventPresets,
  screenTransitionVolume,
} from "./presets";
import { timePassagePresets } from "../message/time-passage-presets";
import { resolveMessagePresentation } from "../message/message-states";
import { timing } from "../animation/timings";
import type { SoundPreset } from "../schema/video";

type SoundCue = {
  src: string;
  volume: number;
  startFrame: number;
  label: string;
};

// Builds the deterministic sound cue list from the compiled screens.
// Message sounds come from the resolved semantic state; screen transitions
// default to a subtle swoosh; group events play their event preset. Every
// cue fires at the exact frame its visual action begins (spec §45).
// Exported for testing without rendering React.
export const collectSoundCues = (compiled: CompiledVideo): SoundCue[] => {
  const cues: SoundCue[] = [];

  const push = (
    preset: Exclude<SoundPreset, "none">,
    startFrame: number,
    volumeOverride?: number,
  ) => {
    const presetConfig = audioPresets[preset];
    cues.push({
      src: presetConfig.src,
      volume: volumeOverride ?? presetConfig.volume,
      startFrame,
      label: preset,
    });
  };

  for (const compiledScreen of compiled.screens) {
    const screen = compiledScreen.screen;

    if (screen.type === "messages") {
      const transition = screen.transition?.sound ?? "swoosh";
      if (transition !== "none") {
        const explicit = screen.transition?.sound !== undefined;
        push(
          transition,
          compiledScreen.startFrame,
          explicit ? undefined : screenTransitionVolume,
        );
      }

      for (const timed of compiledScreen.timedMessages) {
        if (timed.presentation.sound !== "none" && timed.typing === null) {
          push(timed.presentation.sound, timed.enterFrame);
        }

        // Lifecycle cues (spec §45–§46): sound aligned to the frame where
        // each visual action begins.
        if (timed.typing) {
          for (
            let offset = 0;
            offset < timed.typing.end - timed.typing.start;
            offset += timing.formTiming.typingLoopFrames
          ) {
            const at = timed.typing.start + offset;
            // stay silent during the interrupted-typing gap
            if (at >= timed.typing.gapStart && at < timed.typing.gapEnd) {
              continue;
            }
            push("typing", at, 0.1);
          }
        }

        for (const after of timed.afterActions) {
          if (after.action.type === "reaction") {
            push("message", after.at, 0.18);
          } else if (after.action.type === "edit") {
            push("click", after.at, 0.18);
          } else {
            push("low-hit", after.at, 0.18);
          }
        }
      }

      for (const overlay of screen.overlays ?? []) {
        const sound = overlay.sound ?? "join";
        if (sound !== "none") {
          push(
            sound,
            compiledScreen.startFrame + (overlay.delayFrames ?? 0),
            0.22,
          );
        }
      }
    } else if (screen.type === "call") {
      if (screen.mode === "incoming") {
        push("ring", compiledScreen.startFrame);
      } else if (screen.mode === "accepted") {
        push("positive", compiledScreen.startFrame, 0.25);
      } else {
        push("low-hit", compiledScreen.startFrame, 0.25);
      }
    } else if (screen.type === "group-event") {
      const eventPreset = groupEventPresets[screen.event];
      push(eventPreset.sound, compiledScreen.startFrame, eventPreset.volume);
    } else if (screen.type === "time-passage") {
      // Sound begins exactly when the screen enters (spec §9).
      const sound =
        screen.sound ?? timePassagePresets[screen.style ?? "minimal"].sound;
      if (sound !== "none") {
        push(
          sound,
          compiledScreen.startFrame,
          sound === "swoosh" ? screenTransitionVolume : undefined,
        );
      }
    } else if (screen.type === "form-interaction" && compiledScreen.form) {
      push("swoosh", compiledScreen.startFrame, screenTransitionVolume);

      for (const timed of compiledScreen.form.fields) {
        const field = timed.field;

        if (field.type === "text") {
          // Soft keyboard texture during typing, re-cued deterministically.
          const duration = Math.max(6, Math.round(timed.typingDuration ?? 0));
          for (
            let offset = 0;
            offset < duration;
            offset += timing.formTiming.typingLoopFrames
          ) {
            push("typing", timed.interactionAt + offset, 0.12);
          }
          // The state's sound lands when the answer completes.
          const presentation = resolveMessagePresentation({
            text: field.answer,
            state: field.state,
          });
          if (presentation.sound !== "none") {
            push(presentation.sound, timed.endFrame);
          }
        } else if (field.type === "choice") {
          push("click", timed.interactionAt, 0.2);
        } else if (field.type === "multi-choice") {
          for (let i = 0; i < field.selected.length; i++) {
            push(
              "click",
              timed.interactionAt +
                i *
                  (timing.formTiming.choiceSelectFrames +
                    timing.formTiming.multiSelectGapFrames),
              0.2,
            );
          }
        } else {
          push("click", timed.interactionAt, 0.2);
        }
      }

      if (
        compiledScreen.form.submitAt !== null &&
        screen.submit?.click !== false
      ) {
        push("click", compiledScreen.form.submitAt, 0.3);
      }
    } else {
      push("swoosh", compiledScreen.startFrame, screenTransitionVolume);
    }
  }

  return cues;
};

// Renders one <Audio> per cue, mounted at its exact start frame so each
// sound plays in sync with its screen or message.
export const Soundtrack: React.FC<{
  compiled: CompiledVideo;
}> = ({ compiled }) => {
  const cues = collectSoundCues(compiled);

  return (
    <>
      {cues.map((cue, index) => (
        <Sequence key={index} from={cue.startFrame} layout="none">
          <Audio src={staticFile(cue.src)} volume={() => cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
