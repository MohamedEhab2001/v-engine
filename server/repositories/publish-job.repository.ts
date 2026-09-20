// Publish job persistence (spec §34, §15, §16).

import type { PublishingDatabase } from "../db/database.js";
import type { PublishJobStatus, YouTubePrivacyStatus } from "../types/publishing.js";

export type PublishJobRow = {
  id: number;
  platform: string;
  account_id: number;
  video_filename: string;
  title: string;
  description: string | null;
  privacy_status: string;
  status: string;
  external_post_id: string | null;
  external_url: string | null;
  error_message: string | null;
  attempt_count: number;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateJobData = {
  accountId: number;
  videoFilename: string;
  title: string;
  description: string | null;
  privacyStatus: YouTubePrivacyStatus;
};

export const createPublishJobRepository = (database: PublishingDatabase) => {
  const now = () => new Date().toISOString();

  const createJob = (data: CreateJobData): PublishJobRow => {
    const timestamp = now();
    const result = database
      .prepare(
        `INSERT INTO publish_jobs
           (platform, account_id, video_filename, title, description,
            privacy_status, status, attempt_count, created_at, updated_at)
         VALUES ('youtube', ?, ?, ?, ?, ?, 'READY', 0, ?, ?)`,
      )
      .run(
        data.accountId,
        data.videoFilename,
        data.title,
        data.description,
        data.privacyStatus,
        timestamp,
        timestamp,
      );
    return getJob(Number(result.lastInsertRowid)) as PublishJobRow;
  };

  const updateStatus = (id: number, status: PublishJobStatus): void => {
    database
      .prepare("UPDATE publish_jobs SET status = ?, updated_at = ? WHERE id = ?")
      .run(status, now(), id);
  };

  const markPublished = (
    id: number,
    externalId: string,
    url: string,
  ): void => {
    database
      .prepare(
        `UPDATE publish_jobs
         SET status = 'PUBLISHED', external_post_id = ?, external_url = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .run(externalId, url, now(), id);
  };

  const markFailed = (id: number, error: string): void => {
    database
      .prepare(
        `UPDATE publish_jobs
         SET status = 'FAILED', error_message = ?,
             attempt_count = attempt_count + 1, updated_at = ?
         WHERE id = ?`,
      )
      .run(error, now(), id);
  };

  const getJob = (id: number): PublishJobRow | undefined =>
    database.prepare("SELECT * FROM publish_jobs WHERE id = ?").get(id) as
      | PublishJobRow
      | undefined;

  const listJobs = (): PublishJobRow[] =>
    database
      .prepare("SELECT * FROM publish_jobs ORDER BY id DESC LIMIT 100")
      .all() as PublishJobRow[];

  return {
    createJob,
    updateStatus,
    markPublished,
    markFailed,
    getJob,
    listJobs,
  };
};

export type PublishJobRepository = ReturnType<typeof createPublishJobRepository>;
