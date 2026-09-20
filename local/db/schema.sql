-- Local render queue schema (media-pipeline spec PART 5).
-- Cloudinary columns persist the upload result so a REGISTERING_FAILED job
-- can be retried without re-rendering or re-uploading (spec: failure
-- behavior). COMPLETED jobs are terminal and never re-enqueued.

CREATE TABLE IF NOT EXISTS render_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  script_id TEXT NOT NULL UNIQUE,

  title TEXT,
  hook TEXT,

  status TEXT NOT NULL DEFAULT 'PENDING',

  attempts INTEGER NOT NULL DEFAULT 0,

  error_message TEXT,

  output_filename TEXT,

  cloudinary_asset_id TEXT,
  cloudinary_public_id TEXT,
  cloudinary_url TEXT,

  duration_seconds REAL,
  file_size_bytes INTEGER,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
