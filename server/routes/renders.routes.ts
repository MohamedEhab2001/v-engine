// Rendered-file routes (spec §28): list MP4s in the configured output dir.

import { Router } from "express";
import { listRenderFiles } from "../services/renders/render-files.service.js";

export const rendersRoutes = Router().get("/api/renders", (_request, response) => {
  response.json({ videos: listRenderFiles() });
});
