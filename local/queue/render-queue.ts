// Sequential render queue (media-pipeline spec PART 5, Step 9–11).
//
// Pipeline per job: RENDERING → UPLOADING → REGISTERING → COMPLETED.
// - concurrency is 1: one job at a time, in enqueue order
// - state persists in SQLite; COMPLETED jobs are never redone
// - failed jobs retry from the FIRST unfinished stage:
//     RENDER_FAILED        → re-render
//     UPLOAD_FAILED        → re-upload if the MP4 still exists
//     REGISTERING_FAILED   → re-register using the stored Cloudinary asset
// - a crashed RENDERING/UPLOADING/REGISTERING job is reset to its failed
//   state on startup so it can be retried safely

import { localEnv } from "../config/env.js";
import { basename } from "node:path";
import type { LocalDatabase, LocalRenderJobRow } from "../db/database.js";
import { uploadRenderedVideo } from "../services/cloudinary.service.js";
import { registerMediaAsset } from "../services/registration.client.js";
import {
  getRenderJobPaths,
  probeDurationSeconds,
  renderStory,
} from "../services/renderer.js";
import {
  listStoryScripts,
  loadStoryMetadata,
} from "../services/scripts-registry.js";

export class ScriptNotFoundError extends Error {
  readonly code = "SCRIPT_NOT_FOUND";
  constructor(scriptId: string) {
    super(`Script "${scriptId}" was not found in ${"stories"}/.`);
  }
}

const now = () => new Date().toISOString();

