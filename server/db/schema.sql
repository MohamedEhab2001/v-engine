-- Publishing subsystem schema (spec §12–§15).

CREATE TABLE IF NOT EXISTS connected_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  platform TEXT NOT NULL,

  external_account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  channel_handle TEXT,

  access_token TEXT,
  refresh_token TEXT,
  token_expiry INTEGER,
  scope TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(platform, external_account_id)
);

CREATE TABLE IF NOT EXISTS publish_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  platform TEXT NOT NULL,
  account_id INTEGER NOT NULL,

  video_filename TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  privacy_status TEXT NOT NULL,

  status TEXT NOT NULL,

  external_post_id TEXT,
  external_url TEXT,

  error_message TEXT,

  attempt_count INTEGER NOT NULL DEFAULT 0,

  scheduled_at TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY(account_id)
    REFERENCES connected_accounts(id)
);

-- Media asset catalog (media-pipeline spec PART 3). Metadata only —
-- the video bytes live in Cloudinary. script_id is unique so registration
-- retries upsert instead of duplicating (spec: idempotent POST).
CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  script_id TEXT NOT NULL UNIQUE,

  title TEXT,

  hook TEXT,

  cloudinary_asset_id TEXT NOT NULL,

  cloudinary_public_id TEXT NOT NULL,

  cloudinary_url TEXT NOT NULL,

  thumbnail_url TEXT,

  filename TEXT NOT NULL,

  duration_seconds REAL,

  file_size_bytes INTEGER,

  status TEXT NOT NULL DEFAULT 'READY',

  created_at TEXT NOT NULL,

  updated_at TEXT NOT NULL
);
