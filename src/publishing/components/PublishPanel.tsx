import React, { useState } from "react";
import { publishingApi, type RenderVideo } from "../api/publishing-api";
import { RenderPicker } from "./RenderPicker";

// Publish panel (spec §41–§43): metadata + privacy + the manual publish
// action, which is the human approval. Private is the default (spec §44).
export const PublishPanel: React.FC<{
  videos: RenderVideo[];
  connected: boolean;
  onPublished: () => void;
}> = ({ videos, connected, onPublished }) => {
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState<
    "private" | "unlisted" | "public"
  >("private");
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{
    videoId: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canPublish =
    connected && filename !== "" && title.trim() !== "" && !publishing;

  const publish = async () => {
    setPublishing(true);
    setError(null);
    setResult(null);
    try {
      const response = await publishingApi.publishToYouTube({
        videoFilename: filename,
        title: title.trim(),
        description: description.trim() || undefined,
        privacyStatus,
      });
      setResult({ videoId: response.videoId, url: response.url });
      onPublished();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Upload failed.",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={panel}>
      <RenderPicker videos={videos} value={filename} onChange={setFilename} disabled={publishing} />

      <label style={field}>
        <span style={labelText}>Title</span>
        <input
          style={input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={publishing}
        />
      </label>

      <label style={field}>
        <span style={labelText}>Description</span>
        <textarea
          style={{ ...input, minHeight: 70, resize: "vertical" }}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={publishing}
        />
      </label>

      <div style={field}>
        <span style={labelText}>Privacy</span>
        <div style={privacyRow}>
          {(["private", "unlisted", "public"] as const).map((option) => (
            <label key={option} style={privacyOption}>
              <input
                type="radio"
                name="privacy"
                checked={privacyStatus === option}
                onChange={() => setPrivacyStatus(option)}
                disabled={publishing}
              />
              <span style={{ textTransform: "capitalize" }}>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <button style={buttonPrimary} onClick={publish} disabled={!canPublish}>
        {publishing ? "Publishing…" : "Publish to YouTube"}
      </button>

      {!connected ? (
        <div style={muted}>Connect YouTube first to publish.</div>
      ) : null}

      {result ? (
        <div style={successBox}>
          <div style={{ fontWeight: 700, color: "#3BA55C" }}>Published ✓</div>
          <div style={muted}>YouTube Video ID: {result.videoId}</div>
          <a href={result.url} target="_blank" rel="noreferrer" style={link}>
            Open on YouTube
          </a>
        </div>
      ) : null}

      {error ? (
        <div style={errorBox}>
          <div style={{ fontWeight: 700, color: "#ED4245" }}>Upload failed</div>
          <div style={muted}>{error}</div>
          <button style={buttonSecondary} onClick={publish} disabled={publishing}>
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
};

const panel: React.CSSProperties = {
  border: "1px solid #3F4147",
  borderRadius: 16,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  background: "#1E1F22",
};
const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const labelText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#B5BAC1",
};
const input: React.CSSProperties = {
  background: "#111214",
  color: "#F2F3F5",
  border: "1px solid #3F4147",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
};
const privacyRow: React.CSSProperties = {
  display: "flex",
  gap: 20,
};
const privacyOption: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#F2F3F5",
  fontSize: 14,
  cursor: "pointer",
};
const buttonPrimary: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "#5865F2",
  color: "white",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};
const buttonSecondary: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #3F4147",
  background: "transparent",
  color: "#B5BAC1",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  alignSelf: "flex-start",
};
const successBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  border: "1px solid #3BA55C",
  borderRadius: 10,
  padding: 14,
};
const errorBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  border: "1px solid #ED4245",
  borderRadius: 10,
  padding: 14,
};
const link: React.CSSProperties = {
  color: "#5865F2",
};
const muted: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 13,
};
