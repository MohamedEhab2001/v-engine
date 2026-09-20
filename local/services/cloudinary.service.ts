// Cloudinary upload service (media-pipeline spec PART 1). Server-side only
// — the API secret must never appear in browser code. Upload results are
// normalized to UploadedMediaAsset; the raw Cloudinary response does not
// travel through the rest of the app.

import { v2 as cloudinary } from "cloudinary";
import { statSync } from "node:fs";
import { basename } from "node:path";
import { localEnv, isCloudinaryConfigured } from "../config/env.js";

export type UploadedMediaAsset = {
  assetId: string;
  publicId: string;
  secureUrl: string;
  filename: string;
  durationSeconds?: number;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
};

export class CloudinaryNotConfiguredError extends Error {
  readonly code = "CLOUDINARY_NOT_CONFIGURED";
  constructor() {
    super(
      "Cloudinary is not configured. Fill CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env.",
    );
  }
}

export class CloudinaryUploadError extends Error {
  readonly code = "CLOUDINARY_UPLOAD_FAILED";
  constructor() {
    super("Cloudinary upload failed.");
  }
}

// Configure once per process.
let configured = false;
const ensureConfigured = (): void => {
  if (!isCloudinaryConfigured()) {
    throw new CloudinaryNotConfiguredError();
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: localEnv.CLOUDINARY_CLOUD_NAME,
      api_key: localEnv.CLOUDINARY_API_KEY,
      api_secret: localEnv.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
};

/**
 * Uploads a rendered MP4 into the configured Cloudinary folder with a
 * stable public ID derived from the script ID, e.g.
 *   scriptId: performance-review-story
 *   publicId: content-engine/videos/performance-review-story
 * Overwrite is intentional so re-uploads for the same script are idempotent.
 */
export const uploadRenderedVideo = async (
  videoPath: string,
  scriptId: string,
): Promise<UploadedMediaAsset> => {
  ensureConfigured();

  const publicId = `${localEnv.CLOUDINARY_VIDEO_FOLDER}/${scriptId}`;

  try {
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: "video",
      public_id: publicId,
      overwrite: true,
      invalidate: true,
    });

    return {
      assetId: result.asset_id ?? result.public_id,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      filename: basename(videoPath),
      durationSeconds: result.duration,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    if (error instanceof CloudinaryNotConfiguredError) {
      throw error;
    }
    throw new CloudinaryUploadError();
  }
};

export const getRenderedFileSize = (videoPath: string): number | null => {
  try {
    return statSync(videoPath).size;
  } catch {
    return null;
  }
};
