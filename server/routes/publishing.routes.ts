// Publishing routes (spec §29, §35–§36, §45–§46): manual publish action,
// job history. Safe errors only — never tokens, secrets, or stack traces.

import { Router } from "express";
import { z } from "zod";
import type { ConnectedAccountRepository } from "../repositories/connected-account.repository.js";
import type { PublishJobRepository } from "../repositories/publish-job.repository.js";
import {
  PublishingValidationError,
  YouTubeNotConnectedError,
} from "../services/publishing/publishing.service.js";
import type { PublishingService } from "../services/publishing/publishing.service.js";
import {
  InvalidVideoFilenameError,
  VideoNotFoundError,
} from "../services/renders/render-files.service.js";
import {
  YouTubeNotConnectedError as YouTubeDisconnectedError,
  YouTubeUploadError,
} from "../services/youtube/youtube-publisher.service.js";

const publishRequestSchema = z.object({
  videoFilename: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  privacyStatus: z.enum(["private", "unlisted", "public"]),
});

const publishErrorResponse = (
  response: unknown,
): { code: string; message: string } | null => {
  if (typeof response !== "object" || response === null) {
    return null;
  }
  const candidate = response as { code?: unknown; message?: unknown };
  if (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  ) {
    return { code: candidate.code, message: candidate.message };
  }
  return null;
};

export const createPublishingRoutes = (
  accounts: ConnectedAccountRepository,
  jobs: PublishJobRepository,
  publishing: PublishingService,
) => {
  const routes = Router();

  routes.post(
    "/api/publishing/youtube",
    async (request, response, next) => {
      const parsed = publishRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid publish request.",
          },
        });
      }

      try {
        const result = await publishing.publishToYouTube(parsed.data);
        response.json(result);
      } catch (error) {
        if (error instanceof PublishingValidationError) {
          return response.status(400).json({
            error: { code: "VALIDATION_ERROR", message: error.errors.join(" ") },
          });
        }        if (
          error instanceof YouTubeNotConnectedError ||
          error instanceof YouTubeDisconnectedError
        ) {
          return response.status(409).json({
            error: { code: "YOUTUBE_NOT_CONNECTED", message: error.message },
          });
        }
        if (error instanceof YouTubeUploadError) {
          return response.status(502).json({
            error: { code: "YOUTUBE_UPLOAD_FAILED", message: error.message },
          });
        }
        if (
          error instanceof InvalidVideoFilenameError ||
          error instanceof VideoNotFoundError
        ) {
          const shaped = publishErrorResponse(error);
          return response.status(404).json({
            error:
              shaped ??
              { code: "VIDEO_NOT_FOUND", message: "Rendered video not found." },
          });
        }
        next(error);
      }
    },
  );

  routes.get("/api/publishing/jobs", (_request, response) => {
    response.json({
      jobs: jobs.listJobs().map((job) => ({
        id: job.id,
        platform: job.platform,
        videoFilename: job.video_filename,
        title: job.title,
        description: job.description,
        privacyStatus: job.privacy_status,
        status: job.status,
        externalVideoId: job.external_post_id,
        externalUrl: job.external_url,
        errorMessage: job.error_message,
        createdAt: job.created_at,
      })),
    });
  });

  routes.get("/api/publishing/jobs/:id", (request, response) => {
    const id = Number(request.params.id);
    const job = Number.isInteger(id) ? jobs.getJob(id) : undefined;
    if (!job) {
      return response.status(404).json({
        error: { code: "PUBLISH_JOB_NOT_FOUND", message: "Publish job not found." },
      });
    }
    response.json({
      job: {
        id: job.id,
        platform: job.platform,
        videoFilename: job.video_filename,
        title: job.title,
        description: job.description,
        privacyStatus: job.privacy_status,
        status: job.status,
        externalVideoId: job.external_post_id,
        externalUrl: job.external_url,
        errorMessage: job.error_message,
        createdAt: job.created_at,
      },
    });
  });

  void accounts;
  return routes;
};
