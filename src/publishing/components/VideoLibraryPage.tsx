import React, { useCallback, useEffect, useRef, useState } from "react";
import { publishingApi } from "../api/publishing-api";

// Video Library (media-pipeline spec PART 4): the VPS catalog of rendered
// videos. Metadata comes from the VPS database; playback streams directly
// from Cloudinary — the VPS never stores video bytes.
// Cards open a custom lightbox player: seek bar with buffered progress,
// volume, playback speed, fullscreen, and keyboard shortcuts.

type LibraryItem = {
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

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatBytes = (bytes: number | null): string =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : "";

const VideoLightbox: React.FC<{
  item: LibraryItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.durationSeconds ?? 0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  // Autoplay on open (opening via click counts as a user gesture).
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        /* autoplay rejected — stay paused */
      });
    }
  }, []);

  // Keyboard shortcuts: Space play/pause, ←/→ ±5s, M mute, F fullscreen,
  // Escape closes (or leaves fullscreen first).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        video.paused ? video.play().catch(() => {}) : video.pause();
      } else if (event.key === "ArrowRight") {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        video.currentTime = Math.max(0, video.currentTime - 5);
      } else if (event.key.toLowerCase() === "m") {
        video.muted = !video.muted;
        setMuted(video.muted);
      } else if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (event.key === "Escape") {
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      shellRef.current?.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setCurrentTime(video.currentTime);
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  };

  const seekTo = (ratio: number) => {
    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = ratio * video.duration;
    }
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const bufferedRatio = duration > 0 ? buffered / duration : 0;

  return (
    <div
      style={overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div ref={shellRef} style={shell(fullscreen)}>
        <div style={metaBar}>
          <div style={metaMain}>
            <div style={metaTitle}>{item.title ?? item.scriptId}</div>
            {item.hook ? <div style={metaHook}>{item.hook}</div> : null}
          </div>
          <div style={metaRight}>
            {fullscreen ? (
              <span style={metaTime}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            ) : null}
            <button style={iconButton} onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <video
          ref={videoRef}
          src={item.cloudinaryUrl}
          autoPlay
          style={videoStyle(fullscreen)}
          onClick={() => videoRef.current?.paused
            ? videoRef.current.play().catch(() => {})
            : videoRef.current?.pause()}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={() =>
            setDuration(videoRef.current?.duration ?? duration)
          }
        />

        <div style={controls}>
          <button
            style={controlButton}
            title="Play/Pause (Space)"
            onClick={() =>
              videoRef.current?.paused
                ? videoRef.current.play().catch(() => {})
                : videoRef.current?.pause()
            }
          >
            {playing ? "⏸" : "▶"}
          </button>

          <span style={timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={seekTrack}>
            <div style={{ ...seekBuffered, width: `${bufferedRatio * 100}%` }} />
            <div style={{ ...seekPlayed, width: `${progressRatio * 100}%` }} />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(event) => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = Number(event.target.value);
                  setCurrentTime(Number(event.target.value));
                }
              }}
              style={seekInput}
              aria-label="Seek"
            />
          </div>

          <button
            style={controlButton}
            title="Mute (M)"
            onClick={() => {
              const video = videoRef.current;
              if (video) {
                video.muted = !video.muted;
                setMuted(video.muted);
              }
            }}
          >
            {muted || volume === 0 ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              setMuted(next === 0);
              if (videoRef.current) {
                videoRef.current.volume = next;
                videoRef.current.muted = next === 0;
              }
            }}
            style={volumeSlider}
            aria-label="Volume"
          />

          <select
            style={rateSelect}
            value={rate}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRate(next);
              if (videoRef.current) {
                videoRef.current.playbackRate = next;
              }
            }}
            aria-label="Playback speed"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
          </select>

          <button
            style={controlButton}
            title="Fullscreen (F)"
            onClick={toggleFullscreen}
          >
            {fullscreen ? "⤢" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const VideoLibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<LibraryItem | null>(null);

  useEffect(() => {
    publishingApi
      .getMediaAssets()
      .then((response) => setItems(response.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={muted}>Loading library…</div>;
  }
  if (error) {
    return <div style={{ ...muted, color: "#ED4245" }}>{error}</div>;
  }
  if (items.length === 0) {
    return <div style={muted}>No videos registered yet.</div>;
  }

  return (
    <>
      <div style={grid}>
        {items.map((item) => (
          <div key={item.id} style={card} onClick={() => setOpen(item)}>
            <div style={previewWrap}>
              <video
                src={item.cloudinaryUrl}
                preload="metadata"
                muted
                style={preview}
              />
              <div style={playOverlay}>▶</div>
            </div>
            <div style={body}>
              <div style={title}>{item.title ?? item.scriptId}</div>
              {item.hook ? <div style={hook}>{item.hook}</div> : null}
              <div style={meta}>
                {item.durationSeconds
                  ? `${Math.round(item.durationSeconds)}s · `
                  : ""}
                {formatBytes(item.fileSizeBytes)}
                {item.fileSizeBytes ? " · " : ""}
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <div style={rowEnd}>
                <span style={status(item.status)}>{item.status}</span>
                <button
                  style={watchButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(item);
                  }}
                >
                  ▶ Watch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open ? <VideoLightbox item={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
};

// ---------- styles ----------

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 18,
};
const card: React.CSSProperties = {
  border: "1px solid #3F4147",
  borderRadius: 14,
  overflow: "hidden",
  background: "#1E1F22",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
};
const previewWrap: React.CSSProperties = {
  position: "relative",
  height: 180,
  background: "#000",
};
const preview: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const playOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 42,
  color: "rgba(255, 255, 255, 0.9)",
  background: "rgba(0, 0, 0, 0.25)",
  opacity: 0,
  transition: "opacity 0.15s",
};
const body: React.CSSProperties = {
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
};
const title: React.CSSProperties = {
  color: "#F2F3F5",
  fontWeight: 700,
  fontSize: 15,
};
const hook: React.CSSProperties = {
  color: "#B5BAC1",
  fontSize: 13,
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const meta: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 12,
};
const rowEnd: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "auto",
};
const status = (status: string): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  padding: "3px 9px",
  borderRadius: 999,
  color: status === "READY" ? "#3BA55C" : "#949BA4",
  border: `1px solid ${status === "READY" ? "#3BA55C" : "#949BA4"}`,
});
const watchButton: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #5865F2",
  background: "#5865F2",
  color: "white",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const muted: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 14,
};

// lightbox styles

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.88)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};
const shell = (fullscreen: boolean): React.CSSProperties => ({
  width: fullscreen ? "100%" : "min(1080px, 96vw)",
  height: fullscreen ? "100%" : "auto",
  background: fullscreen ? "#000000" : "#1E1F22",
  borderRadius: fullscreen ? 0 : 16,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  border: fullscreen ? "none" : "1px solid #3F4147",
});
const metaBar: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 18px 10px",
};
const metaMain: React.CSSProperties = {
  minWidth: 0,
};
const metaTitle: React.CSSProperties = {
  color: "#F2F3F5",
  fontWeight: 700,
  fontSize: 17,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const metaHook: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 13,
  marginTop: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const metaRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexShrink: 0,
};
const metaTime: React.CSSProperties = {
  color: "#B5BAC1",
  fontSize: 13,
};
const videoStyle = (fullscreen: boolean): React.CSSProperties => ({
  width: "100%",
  maxHeight: fullscreen ? undefined : "72vh",
  flex: 1,
  background: "#000",
  display: "block",
  objectFit: "contain",
});
const controls: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 18px",
  background: "#111214",
};
const controlButton: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#F2F3F5",
  fontSize: 18,
  cursor: "pointer",
  padding: "4px 6px",
};
const timeText: React.CSSProperties = {
  color: "#B5BAC1",
  fontSize: 13,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};
const seekTrack: React.CSSProperties = {
  position: "relative",
  flex: 1,
  height: 8,
  borderRadius: 4,
  background: "#3F4147",
  minWidth: 120,
};
const seekBuffered: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 4,
  background: "#5a5d66",
};
const seekPlayed: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 4,
  background: "#5865F2",
};
const seekInput: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  opacity: 0,
  cursor: "pointer",
};
const volumeSlider: React.CSSProperties = {
  width: 80,
  accentColor: "#5865F2",
};
const rateSelect: React.CSSProperties = {
  background: "#1E1F22",
  color: "#F2F3F5",
  border: "1px solid #3F4147",
  borderRadius: 8,
  padding: "4px 6px",
  fontSize: 13,
};
const iconButton: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #3F4147",
  borderRadius: 8,
  color: "#F2F3F5",
  fontSize: 14,
  cursor: "pointer",
  padding: "4px 10px",
};
