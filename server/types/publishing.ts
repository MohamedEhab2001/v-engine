// Publish job status + privacy enums (spec §16–§17).

export type PublishJobStatus =
  | "READY"
  | "PUBLISHING"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED"
  | "SCHEDULED";

export type YouTubePrivacyStatus = "private" | "unlisted" | "public";
