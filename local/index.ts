// Local production server (media-pipeline spec PART 5, PART 9-A): scripts
// registry, render queue, Cloudinary upload, VPS registration. Runs only on
// the local PC — never deployed.

import express from "express";
import { localEnv } from "./config/env.js";
import { initializeLocalDatabase } from "./db/database.js";
import { createRenderQueue } from "./queue/render-queue.js";
import { listStoryScripts } from "./services/scripts-registry.js";
import { ScriptNotFoundError } from "./queue/render-queue.js";
import {
  deleteStory,
  readStory,
  saveStory,
  StoryValidationError,
  validateStorySource,
} from "./services/scripts-store.js";

const database = initializeLocalDatabase();
const queue = createRenderQueue(database);

// Crash recovery: jobs caught mid-flight become retryable failures.
queue.recoverStaleJobs();

// Resume persisted PENDING work from where it left off (spec PART 5:
// restarting must not lose the queue — and must not restart from job 1;
// COMPLETED jobs are skipped by the queue itself).
queue.resume();

const app = express();
app.use(express.json({ limit: "4mb" }));

// Serve the local Scripts UI.
app.use(express.static("local/public"));
app.get("/", (_request, response) => {
  response.sendFile("public/index.html", { root: "local" });
});

app.get("/api/scripts", (_request, response) => {
  const scripts = listStoryScripts();
  const jobs = queue.listJobs();
  const jobByScript = new Map(jobs.map((job) => [job.script_id, job]));

  response.json({
    scripts: scripts.map((script) => {
      const job = jobByScript.get(script.scriptId);
      return {
        scriptId: script.scriptId,
        title: script.title,
        hook: script.hook,
        status: job?.status ?? "PENDING",
        errorMessage: job?.error_message ?? null,
        cloudinaryUrl: job?.cloudinary_url ?? null,
        attempts: job?.attempts ?? 0,
      };
    }),
    queue: {
      pending: jobs.filter((j) => j.status === "PENDING").length,
      active: jobs.filter((j) =>
        ["RENDERING", "UPLOADING", "REGISTERING"].includes(j.status),
      ).length,
      completed: jobs.filter((j) => j.status === "COMPLETED").length,
      failed: jobs.filter((j) => j.status.endsWith("_FAILED")).length,
    },
  });
});

app.post("/api/queue/render/:scriptId", (request, response) => {
  try {
    queue.enqueueScript(request.params.scriptId);
    response.json({ queued: true });
  } catch (error) {
    if (error instanceof ScriptNotFoundError) {
      return response
        .status(404)
        .json({ error: { code: "SCRIPT_NOT_FOUND", message: error.message } });
    }
    throw error;
  }
});

app.post("/api/queue/render-all", (_request, response) => {
  const added = queue.renderAll();
  response.json({ queued: added });
});

app.post("/api/queue/retry-failed", (_request, response) => {
  const count = queue.retryFailed();
  response.json({ retried: count });
});

app.post("/api/queue/retry/:scriptId", (request, response) => {
  queue.retryScript(request.params.scriptId);
  response.json({ queued: true });
});

app.get("/api/queue/jobs", (_request, response) => {
  response.json({ jobs: queue.listJobs() });
});

// ---------- Story authoring from the UI ----------

app.post("/api/scripts", (request, response) => {
  try {
    const content = request.body?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      return response.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "content is required." },
      });
    }
    const validated = validateStorySource(content);
    saveStory(validated);
    response.status(201).json({ scriptId: validated.scriptId });
  } catch (error) {
    if (error instanceof StoryValidationError) {
      return response
        .status(400)
        .json({ error: { code: "STORY_INVALID", message: error.message } });
    }
    throw error;
  }
});

app.get("/api/scripts/:scriptId/raw", (request, response) => {
  const content = readStory(request.params.scriptId);
  if (content === null) {
    return response.status(404).json({
      error: { code: "SCRIPT_NOT_FOUND", message: "Script not found." },
    });
  }
  response.json({ scriptId: request.params.scriptId, content });
});

app.put("/api/scripts/:scriptId", (request, response) => {
  try {
    const content = request.body?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      return response.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "content is required." },
      });
    }
    if (!readStory(request.params.scriptId)) {
      return response.status(404).json({
        error: { code: "SCRIPT_NOT_FOUND", message: "Script not found." },
      });
    }
    const validated = validateStorySource(content);
    saveStory(validated);
    // If the id changed, the old file is now stale — remove it.
    if (validated.scriptId !== request.params.scriptId) {
      deleteStory(request.params.scriptId);
    }
    response.json({ scriptId: validated.scriptId });
  } catch (error) {
    if (error instanceof StoryValidationError) {
      return response
        .status(400)
        .json({ error: { code: "STORY_INVALID", message: error.message } });
    }
    throw error;
  }
});

app.delete("/api/scripts/:scriptId", (request, response) => {
  const scriptId = request.params.scriptId;
  if (readStory(scriptId) === null) {
    return response.status(404).json({
      error: { code: "SCRIPT_NOT_FOUND", message: "Script not found." },
    });
  }
  deleteStory(scriptId);
  queue.deleteJob(scriptId);
  response.json({ deleted: true });
});

app.listen(localEnv.LOCAL_SERVER_PORT, () => {
  console.log(
    `Local production server listening on http://localhost:${localEnv.LOCAL_SERVER_PORT}`,
  );
});
