// Rendered-file service (spec §26–§28): safe MP4 discovery inside
// RENDER_OUTPUT_DIR only. Filenames from the frontend are treated as
// untrusted — path traversal is rejected at several layers.

import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, isAbsolute, join, resolve, sep } from "node:path";
import { env } from "../../config/env.js";

export class InvalidVideoFilenameError extends Error {
  readonly code = "INVALID_VIDEO_FILENAME";
  constructor() {
    super("Invalid video filename.");
  }
}

export class VideoNotFoundError extends Error {
  readonly code = "VIDEO_NOT_FOUND";
  constructor() {
    super("Rendered video not found.");
  }
}

const renderDirectory = resolve(env.RENDER_OUTPUT_DIR);

export const resolveRenderFile = (filename: string): string => {
  // 1–2: reject empty + strip any directory components
  if (!filename || filename.trim().length === 0) {
    throw new InvalidVideoFilenameError();
  }
  const safeName = basename(filename);

  // 3: require .mp4
  if (!safeName.toLowerCase().endsWith(".mp4")) {
    throw new InvalidVideoFilenameError();
  }

  // 4–6: join, resolve, and confirm containment in the render directory
  const resolved = resolve(join(renderDirectory, safeName));
  if (isAbsolute(filename) || !resolved.startsWith(renderDirectory + sep)) {
    throw new InvalidVideoFilenameError();
  }

  // 7–8: existence + regular file
  if (!existsSync(resolved)) {
    throw new VideoNotFoundError();
  }
  const stats = statSync(resolved);
  if (!stats.isFile()) {
    throw new VideoNotFoundError();
  }

  return resolved;
};

export type RenderFileSummary = {
  filename: string;
  size: number;
  modifiedAt: string;
};

export const listRenderFiles = (): RenderFileSummary[] => {
  if (!existsSync(renderDirectory)) {
    return [];
  }
  return readdirSync(renderDirectory)
    .filter((entry) => entry.toLowerCase().endsWith(".mp4"))
    .map((entry) => {
      const fullPath = join(renderDirectory, entry);
      const stats = statSync(fullPath);
      if (!stats.isFile()) {
        return null;
      }
      return {
        filename: entry,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      };
    })
    .filter((entry): entry is RenderFileSummary => entry !== null)
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
};
