// Publishing orchestration (spec §29–§30): validate → create job → upload →
// store result. Every outcome is persisted — the job record is never lost.

import type {
  ConnectedAccountRepository,
} from "../../repositories/connected-account.repository.js";
import type { PublishJobRepository } from "../../repositories/publish-job.repository.js";
import type { PublishRequest, SocialPublisher } from "./publisher.interface.js";

export class YouTubeNotConnectedError extends Error {
  readonly code = "YOUTUBE_NOT_CONNECTED";
  constructor() {
    super("YouTube is not connected.");
  }
}

export class PublishingValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly errors: string[];
  constructor(errors: string[]) {
    super("Publish request failed validation.");
    this.errors = errors;
  }
}

export const createPublishingService = (
  publisher: SocialPublisher,
  accounts: ConnectedAccountRepository,
  jobs: PublishJobRepository,
) => {
  const publishToYouTube = async (request: PublishRequest) => {
    const account = accounts.getYouTubeAccount();
    if (!account) {
      throw new YouTubeNotConnectedError();
    }

    const validation = await publisher.validate(request);
    if (!validation.valid) {
      throw new PublishingValidationError(validation.errors);
    }

    const job = jobs.createJob({
      accountId: account.id,
      videoFilename: request.videoFilename,
      title: request.title,
      description: request.description ?? null,
      privacyStatus: request.privacyStatus,
    });

    try {
      jobs.updateStatus(job.id, "PUBLISHING");

      const result = await publisher.publish(request);

      jobs.markPublished(job.id, result.externalId, result.url);

      return {
        jobId: job.id,
        status: result.status,
        videoId: result.externalId,
        url: result.url,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not upload video to YouTube.";
      jobs.markFailed(job.id, message);
      throw error;
    }
  };

  return { publishToYouTube };
};

export type PublishingService = ReturnType<typeof createPublishingService>;
