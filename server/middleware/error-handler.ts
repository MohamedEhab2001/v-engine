// Central error handler (spec §45–§46): safe JSON errors only — no tokens,
// no secrets, no stack traces, no database paths.

import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const shaped =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { code: string; message: string })
      : null;

  const status =
    shaped?.code === "OAUTH_STATE_MISMATCH" ||
    shaped?.code === "OAUTH_CODE_EXCHANGE_FAILED" ||
    shaped?.code === "YOUTUBE_CHANNEL_NOT_FOUND"
      ? 400
      : 500;

  console.error(
    `[publishing] ${shaped?.code ?? "BACKEND_ERROR"}: ${
      shaped?.message ?? "Unexpected server error."
    }`,
  );

  response.status(status).json({
    error: shaped ?? {
      code: "BACKEND_ERROR",
      message: "Unexpected server error.",
    },
  });
};
