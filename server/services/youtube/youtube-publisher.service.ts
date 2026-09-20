// YouTube upload adapter (spec §31, §32): implements SocialPublisher using
// the official googleapis client and videos.insert. Uploads run with the
// stored channel's credentials; the access token is refreshed transparently
// by the Google library.

import { createReadStream, statSync } from "node:fs";
import type { OAuth2Client } from "google-auth-library";
import {
  createOAuthClientWithCredentials,
  youtubeClient,
} from "./youtube-client.js";
import type { ConnectedAccountRepository } from "../../repositories/connected-account.repository.js";
import type {
  PublishRequest,
  PublishResult,
  SocialPublisher,
  ValidationResult,
} from "../publishing/publisher.interface.js";
import { resolveRenderFile } from "../renders/render-files.service.js";
import type { YouTubePrivacyStatus } from "../../types/publishing.js";

export class YouTubeUploadError extends Error {
  readonly code = "YOUTUBE_UPLOAD_FAILED";
  constructor() {
    super("Could not upload video to YouTube.");
  }
}

export class YouTubeNotConnectedError extends Error {
  readonly code = "YOUTUBE_NOT_CONNECTED";
  constructor() {
    super("YouTube is not connected.");
  }
}

export const youtubeVideoUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;

export const createYouTubePublisher = (
  accounts: ConnectedAccountRepository,
): SocialPublisher => {
  const loadClient = (): OAuth2Client => {
    const account = accounts.getYouTubeAccount();
    if (!account?.access_token) {
      throw new YouTubeNotConnectedError();
    }
    return createOAuthClientWithCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token ?? undefined,
      expiry_date: account.token_expiry ?? undefined,
    });
  };

  return {
    async validate(request: PublishRequest): Promise<ValidationResult> {
      const errors: string[] = [];

      if (!accounts.getYouTubeAccount()) {
        errors.push("YouTube is not connected.");
      }
      if (!request.title || request.title.trim().length === 0) {
        errors.push("Title is required.");
      }
      const privacy = request.privacyStatus as YouTubePrivacyStatus;
      if (!["private", "unlisted", "public"].includes(privacy)) {
        errors.push("Privacy status must be private, unlisted, or public.");
      }
      try {
        const path = resolveRenderFile(request.videoFilename);
        if (statSync(path).size <= 0) {
          errors.push("Rendered video file is empty.");
        }
      } catch {
        errors.push("Rendered video file not found.");
      }

      return { valid: errors.length === 0, errors };
    },

    async publish(request: PublishRequest): Promise<PublishResult> {
      const client = loadClient();
      const youtube = youtubeClient(client);
      const videoPath = resolveRenderFile(request.videoFilename);

      try {
        const response = await youtube.videos.insert(
          {
            part: ["snippet", "status"],
            requestBody: {
              snippet: {
                title: request.title,
                description: request.description ?? "",
              },
              status: {
                privacyStatus: request.privacyStatus,
              },
            },
            media: {
              body: createReadStream(videoPath),
            },
          },
          // Large vertical videos need a generous upload window.
          { timeout: 15 * 60 * 1000 },
        );

        const videoId = response.data.id;
        if (!videoId) {
          throw new YouTubeUploadError();
        }

        // Persist refreshed token metadata when the library rotated it
        // (spec §32 — never overwrite a stored refresh_token with null).
        const fresh = client.credentials;
        if (fresh.access_token) {
          accounts.upsertYouTubeAccount({
            externalAccountId: accounts.getYouTubeAccount()!
              .external_account_id,
            accountName: accounts.getYouTubeAccount()!.account_name,
            channelHandle: accounts.getYouTubeAccount()!.channel_handle,
            accessToken: fresh.access_token,
            refreshToken: fresh.refresh_token ?? null,
            tokenExpiry: fresh.expiry_date ?? null,
            scope: fresh.scope ?? null,
          });
        }

        return {
          externalId: videoId,
          url: youtubeVideoUrl(videoId),
          status: "PUBLISHED",
        };
      } catch (error) {
        if (error instanceof YouTubeUploadError) {
          throw error;
        }
        throw new YouTubeUploadError();
      }
    },
  };
};
