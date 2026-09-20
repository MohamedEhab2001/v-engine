// Validated server environment (spec §10, §49). The server fails fast at
// startup when anything required is missing — never continues with
// undefined secrets. Nothing else in the server reads process.env directly.

import { z } from "zod";
import { config as loadDotEnv } from "dotenv";

loadDotEnv();

const envSchema = z.object({
  FRONTEND_URL: z.string().url(),
  BACKEND_PORT: z.coerce.number().int().positive(),

  SESSION_SECRET: z.string().min(20),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  RENDER_OUTPUT_DIR: z.string().min(1),
  SQLITE_PATH: z.string().min(1),

  // Machine-to-machine key for media asset registration
  // (media-pipeline spec PART 6). Until it is set, registration endpoints
  // reject everything — the safe default.
  MEDIA_INGEST_API_KEY: z.string().min(16),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid server environment:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
