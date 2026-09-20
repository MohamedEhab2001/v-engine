// VPS registration client (media-pipeline spec PART 2, PART 6). Calls
// POST /api/media-assets on the publishing server with the machine API key.
// Runs in the local Node process only — the key is never exposed to React.

import { localEnv } from "../config/env.js";
import type { UploadedMediaAsset } from "./cloudinary.service.js";

export class RegistrationError extends Error {
  readonly code = "VPS_REGISTRATION_FAILED";
  constructor(message: string) {
    super(message);
  }
}

export type RegistrationPayload = {
  scriptId: string;
  title: string | null;
  hook: string | null;
  asset: UploadedMediaAsset;
};

export const registerMediaAsset = async (
  payload: RegistrationPayload,
): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(
      `${localEnv.PUBLISHING_SERVER_URL}/api/media-assets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localEnv.PUBLISHING_SERVER_API_KEY}`,
        },
        body: JSON.stringify({
          scriptId: payload.scriptId,
          title: payload.title,
          hook: payload.hook,
          cloudinaryAssetId: payload.asset.assetId,
          cloudinaryPublicId: payload.asset.publicId,
          cloudinaryUrl: payload.asset.secureUrl,
          filename: payload.asset.filename,
          durationSeconds: payload.asset.durationSeconds ?? null,
          fileSizeBytes: payload.asset.bytes ?? null,
        }),
      },
    );
  } catch {
    throw new RegistrationError(
      "Could not reach the publishing server.",
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
    } | null;
    throw new RegistrationError(
      body?.error?.message ??
        `Registration failed with status ${response.status}.`,
    );
  }
};
