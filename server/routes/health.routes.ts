// Health check (spec §37): lets React detect backend availability.

import { Router } from "express";

export const healthRoutes = Router().get("/api/health", (_request, response) => {
  response.json({ ok: true });
});
