// Story file store (local UI support): validates pasted story content by
// bundling it in memory and extracting the story id, then writes it into
// STORIES_DIR. Keeps the batch pipeline file-based — the queue only ever
// renders files from stories/.

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import esbuild from "esbuild";
import { localEnv } from "../config/env.js";

export class StoryValidationError extends Error {
  readonly code = "STORY_INVALID";
  constructor(message: string) {
    super(message);
  }
}

export class StoryNotFoundError extends Error {
  readonly code = "SCRIPT_NOT_FOUND";
  constructor(scriptId: string) {
    super(`Script "${scriptId}" does not exist.`);
  }
}

const SCHEMA_IMPORT_RE = /(["'])((?:\.\.\/)+(?:src\/)?schema\/video)\1/g;

interface StoryModule {
  video?: {
    id?: string;
    hook?: { text?: string };
  };
}

const safeId = (scriptId: string): string | null => {
  if (!scriptId || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(scriptId)) {
    return null;
  }
  return scriptId;
};

/**
 * Accepts any of the authoring styles:
 *   - a full file:  import type { ChatVideo } …  export const video: ChatVideo = { … }
 *   - bare export:  export const video = { … }
 *   - pure JSON:    { "id": "…", … }
 * and returns normalized source for the stories/ folder.
 */
export const normalizeStorySource = (rawContent: string): string => {
  let source = rawContent.trim();

  // strip an existing ChatVideo import; we re-add the correct relative path
  source = source.replace(
    /import\s+type\s*\{[^}]*ChatVideo[^}]*\}\s*from\s*["'][^"']*["'];?\s*/g,
    "",
  );

  if (!source.startsWith("export")) {
    source = `export const video: ChatVideo = ${source}`;
  }

  if (!/export\s+const\s+video\s*:?\s*ChatVideo\s*=/.test(source)) {
    source = source.replace(
      /export\s+const\s+video\s*=/,
      "export const video: ChatVideo =",
    );
  }

  // stories/ sits one level above src/: always import from ../src/schema
  source = source.replace(SCHEMA_IMPORT_RE, '"../src/schema/video"');

  return `import type { ChatVideo } from "../src/schema/video";\n\n${source}\n`;
};

const evaluateStory = (source: string): StoryModule | null => {
  const result = esbuild.buildSync({
    stdin: {
      contents: source,
      resolveDir: localEnv.STORIES_DIR,
      sourcefile: "story.ts",
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    logLevel: "silent",
  });
  const module = { exports: {} as StoryModule };
  new Function("module", "exports", result.outputFiles[0].text)(
    module,
    module.exports,
  );
  return module.exports;
};

export type ValidatedStory = {
  source: string;
  scriptId: string;
  hook: string | null;
};

export const validateStorySource = (rawContent: string): ValidatedStory => {
  const source = normalizeStorySource(rawContent);

  let story: StoryModule | null;
  try {
    story = evaluateStory(source);
  } catch (error) {
    throw new StoryValidationError(
      `Story does not compile: ${
        error instanceof Error ? error.message.split("\n")[0] : "unknown error"
      }`,
    );
  }

  const id = safeId(story?.video?.id ?? "");
  if (!id) {
    throw new StoryValidationError(
      "Story must contain a valid id (letters, numbers, - and _ only).",
    );
  }

  return {
    source,
    scriptId: id,
    hook: story?.video?.hook?.text ?? null,
  };
};

const storyPath = (scriptId: string): string =>
  join(localEnv.STORIES_DIR, `${scriptId}.ts`);

export const saveStory = (validated: ValidatedStory): string => {
  if (!existsSync(localEnv.STORIES_DIR)) {
    throw new StoryValidationError("stories/ folder is missing.");
  }
  writeFileSync(storyPath(validated.scriptId), validated.source, "utf8");
  return validated.scriptId;
};

export const readStory = (scriptId: string): string | null => {
  const path = storyPath(scriptId);
  if (!existsSync(path)) {
    return null;
  }
  return readFileSync(path, "utf8");
};

export const deleteStory = (scriptId: string): void => {
  const path = storyPath(scriptId);
  if (existsSync(path)) {
    unlinkSync(path);
  }
};
