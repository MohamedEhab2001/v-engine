// SQLite bootstrap (spec §12): opens the database and applies the schema.
// The data directory is created on startup; the database file is gitignored
// (spec §14 — plaintext token storage is local-MVP only, never
// production-ready).

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { env } from "../config/env.js";

export const initializeDatabase = (): Database.Database => {
  const dbPath = env.SQLITE_PATH;
  const directory = dirname(dbPath);
  if (directory && !existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  const database = new Database(dbPath);
  database.pragma("journal_mode = WAL");
  database.exec(readFileSync(join("server", "db", "schema.sql"), "utf8"));
  return database;
};

export type PublishingDatabase = Database.Database;
