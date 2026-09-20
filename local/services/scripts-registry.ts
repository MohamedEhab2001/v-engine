// Script discovery (media-pipeline spec PART 5): scans STORIES_DIR for
// story files, bundles each with esbuild in memory, and extracts the story
// metadata (id, hook). No Remotion/React runtime needed for this — story
// files only use type imports from the schema.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import esbuild from "esbuild";
import { localEnv } from "../config/env.js";

export type StoryScriptInfo = {
  scriptId: string;
  title: string;
  hook: string | null;
  filename: string;
};

interface StoryModule {
  video?: {
    id?: string;
    hook?: { text?: string };
  };
}

const loadStoryModule = (filePath: string): StoryModule | null => {
  try {
    const result = esbuild.buildSync({
      entryPoints: [filePath],
      bundle: true,
      write: false,
      format: "cjs",
      platform: "node",
      logLevel: "silent",
    });
    const output = result.outputFiles[0].text;
    const module = { exports: {} as StoryModule };
    // Story bundles are pure data (type-only imports are stripped) —
    // evaluating them here is deterministic and side-effect free.
    new Function("module", "exports", output)(module, module.exports);
    return module.exports;
  } catch (error) {
    console.warn(
      `[scripts] could not load ${filePath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
};

const humanizeId = (scriptId: string): string =>
  scriptId
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const listStoryScripts = (): StoryScriptInfo[] => {
  const dir = localEnv.STORIES_DIR;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const scripts: StoryScriptInfo[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".ts") || entry.endsWith(".d.ts")) {
      continue;
    }
    const loaded = loadStoryModule(join(dir, entry));
    if (!loaded?.video?.id) {
      continue;
    }
    scripts.push({
      scriptId: loaded.video.id,
      title: humanizeId(loaded.video.id),
      hook: loaded.video.hook?.text ?? null,
      filename: entry,
    });
  }
  return scripts;
};

export const loadStoryMetadata = (
  scriptId: string,
): { title: string; hook: string | null } | null => {
  const found = listStoryScripts().find((s) => s.scriptId === scriptId);
  return found ? { title: found.title, hook: found.hook } : null;
};
