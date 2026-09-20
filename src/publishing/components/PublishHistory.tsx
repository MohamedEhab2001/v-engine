import React, { useEffect, useState } from "react";
import type { PublishJob } from "../api/publishing-api";
import { publishingApi } from "../api/publishing-api";

// Publish history (spec §35, §13): recent jobs with status and links.
export const PublishHistory: React.FC = () => {
  const [jobs, setJobs] = useState<PublishJob[]>([]);

  useEffect(() => {
    const load = () =>
      publishingApi
        .getPublishJobs()
        .then((response) => setJobs(response.jobs))
        .catch(() => setJobs([]));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (jobs.length === 0) {
    return (
      <div style={empty}>No publish jobs yet.</div>
    );
  }

  return (
    <div style={list}>
      {jobs.map((job) => (
        <div key={job.id} style={row}>
          <div style={rowMain}>
            <div style={rowTitle}>{job.title}</div>
            <div style={rowMeta}>
              {job.videoFilename} · {job.privacyStatus} ·{" "}
              {new Date(job.createdAt).toLocaleString()}
            </div>
          </div>
          <div style={statusStyle(job.status)}>{job.status}</div>
          {job.externalUrl ? (
            <a
              href={job.externalUrl}
              target="_blank"
              rel="noreferrer"
              style={link}
            >
              Watch
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const empty: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 14,
};
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  border: "1px solid #3F4147",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#1E1F22",
};
const rowMain: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};
const rowTitle: React.CSSProperties = {
  color: "#F2F3F5",
  fontWeight: 600,
  fontSize: 14,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const rowMeta: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 12,
  marginTop: 2,
};
const statusStyle = (status: string): React.CSSProperties => ({
  fontSize: 12,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  color:
    status === "PUBLISHED"
      ? "#3BA55C"
      : status === "FAILED"
        ? "#ED4245"
        : "#F0B232",
  border: `1px solid ${
    status === "PUBLISHED"
      ? "#3BA55C"
      : status === "FAILED"
        ? "#ED4245"
        : "#F0B232"
  }`,
});
const link: React.CSSProperties = {
  color: "#5865F2",
  fontSize: 13,
};
