// Render + probe service (media-pipeline spec PART 5). Invokes the existing
// Remotion CLI — the renderer itself is untouched.

import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { localEnv } from "../config/env.js";

export class RenderError extends Error {
  readonly code = "RENDER_FAILED";
  constructor(message: string) {
    super(message);
  }
}

const outputFilename = (scriptId: string): string =>
  join(localEnv.RENDER_OUTPUT_DIR, `${scriptId}.mp4`);

const CURRENT_VIDEO_PATH = "src/videos/current-video.ts";

/**
 * Remotion renders whatever `src/videos/current-video.ts` contains, so a
 * queued render temporarily swaps the selected story in. The original file
 * is always restored, even when the render fails.
 */
const swapCurrentVideo = (storyFilePath: string): { restore: () => void } => {
  const original = readFileSync(CURRENT_VIDEO_PATH, "utf8");
  let storySource = readFileSync(storyFilePath, "utf8");

  // The story file moves one directory deeper (stories/ → src/videos/):
  // rewrite the schema import and guarantee the typed export.
  storySource = storySource.replace(
    /(["'])((?:\.\.\/)+src\/schema\/video)(["'])/g,
    "$1../schema/video$3",
  );
  if (
    !/import\s+type\s*\{[^}]*ChatVideo[^}]*\}\s*from\s*["'][^"']*schema\/video["']/.test(
      storySource,
    )
  ) {
    storySource = `import type { ChatVideo } from "../schema/video";\n\n${storySource}`;
  }

  writeFileSync(CURRENT_VIDEO_PATH, storySource, "utf8");
  return {
    restore: () => {
      writeFileSync(CURRENT_VIDEO_PATH, original, "utf8");
    },
  };
};

export const renderStory = (
  scriptId: string,
  storyFilePath: string,
): Promise<string> =>
  new Promise((resolvePromise, rejectPromise) => {
    const outputPath = outputFilename(scriptId);
    const swap = swapCurrentVideo(storyFilePath);

    const child = spawn(
      "npx",
      ["remotion", "render", "ChatStoryVideo", outputPath],
      { cwd: process.cwd(), shell: true, windowsHide: true },
    );

    let stderrTail = "";
    // Both pipes MUST be drained — an unread stdout pipe fills up and
    // deadlocks the child once Remotion's progress output exceeds the
    // OS buffer (~64 KB).
    child.stdout?.on("data", () => {});
    child.stderr?.on("data", (chunk) => {
      stderrTail = (stderrTail + String(chunk)).slice(-2000);
    });
    child.on("error", (error) => {
      swap.restore();
      rejectPromise(new RenderError(error.message));
    });
    child.on("close", (code) => {
      swap.restore();
      if (code === 0 && existsSync(outputPath)) {
        resolvePromise(outputPath);
        return;
      }
      rejectPromise(
        new RenderError(
          `remotion render exited with code ${code}. ${stderrTail.slice(-400)}`,
        ),
      );
    });
  });

/** Best-effort duration probe via Remotion's bundled ffprobe. */
export const probeDurationSeconds = (
  videoPath: string,
): number | null => {
  try {
    const result = spawnSync(
      "npx",
      ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", videoPath],
      { cwd: process.cwd(), shell: true, encoding: "utf8", timeout: 60_000 },
    );
    const parsed = JSON.parse(result.stdout) as {
      format?: { duration?: string };
    };
    const duration = Number(parsed.format?.duration);
    return Number.isFinite(duration) ? duration : null;
  } catch {
    return null;
  }
};

export const getRenderJobPaths = (scriptId: string) => {
  const outputPath = outputFilename(scriptId);
  const exists = existsSync(outputPath);
  return {
    outputPath,
    exists,
    sizeBytes: exists ? statSync(outputPath).size : null,
  };
};
