// Media asset persistence (media-pipeline spec PART 3): metadata-only
// catalog of videos stored in Cloudinary. Upsert by script_id keeps
// registration retries idempotent.

import type { PublishingDatabase } from "../db/database.js";

export type MediaAssetRow = {
  id: number;
  script_id: string;
  title: string | null;
  hook: string | null;
  cloudinary_asset_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  thumbnail_url: string | null;
  filename: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type UpsertMediaAssetData = {
  scriptId: string;
  title: string | null;
  hook: string | null;
  cloudinaryAssetId: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  thumbnailUrl: string | null;
  filename: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
};

export const createMediaAssetRepository = (database: PublishingDatabase) => {
  const upsertByScriptId = (data: UpsertMediaAssetData): MediaAssetRow => {
    const now = new Date().toISOString();
    database
      .prepare(
        `INSERT INTO media_assets
           (script_id, title, hook, cloudinary_asset_id, cloudinary_public_id,
            cloudinary_url, thumbnail_url, filename, duration_seconds,
            file_size_bytes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'READY', ?, ?)
         ON CONFLICT(script_id) DO UPDATE SET
           title = excluded.title,
           hook = excluded.hook,
           cloudinary_asset_id = excluded.cloudinary_asset_id,
           cloudinary_public_id = excluded.cloudinary_public_id,
           cloudinary_url = excluded.cloudinary_url,
           thumbnail_url = excluded.thumbnail_url,
           filename = excluded.filename,
           duration_seconds = excluded.duration_seconds,
           file_size_bytes = excluded.file_size_bytes,
           status = 'READY',
           updated_at = excluded.updated_at`,
      )
      .run(
        data.scriptId,
        data.title,
        data.hook,
        data.cloudinaryAssetId,
        data.cloudinaryPublicId,
        data.cloudinaryUrl,
        data.thumbnailUrl,
        data.filename,
        data.durationSeconds,
        data.fileSizeBytes,
        now,
        now,
      );

    return database
      .prepare("SELECT * FROM media_assets WHERE script_id = ?")
      .get(data.scriptId) as MediaAssetRow;
  };

  const getById = (id: number): MediaAssetRow | undefined =>
    database.prepare("SELECT * FROM media_assets WHERE id = ?").get(id) as
      | MediaAssetRow
      | undefined;

  const getByScriptId = (scriptId: string): MediaAssetRow | undefined =>
    database
      .prepare("SELECT * FROM media_assets WHERE script_id = ?")
      .get(scriptId) as MediaAssetRow | undefined;

  const list = (): MediaAssetRow[] =>
    database
      .prepare("SELECT * FROM media_assets ORDER BY id DESC LIMIT 500")
      .all() as MediaAssetRow[];

  return { upsertByScriptId, getById, getByScriptId, list };
};

export type MediaAssetRepository = ReturnType<typeof createMediaAssetRepository>;
