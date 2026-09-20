import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { publishingApi, type RenderVideo, type YouTubeStatus } from "./api/publishing-api";
import { YouTubeConnectionCard } from "./components/YouTubeConnectionCard";
import { PublishPanel } from "./components/PublishPanel";
import { PublishHistory } from "./components/PublishHistory";
import { VideoLibraryPage } from "./components/VideoLibraryPage";

// Publishing settings + Video Library (media-pipeline spec PART 4).
// Built as a standalone bundle served by the backend at
// http://localhost:3001/ — no Vite/React app required.

// Simple hash routing: #/videos → Video Library, otherwise Publishing.
const useHashRoute = (): string => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash.replace(/^#/, "") || "publishing";
};

const Nav: React.FC<{ route: string }> = ({ route }) => (
  <nav style={nav}>
    <a href="#publishing" style={route !== "videos" ? navItemActive : navItem}>
      Publishing
    </a>
    <a href="#videos" style={route === "videos" ? navItemActive : navItem}>
      Video Library
    </a>
  </nav>
);

const PublishingPage: React.FC = () => {
  const [videos, setVideos] = useState<RenderVideo[]>([]);
  const [connected, setConnected] = useState(false);

  const loadVideos = () =>
    publishingApi
      .getRenderedVideos()
      .then((response) => setVideos(response.videos))
      .catch(() => setVideos([]));

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <>
      <div style={grid}>
        <div style={column}>
          <YouTubeConnectionCard
            onStatusChange={(status: YouTubeStatus) => {
              setConnected(status.connected);
              if (status.connected) {
                loadVideos();
              }
            }}
          />
        </div>

        <div style={column}>
          <PublishPanel
            videos={videos}
            connected={connected}
            onPublished={loadVideos}
          />
        </div>
      </div>

      <section>
        <h2 style={sectionTitle}>History</h2>
        <PublishHistory />
      </section>
    </>
  );
};

const Page: React.FC = () => {
  const route = useHashRoute();
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  const params = new URLSearchParams(window.location.search);
  const justConnected = params.get("connected");

  useEffect(() => {
    publishingApi
      .getBackendHealth()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  return (
    <div style={page}>
      <div style={header}>
        <h1 style={title}>Publishing</h1>
        <Nav route={route} />
        {backendOk === false ? (
          <span style={backendDown}>
            Backend unreachable — start it with <code>npm run dev:server</code>
          </span>
        ) : null}
        {justConnected === "1" ? (
          <span style={connectedBadge}>YouTube connected ✓</span>
        ) : null}
        {justConnected === "0" ? (
          <span style={errorBadge}>YouTube connection failed — try again.</span>
        ) : null}
      </div>

      {route === "videos" ? (
        <VideoLibraryPage />
      ) : (
        <PublishingPage />
      )}
    </div>
  );
};

const page: React.CSSProperties = {
  fontFamily:
    "'IBM Plex Sans Arabic', 'Segoe UI', system-ui, -apple-system, sans-serif",
  background: "#000000",
  minHeight: "100vh",
  margin: 0,
  padding: "32px 40px",
  boxSizing: "border-box",
  maxWidth: 1080,
};
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
  flexWrap: "wrap",
};
const title: React.CSSProperties = {
  color: "#F2F3F5",
  margin: 0,
  fontSize: 26,
};
const sectionTitle: React.CSSProperties = {
  color: "#F2F3F5",
  fontSize: 18,
  margin: "28px 0 12px",
};
const nav: React.CSSProperties = {
  display: "flex",
  gap: 6,
  background: "#1E1F22",
  borderRadius: 10,
  padding: 4,
};
const navItemBase: React.CSSProperties = {
  padding: "7px 16px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
};
const navItemActive: React.CSSProperties = {
  ...navItemBase,
  background: "#5865F2",
  color: "white",
};
const navItem: React.CSSProperties = {
  ...navItemBase,
  color: "#B5BAC1",
};
const backendDown: React.CSSProperties = {
  color: "#ED4245",
  fontSize: 14,
};
const connectedBadge: React.CSSProperties = {
  color: "#3BA55C",
  fontSize: 14,
  fontWeight: 600,
};
const errorBadge: React.CSSProperties = {
  color: "#ED4245",
  fontSize: 14,
  fontWeight: 600,
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.4fr)",
  gap: 20,
};
const column: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Page />);
}
