// Publishing API server (spec §49). Startup order: validate env → ensure
// data directory → initialize SQLite → create app → CORS → JSON → session →
// routes → error handler → listen. Secrets are never logged.

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import express from "express";
import session from "express-session";
import cors from "cors";
import { env } from "./config/env.js";
import { initializeDatabase } from "./db/database.js";
import { createConnectedAccountRepository } from "./repositories/connected-account.repository.js";
import { createPublishJobRepository } from "./repositories/publish-job.repository.js";
import { createOAuthClient } from "./services/youtube/youtube-client.js";
import { createYouTubePublisher } from "./services/youtube/youtube-publisher.service.js";
import { createPublishingService } from "./services/publishing/publishing.service.js";
import { healthRoutes } from "./routes/health.routes.js";
import { rendersRoutes } from "./routes/renders.routes.js";
import { createYouTubeRoutes } from "./routes/youtube.routes.js";
import { createPublishingRoutes } from "./routes/publishing.routes.js";
import { createMediaAssetRoutes } from "./routes/media-assets.routes.js";
import { createMediaAssetRepository } from "./repositories/media-asset.repository.js";
import { errorHandler } from "./middleware/error-handler.js";

// 1. env is validated on import (fails fast).

// 2–4. data directory + SQLite + schema.
const databaseDirectory = dirname(env.SQLITE_PATH);
if (databaseDirectory && !existsSync(databaseDirectory)) {
  mkdirSync(databaseDirectory, { recursive: true });
}
const database = initializeDatabase();

// 5–9. app + middleware + routes.
const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // local development; set true behind HTTPS
    },
  }),
);

const accounts = createConnectedAccountRepository(database);
const jobs = createPublishJobRepository(database);
const mediaAssets = createMediaAssetRepository(database);
const publisher = createYouTubePublisher(accounts);
const publishing = createPublishingService(publisher, accounts, jobs);

// Touch the OAuth client once so a broken Google config surfaces at startup.
createOAuthClient();

app.use(healthRoutes);
app.use(rendersRoutes);
app.use(createYouTubeRoutes(accounts));
app.use(createPublishingRoutes(accounts, jobs, publishing));
app.use(createMediaAssetRoutes(mediaAssets));

// Serve the built publishing UI.
app.use(express.static("server/public"));
app.get("/", (_request, response) => {
  response.sendFile("public/index.html", { root: "server" });
});

// 10–11. error handler + listen.
app.use(errorHandler);

app.listen(env.BACKEND_PORT, () => {
  console.log(
    `Publishing API listening on http://localhost:${env.BACKEND_PORT}`,
  );
});
