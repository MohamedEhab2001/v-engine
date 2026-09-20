// Publisher abstraction (spec §18). Phase 1 implements YouTubePublisher
// only; future platform adapters implement the same interface.

export type PublishRequest = {
  videoFilename: string;
  title: string;
  description?: string;
  privacyStatus: "private" | "unlisted" | "public";
};

export type PublishResult = {
  externalId: string;
  url: string;
  status: "PUBLISHED" | "PROCESSING";
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export interface SocialPublisher {
  validate(request: PublishRequest): Promise<ValidationResult>;
  publish(request: PublishRequest): Promise<PublishResult>;
}
