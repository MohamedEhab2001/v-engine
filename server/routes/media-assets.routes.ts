// Media asset routes (media-pipeline spec PART 2–3, PART 6, §GET shapes):
// idempotent registration from the local production app, authenticated with
// a machine-to-machine bearer key. Responses carry safe catalog metadata —
// never Cloudinary secrets.

import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import type { MediaAssetRepository } from "../repositories/media-asset.repository.js";

const mediaAssetSchema = z.object({
  scriptId: z.string().min(1),
  title: z.string().nullable().optional(),
  hook: z.string().nullable().optional(),
  cloudinaryAssetId: z.string().min(1),
  cloudinaryPublicId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  thumbnailUrl: z.string().url().nullable().optional(),
  filename: z.string().min(1),
  durationSeconds: z.number().nonnegative().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
});

const shapeAsset = (row: {
  id: number;
  script_id: string;
  title: string | null;
  hook: string | null;
  cloudinary_url: string;
  thumbnail_url: string | null;
  filename: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  status: string;
  created_at: string;
}) => ({
  id: row.id,
  scriptId: row.script_id,
  title: row.title,
  hook: row.hook,
  cloudinaryUrl: row.cloudinary_url,
  thumbnailUrl: row.thumbnail_url,
  filename: row.filename,
  durationSeconds: row.duration_seconds,
  fileSizeBytes: row.file_size_bytes,
  status: row.status,
  createdAt: row.created_at,
});

export const requireIngestKey: import("express").RequestHandler = (
  request,
  response,
  next,
) => {
  const header = request.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token !== env.MEDIA_INGEST_API_KEY) {
    response
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Invalid ingest key." } });
    return;
  }
  next();
};

export const createMediaAssetRoutes = (assets: MediaAssetRepository) => {
  const routes = Router();

  routes.post(
    "/api/media-assets",
    requireIngestKey,
    (request, response) => {
      const parsed = mediaAssetSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid media asset payload.",
          },
        });
      }

      const data = parsed.data;
      const row = assets.upsertByScriptId({
        scriptId: data.scriptId,
        title: data.title ?? null,
        hook: data.hook ?? null,
        cloudinaryAssetId: data.cloudinaryAssetId,
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryUrl: data.cloudinaryUrl,
        thumbnailUrl: data.thumbnailUrl ?? null,
        filename: data.filename,
        durationSeconds: data.durationSeconds ?? null,
        fileSizeBytes: data.fileSizeBytes ?? null,
      });

      response.status(201).json({ asset: shapeAsset(row) });
    },
  );

  // The ingest key protects REGISTRATION only (spec PART 6). Reads are
  // catalog metadata for the publishing UI — same trust level as
  // /api/renders and /api/publishing/jobs — and carry no secrets.
  routes.get("/api/media-assets", (_request, response) => {
    response.json({ items: assets.list().map(shapeAsset) });
  });

  routes.get("/api/media-assets/:id", (request, response) => {
    const id = Number(request.params.id);
    const row = Number.isInteger(id) ? assets.getById(id) : undefined;
    if (!row) {
      return response.status(404).json({
        error: { code: "MEDIA_ASSET_NOT_FOUND", message: "Asset not found." },
      });
    }
    response.json({ asset: shapeAsset(row) });
  });

  return routes;
};