export const createRenderQueue = (database: LocalDatabase) => {
  const statements = {
    insert: database.prepare(
      `INSERT INTO render_jobs
         (script_id, title, hook, status, attempts, created_at, updated_at)
       VALUES (?, ?, ?, 'PENDING', 0, ?, ?)
       ON CONFLICT(script_id) DO NOTHING`,
    ),
    all: database.prepare<[], LocalRenderJobRow>("SELECT * FROM render_jobs ORDER BY id ASC"),
    get: database.prepare<[string], LocalRenderJobRow>("SELECT * FROM render_jobs WHERE script_id = ?"),
    setStatus: database.prepare(
      "UPDATE render_jobs SET status = ?, error_message = NULL, updated_at = ? WHERE script_id = ?",
    ),
    fail: database.prepare(
      `UPDATE render_jobs SET status = ?, error_message = ?,
         attempts = attempts + 1, updated_at = ? WHERE script_id = ?`,
    ),
    setOutput: database.prepare(
      `UPDATE render_jobs SET output_filename = ?, duration_seconds = ?,
         file_size_bytes = ?, updated_at = ? WHERE script_id = ?`,
    ),
    setCloudinary: database.prepare(
      `UPDATE render_jobs SET cloudinary_asset_id = ?, cloudinary_public_id = ?,
         cloudinary_url = ?, updated_at = ? WHERE script_id = ?`,
    ),
    resetStale: database.prepare(
      `UPDATE render_jobs SET status = ? , error_message = ?, updated_at = ?
         WHERE status = ?`,
    ),
  };

  // Startup recovery (spec PART 5, persistent queue state): a job that was
  // mid-flight when the process died becomes a FAILED job of the stage it
  // was in — retryable, never silently re-run.
  const recoverStaleJobs = (): void => {
    const stamp = now();
    statements.resetStale.run("RENDER_FAILED", "Interrupted by restart.", stamp, "RENDERING");
    statements.resetStale.run("UPLOAD_FAILED", "Interrupted by restart.", stamp, "UPLOADING");
    statements.resetStale.run("REGISTERING_FAILED", "Interrupted by restart.", stamp, "REGISTERING");
  };

  let processing = false;
  let kickPending = false;

  const processNext = async (): Promise<void> => {
    const job = statements.all.all().find(
      (candidate) => candidate.status === "PENDING",
    );
    if (!job) {
      return;
    }

    try {
      // ---------- 1. RENDER (skipped when the MP4 is already on disk) ----------
      const paths = getRenderJobPaths(job.script_id);
      if (!paths.exists) {
        statements.setStatus.run("RENDERING", now(), job.script_id);
        try {
          const storyFile = listStoryScripts().find(
            (s) => s.scriptId === job.script_id,
          );
          if (!storyFile) {
            throw new Error(
              `Script "${job.script_id}" no longer exists in stories/.`,
            );
          }
          await renderStory(
            job.script_id,
            `${localEnv.STORIES_DIR}/${storyFile.filename}`,
          );
        } catch (error) {
          statements.fail.run(
            "RENDER_FAILED",
            error instanceof Error ? error.message : "Render failed.",
            now(),
            job.script_id,
          );
          return;
        }
      }
      const fresh = getRenderJobPaths(job.script_id);
      if (!fresh.exists) {
        statements.fail.run(
          "RENDER_FAILED",
          "Rendered MP4 is missing from the output directory.",
          now(),
          job.script_id,
        );
        return;
      }

      // ---------- 2. UPLOAD (skipped when Cloudinary data is persisted) ----------
      if (!job.cloudinary_url) {
        statements.setStatus.run("UPLOADING", now(), job.script_id);
        try {
          const asset = await uploadRenderedVideo(
            fresh.outputPath,
            job.script_id,
          );
          statements.setCloudinary.run(
            asset.assetId,
            asset.publicId,
            asset.secureUrl,
            now(),
            job.script_id,
          );
          statements.setOutput.run(
            basename(fresh.outputPath),
            asset.durationSeconds ?? probeDurationSeconds(fresh.outputPath),
            asset.bytes ?? fresh.sizeBytes,
            now(),
            job.script_id,
          );
        } catch (error) {
          statements.fail.run(
            "UPLOAD_FAILED",
            error instanceof Error ? error.message : "Upload failed.",
            now(),
            job.script_id,
          );
          return;
        }
      }

      // ---------- 3. REGISTER ----------
      const uploaded = statements.get.get(job.script_id);
      if (!uploaded?.cloudinary_url) {
        statements.fail.run(
          "REGISTERING_FAILED",
          "Cloudinary result missing before registration.",
          now(),
          job.script_id,
        );
        return;
      }
      statements.setStatus.run("REGISTERING", now(), job.script_id);
      try {
        await registerMediaAsset({
          scriptId: job.script_id,
          title: job.title,
          hook: job.hook,
          asset: {
            assetId:
              uploaded.cloudinary_asset_id ??
              uploaded.cloudinary_public_id ??
              "",
            publicId: uploaded.cloudinary_public_id ?? "",
            secureUrl: uploaded.cloudinary_url,
            filename: `${job.script_id}.mp4`,
            durationSeconds: uploaded.duration_seconds ?? undefined,
            bytes: uploaded.file_size_bytes ?? undefined,
          },
        });
      } catch (error) {
        statements.fail.run(
          "REGISTERING_FAILED",
          error instanceof Error ? error.message : "Registration failed.",
          now(),
          job.script_id,
        );
        return;
      }

      statements.setStatus.run("COMPLETED", now(), job.script_id);
    } finally {
      // chain: keep draining the queue while PENDING jobs remain
      void kick();
    }
  };

  const kick = async (): Promise<void> => {
    if (processing) {
      kickPending = true;
      return;
    }
    processing = true;
    try {
      do {
        kickPending = false;
        await processNext();
      } while (kickPending);
    } finally {
      processing = false;
    }
  };

  return {
    recoverStaleJobs,

    /** Resume persisted PENDING jobs after a restart (no re-render of
     * completed work — the processor skips those by design). */
    resume: (): void => {
      void kick();
    },

    enqueueScript: (scriptId: string): void => {
      const metadata = loadStoryMetadata(scriptId);
      if (!metadata) {
        throw new ScriptNotFoundError(scriptId);
      }
      statements.insert.run(scriptId, metadata.title, metadata.hook, now(), now());
      void kick();
    },

    renderAll: (): number => {
      const scripts = listAllScriptsSafe();
      let added = 0;
      const stamp = now();
      for (const script of scripts) {
        const existing = statements.get.get(script.scriptId);
        if (existing && existing.status === "COMPLETED") {
          continue; // never duplicate completed work (spec Render All)
        }
        if (!existing) {
          statements.insert.run(
            script.scriptId,
            script.title,
            script.hook,
            stamp,
            stamp,
          );
          added++;
        }
      }
      void kick();
      return added;
    },

    retryFailed: (): number => {
      const failedStatuses = [
        "RENDER_FAILED",
        "UPLOAD_FAILED",
        "REGISTERING_FAILED",
        "RENDERING",
        "UPLOADING",
        "REGISTERING",
      ];
      const stamp = now();
      let count = 0;
      for (const status of failedStatuses) {
        const result = database
          .prepare(
            "UPDATE render_jobs SET status = 'PENDING', error_message = NULL, updated_at = ? WHERE status = ?",
          )
          .run(stamp, status);
        count += result.changes;
      }
      void kick();
      return count;
    },

    retryScript: (scriptId: string): void => {
      const job = statements.get.get(scriptId);
      if (!job || job.status === "COMPLETED" || job.status === "PENDING") {
        return;
      }
      statements.setStatus.run("PENDING", now(), scriptId);
      void kick();
    },

    listJobs: (): LocalRenderJobRow[] => statements.all.all(),
    getJob: (scriptId: string): LocalRenderJobRow | undefined =>
      statements.get.get(scriptId),
    deleteJob: (scriptId: string): void => {
      database
        .prepare("DELETE FROM render_jobs WHERE script_id = ?")
        .run(scriptId);
    },
  };
};

const listAllScriptsSafe = (): Array<{
  scriptId: string;
  title: string;
  hook: string | null;
}> => {
  try {
    // Lazy require avoids a cycle with scripts-registry.
    const registry =
      require("../services/scripts-registry.js") as typeof import("../services/scripts-registry.js");
    return registry.listStoryScripts();
  } catch {
    return [];
  }
};

export type RenderQueue = ReturnType<typeof createRenderQueue>;
