// Prints the compiled screens of the current video — frame math, semantic
// state resolution, reading holds, and dynamic panel heights — without
// rendering React. Run with: npm run timeline
import { compileScreens } from "../src/compiler/compile-screens";
import { video } from "../src/videos/current-video";

const compiled = compileScreens(video);

console.log(`video: ${video.id}`);
if (compiled.issues.length > 0) {
  console.log(`validation issues: ${compiled.issues.length}`);
  for (const issue of compiled.issues) {
    console.log(`  ! ${issue}`);
  }
}
console.log(
  `hook: "${compiled.hook.text}" frames ${compiled.hook.startFrame} → ${compiled.hook.startFrame + compiled.hook.durationFrames}`,
);
console.log("");

for (const screen of compiled.screens) {
  if (screen.screen.type === "messages") {
    const speaker = screen.screen.speaker;
    console.log(
      `screen ${screen.index}  messages  ${speaker.padEnd(8)} frames ${screen.startFrame} → ${screen.endFrame}  panel=${screen.panelHeight}px  readingHold=${screen.readingHold}f`,
    );
    for (const timed of screen.timedMessages) {
      console.log(
        `        @${String(timed.startFrame).padStart(4)}  [${timed.presentation.state}/${timed.presentation.animation}/${timed.presentation.sound}]  ${timed.message.text}`,
      );
    }
  } else if (screen.screen.type === "group-event") {
    console.log(
      `screen ${screen.index}  ${screen.screen.event.padEnd(11)} frames ${screen.startFrame} → ${screen.endFrame}  panel=${screen.panelHeight}px  "${screen.eventText}"`,
    );
  } else if (screen.screen.type === "time-passage") {
    console.log(
      `screen ${screen.index}  time-passage frames ${screen.startFrame} → ${screen.endFrame}  "${screen.screen.label}" (style: ${screen.screen.style ?? "minimal"})`,
    );
  } else if (screen.screen.type === "form-interaction") {
    console.log(
      `screen ${screen.index}  form       frames ${screen.startFrame} → ${screen.endFrame}  panel=${screen.panelHeight}px  fields=${screen.screen.fields.length}`,
    );
    for (const timed of screen.form?.fields ?? []) {
      const field = timed.field;
      const detail =
        field.type === "text"
          ? `"${field.answer.slice(0, 24)}${field.answer.length > 24 ? "…" : ""}"`
          : field.type === "rating"
            ? `${field.selected}/${field.max}`
            : field.type === "choice"
              ? `→ ${field.selected}`
              : `→ ${field.selected.join(" + ")}`;
      console.log(
        `        @${String(timed.startFrame).padStart(4)}  ${field.type.padEnd(11)} interact@${timed.interactionAt} end@${timed.endFrame}  ${detail}`,
      );
    }
    if (screen.form?.submitAt != null) {
      console.log(
        `        submit press @${screen.form.submitAt}`,
      );
    }
  } else if (screen.screen.type === "call") {
    console.log(
      `screen ${screen.index}  call       frames ${screen.startFrame} → ${screen.endFrame}  ${screen.screen.caller} (${screen.screen.mode})`,
    );
  } else if (screen.screen.type === "presence") {
    console.log(
      `screen ${screen.index}  presence   frames ${screen.startFrame} → ${screen.endFrame}  ${screen.screen.person} → ${screen.screen.status}`,
    );
  } else {
    console.log(
      `screen ${screen.index}  ${screen.screen.mediaType.padEnd(11)} frames ${screen.startFrame} → ${screen.endFrame}  panel=${screen.panelHeight}px  ${screen.screen.src}`,
    );
  }
}

console.log("");
console.log(
  `totalFrames: ${compiled.totalFrames} (${(compiled.totalFrames / 30).toFixed(1)}s @ 30fps)`,
);
