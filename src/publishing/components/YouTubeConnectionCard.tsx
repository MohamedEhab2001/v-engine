import React, { useEffect, useState } from "react";
import { publishingApi, type YouTubeStatus } from "../api/publishing-api";

// YouTube connection card (spec §39). Connect uses browser navigation to the
// backend OAuth entry point — never AJAX, never tokens in the UI.
export const YouTubeConnectionCard: React.FC<{
  onStatusChange: (status: YouTubeStatus) => void;
}> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<YouTubeStatus | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    publishingApi
      .getYouTubeStatus()
      .then((next) => {
        setStatus(next);
        onStatusChange(next);
      })
      .catch(() => setStatus({ connected: false, account: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = async () => {
    setWorking(true);
    try {
      await publishingApi.disconnectYouTube();
      const next = await publishingApi.getYouTubeStatus();
      setStatus(next);
      onStatusChange(next);
    } finally {
      setWorking(false);
    }
  };

  if (!status) {
    return null;
  }

  return (
    <div style={card}>
      <div style={cardHeader}>YouTube</div>

      {status.connected && status.account ? (
        <>
          <div style={connectedRow}>
            <span style={check}>✓</span>
            <div>
              <div style={channelName}>{status.account.name}</div>
              <div style={muted}>
                {status.account.handle ?? status.account.channelId}
              </div>
            </div>
          </div>
          <button style={buttonSecondary} onClick={disconnect} disabled={working}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <div style={muted}>Not connected</div>
          <button
            style={buttonPrimary}
            onClick={() => publishingApi.connectYouTube()}
          >
            Connect YouTube
          </button>
        </>
      )}
    </div>
  );
};

const card: React.CSSProperties = {
  border: "1px solid #3F4147",
  borderRadius: 16,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#1E1F22",
};
const cardHeader: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#F2F3F5",
};
const connectedRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};
const check: React.CSSProperties = {
  color: "#3BA55C",
  fontSize: 22,
};
const channelName: React.CSSProperties = {
  fontWeight: 600,
  color: "#F2F3F5",
};
const muted: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 14,
};
const buttonBase: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  alignSelf: "flex-start",
};
const buttonPrimary: React.CSSProperties = {
  ...buttonBase,
  background: "#5865F2",
  color: "white",
};
const buttonSecondary: React.CSSProperties = {
  ...buttonBase,
  background: "transparent",
  color: "#B5BAC1",
  border: "1px solid #3F4147",
};
