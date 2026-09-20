// Local render queue persistence (media-pipeline spec PART 5, Step 9).
// SQLite so the queue survives restarts; COMPLETED jobs are never redone.

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { localEnv } from "../config/env.js";

export type LocalRenderJobStatus =
  | "PENDING"
  | "RENDERING"
  | "UPLOADING"
  | "REGISTERING"
  | "COMPLETED"
  | "RENDER_FAILED"
  | "UPLOAD_FAILED"
  | "REGISTERING_FAILED";

export type LocalRenderJobRow = {
  id: number;
  script_id: string;
  title: string | null;
  hook: string | null;
  status: string;
  attempts: number;
  error_message: string | null;
  output_filename: string | null;
  cloudinary_asset_id: string | null;
  cloudinary_public_id: string | null;
  cloudinary_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string;
};

export const initializeLocalDatabase = (): Database.Database => {
  const dbPath = localEnv.LOCAL_DB_PATH;
  const directory = dirname(dbPath);
  if (directory && !existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  const database = new Database(dbPath);
  database.pragma("journal_mode = WAL");
  database.exec(
    readFileSync(join("local", "db", "schema.sql"), "utf8"),
  );
  return database;
};

export type LocalDatabase = Database.Database;
