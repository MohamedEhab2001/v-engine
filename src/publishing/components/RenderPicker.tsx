import React from "react";
import type { RenderVideo } from "../api/publishing-api";

// Rendered-video selector (spec §40): lists MP4s from GET /api/renders.
export const RenderPicker: React.FC<{
  videos: RenderVideo[];
  value: string;
  onChange: (filename: string) => void;
  disabled?: boolean;
}> = ({ videos, value, onChange, disabled }) => {
  return (
    <label style={field}>
      <span style={labelText}>Rendered Video</span>
      <select
        style={select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Select a video…</option>
        {videos.map((video) => (
          <option key={video.filename} value={video.filename}>
            {video.filename} ({(video.size / 1024 / 1024).toFixed(1)} MB)
          </option>
        ))}
      </select>
    </label>
  );
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
const select: React.CSSProperties = {
  background: "#1E1F22",
  color: "#F2F3F5",
  border: "1px solid #3F4147",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};
