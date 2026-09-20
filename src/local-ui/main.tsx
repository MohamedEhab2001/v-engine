import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Local Scripts page: batch render queue + story authoring from the UI.
// Add, edit, and delete scripts without touching the filesystem. Served by
// the local production server at http://localhost:3002/.

type ScriptInfo = {
  scriptId: string;
  title: string;
  hook: string | null;
  status: string;
  errorMessage: string | null;
  cloudinaryUrl: string | null;
  attempts: number;
};

type QueueSummary = {
  pending: number;
  active: number;
  completed: number;
  failed: number;
};

type EditorState = {
  mode: "new" | "edit";
  scriptId: string | null; // original id when editing
  content: string;
} | null;

const NEW_STORY_TEMPLATE = `{
  "id": "my-new-story",
  "settings": { "language": "ar", "direction": "rtl", "fps": 30 },
  "hook": {
    "text": "العنوان الرئيسي هنا",
    "highlights": ["هنا"]
  },
  "people": {
    "ahmed": { "name": "أحمد", "role": "مطور" }
  },
  "screens": [
    {
      "type": "messages",
      "speaker": "ahmed",
      "timestamp": "10:00 ص",
      "messages": [
        { "text": "الرسالة الأولى.", "state": "normal" },
        { "text": "والرسالة الأخيرة.", "state": "question" }
      ]
    }
  ]
}`;

const statusColor = (status: string): string => {
  if (status === "COMPLETED") {
    return "#3BA55C";
  }
  if (status.endsWith("_FAILED")) {
    return "#ED4245";
  }
  if (status === "PENDING") {
    return "#949BA4";
  }
  return "#F0B232"; // active stages
};

