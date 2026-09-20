// Local production app environment (media-pipeline spec PART 1, PART 6).
// The local server drives rendering, Cloudinary upload, and VPS
// registration — its secrets never reach browser code.

import { z } from "zod";
import { config as loadDotEnv } from "dotenv";

loadDotEnv();

const envSchema = z.object({
  LOCAL_SERVER_PORT: z.coerce.number().int().positive().default(3002),
  LOCAL_DB_PATH: z.string().min(1).default("./data/local.sqlite"),
  STORIES_DIR: z.string().min(1).default("./stories"),
  RENDER_OUTPUT_DIR: z.string().min(1).default("./out"),

  // Cloudinary — optional at startup so the server still boots before
  // credentials exist; uploading without them fails the job with a clear
  // error (media-pipeline spec PART 1).
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  CLOUDINARY_VIDEO_FOLDER: z
    .string()
    .min(1)
    .default("content-engine/videos"),

  // VPS publishing server registration target.
  PUBLISHING_SERVER_URL: z.string().url(),
  PUBLISHING_SERVER_API_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid local environment:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const localEnv = parsed.data;

export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    localEnv.CLOUDINARY_CLOUD_NAME &&
      localEnv.CLOUDINARY_API_KEY &&
      localEnv.CLOUDINARY_API_SECRET,
  );
