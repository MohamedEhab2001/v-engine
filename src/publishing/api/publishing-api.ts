// Frontend API layer (spec §38): the only place the publishing UI talks to
// the backend. No secrets here — only the public API URL. The URL constant
// is injected at build time (--define); when absent the UI talks to its own
// origin, which is how the bundle is normally served (from the backend
// itself). The typeof guard keeps an un-injected build from crashing.

const API_URL =
  typeof PUBLISHING_API_URL === "string" ? PUBLISHING_API_URL : "";

const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: { code: string; message: string } })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ?? `Request failed (${response.status})`,
    );
  }
  return payload as T;
};

export type YouTubeStatus = {
  connected: boolean;
  account: { id: number; channelId: string; name: string; handle: string | null } | null;
};

export type RenderVideo = {
  filename: string;
  size: number;
  modifiedAt: string;
};

export type PublishJob = {
  id: number;
  platform: string;
  videoFilename: string;
  title: string;
  description: string | null;
  privacyStatus: string;
  status: string;
  externalVideoId: string | null;
  externalUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type PublishResponse = {
  jobId: number;
  status: string;
  videoId: string;
  url: string;
};

export type MediaAsset = {
  id: number;
  scriptId: string;
  title: string | null;
  hook: string | null;
  cloudinaryUrl: string;
  thumbnailUrl: string | null;
  filename: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  status: string;
  createdAt: string;
};

export const publishingApi = {
  getBackendHealth: () =>
    request<{ ok: boolean }>("/api/health"),

  getYouTubeStatus: () =>
    request<YouTubeStatus>("/api/youtube/status"),

  connectYouTube: () => {
    // Browser navigation, not AJAX (spec §39).
    window.location.href = `${API_URL}/api/youtube/connect`;
  },

  disconnectYouTube: () =>
    request<{ connected: boolean }>("/api/youtube/connection", {
      method: "DELETE",
    }),

  getRenderedVideos: () =>
    request<{ videos: RenderVideo[] }>("/api/renders"),

  publishToYouTube: (body: {
    videoFilename: string;
    title: string;
    description?: string;
    privacyStatus: "private" | "unlisted" | "public";
  }) =>
    request<PublishResponse>("/api/publishing/youtube", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getPublishJobs: () => request<{ jobs: PublishJob[] }>("/api/publishing/jobs"),

  getPublishJob: (id: number) =>
    request<{ job: PublishJob }>(`/api/publishing/jobs/${id}`),

  getMediaAssets: () =>
    request<{ items: MediaAsset[] }>("/api/media-assets"),

  getMediaAsset: (id: number) =>
    request<{ asset: MediaAsset }>(`/api/media-assets/${id}`),
};

export const apiBaseUrl = API_URL;