const ScriptsPage: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptInfo[]>([]);
  const [queue, setQueue] = useState<QueueSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/scripts");
      const data = await response.json();
      setScripts(data.scripts);
      setQueue(data.queue);
    } catch {
      /* keep last state */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const action = async (path: string) => {
    setBusy(true);
    try {
      await fetch(path, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const retryScript = async (scriptId: string) => {
    setBusy(true);
    try {
      await fetch(`/api/queue/retry/${scriptId}`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const openNew = () => {
    setEditor({ mode: "new", scriptId: null, content: NEW_STORY_TEMPLATE });
    setEditorContent(NEW_STORY_TEMPLATE);
    setEditorError(null);
  };

  const openEdit = async (scriptId: string) => {
    try {
      const response = await fetch(`/api/scripts/${scriptId}/raw`);
      if (!response.ok) {
        throw new Error("Could not load script.");
      }
      const data = await response.json();
      setEditor({ mode: "edit", scriptId, content: data.content });
      setEditorContent(data.content);
      setEditorError(null);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "Failed.");
    }
  };

  const save = async () => {
    if (!editor) {
      return;
    }
    setSaving(true);
    setEditorError(null);
    try {
      const path =
        editor.mode === "edit"
          ? `/api/scripts/${editor.scriptId}`
          : "/api/scripts";
      const response = await fetch(path, {
        method: editor.mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editorContent }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Save failed.");
      }
      setEditor(null);
      await load();
    } catch (error) {
      setEditorError(
        error instanceof Error ? error.message : "Save failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (scriptId: string) => {
    if (!window.confirm(`Delete script "${scriptId}"?`)) {
      return;
    }
    setBusy(true);
    try {
      await fetch(`/api/scripts/${scriptId}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={page}>
      <div style={header}>
        <h1 style={title}>
          Scripts <span style={count}>{scripts.length}</span>
        </h1>
        <div style={actions}>
          <button style={buttonGreen} disabled={busy} onClick={openNew}>
            + Add Script
          </button>
          <button style={buttonPrimary} disabled={busy} onClick={() => action("/api/queue/render-all")}>
            Render All
          </button>
          <button style={buttonSecondary} disabled={busy} onClick={() => action("/api/queue/retry-failed")}>
            Retry Failed
          </button>
        </div>
      </div>

      {queue ? (
        <div style={summary}>
          <span>Pending {queue.pending}</span>
          <span>Active {queue.active}</span>
          <span style={{ color: "#3BA55C" }}>Completed {queue.completed}</span>
          <span style={{ color: queue.failed ? "#ED4245" : "#949BA4" }}>
            Failed {queue.failed}
          </span>
        </div>
      ) : null}

      {editor ? (
        <div style={editorBox}>
          <div style={editorHeader}>
            <span style={editorTitle}>
              {editor.mode === "new" ? "New script" : `Edit ${editor.scriptId}`}
            </span>
            <button style={buttonSecondary} onClick={() => setEditor(null)}>
              Cancel
            </button>
          </div>
          <div style={muted}>
            Paste the story object (JSON or TypeScript). The id inside it
            becomes the script name — the import line is added automatically.
          </div>
          <textarea
            style={textarea}
            value={editorContent}
            onChange={(event) => setEditorContent(event.target.value)}
            spellCheck={false}
          />
          {editorError ? <div style={errorText}>{editorError}</div> : null}
          <div>
            <button style={buttonPrimary} disabled={saving} onClick={save}>
              {saving ? "Validating…" : "Save Script"}
            </button>
          </div>
        </div>
      ) : null}

      <div style={list}>
        {scripts.length === 0 && !editor ? (
          <div style={empty}>
            No scripts yet. Click <strong>+ Add Script</strong> to create your
            first story.
          </div>
        ) : null}

        {scripts.map((script) => {
          const failed = script.status.endsWith("_FAILED");
          const inProgress = ["RENDERING", "UPLOADING", "REGISTERING"].includes(
            script.status,
          );
          return (
            <div key={script.scriptId} style={card}>
              <div style={cardMain}>
                <div style={cardTitle}>{script.title}</div>
                {script.hook ? <div style={cardHook}>{script.hook}</div> : null}
                {script.errorMessage ? (
                  <div style={cardError}>{script.errorMessage}</div>
                ) : null}
              </div>
              <span style={statusBadge(script.status)}>{script.status}</span>
              <div style={cardButtons}>
                {inProgress ? (
                  <button style={buttonGhost} disabled>
                    …
                  </button>
                ) : script.status === "PENDING" ? (
                  <button
                    style={renderButton}
                    disabled={busy}
                    onClick={() => action(`/api/queue/render/${script.scriptId}`)}
                  >
                    Render
                  </button>
                ) : null}
                {failed ? (
                  <button
                    style={renderButton}
                    disabled={busy}
                    onClick={() => retryScript(script.scriptId)}
                  >
                    Retry
                  </button>
                ) : null}
                {script.cloudinaryUrl ? (
                  <a
                    href={script.cloudinaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={link}
                  >
                    Cloudinary
                  </a>
                ) : null}
                <button
                  style={buttonGhost}
                  disabled={busy}
                  onClick={() => openEdit(script.scriptId)}
                >
                  Edit
                </button>
                <button
                  style={buttonGhost}
                  disabled={busy}
                  onClick={() => remove(script.scriptId)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
  maxWidth: 900,
};
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 18,
  flexWrap: "wrap",
  gap: 12,
};
const title: React.CSSProperties = {
  color: "#F2F3F5",
  margin: 0,
  fontSize: 26,
};
const count: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 18,
  marginLeft: 6,
};
const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};
const buttonBase: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const buttonGreen: React.CSSProperties = {
  ...buttonBase,
  background: "#3BA55C",
  color: "white",
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
const buttonGhost: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #3F4147",
  background: "transparent",
  color: "#B5BAC1",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const summary: React.CSSProperties = {
  display: "flex",
  gap: 22,
  color: "#B5BAC1",
  fontSize: 13,
  marginBottom: 18,
};
const editorBox: React.CSSProperties = {
  border: "1px solid #5865F2",
  borderRadius: 12,
  padding: 18,
  marginBottom: 18,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  background: "#1E1F22",
};
const editorHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const editorTitle: React.CSSProperties = {
  color: "#F2F3F5",
  fontWeight: 700,
  fontSize: 15,
};
const textarea: React.CSSProperties = {
  fontFamily: "Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.5,
  minHeight: 280,
  background: "#111214",
  color: "#F2F3F5",
  border: "1px solid #3F4147",
  borderRadius: 10,
  padding: 12,
  resize: "vertical",
  direction: "ltr",
};
const errorText: React.CSSProperties = {
  color: "#ED4245",
  fontSize: 13,
};
const muted: React.CSSProperties = {
  color: "#949BA4",
  fontSize: 12,
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
const card: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  border: "1px solid #3F4147",
  borderRadius: 12,
  padding: "14px 18px",
  background: "#1E1F22",
  flexWrap: "wrap",
};
const cardMain: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
};
const cardTitle: React.CSSProperties = {
  color: "#F2F3F5",
  fontWeight: 700,
  fontSize: 15,
};
const cardHook: React.CSSProperties = {
  color: "#B5BAC1",
  fontSize: 13,
  marginTop: 3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const cardError: React.CSSProperties = {
  color: "#ED4245",
  fontSize: 12,
  marginTop: 4,
};
const cardButtons: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};
const statusBadge = (status: string): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  color: statusColor(status),
  border: `1px solid ${statusColor(status)}`,
  whiteSpace: "nowrap",
});
const renderButton: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #3F4147",
  background: "transparent",
  color: "#F2F3F5",
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const link: React.CSSProperties = {
  color: "#5865F2",
  fontSize: 12,
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<ScriptsPage />);
}
