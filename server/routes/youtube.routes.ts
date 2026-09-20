// YouTube connection routes (spec §19–§24): connect → Google, callback,
// safe status, disconnect. OAuth responses never contain tokens.

import { Router } from "express";
import { env } from "../config/env.js";
import type { ConnectedAccountRepository } from "../repositories/connected-account.repository.js";
import {
  beginOAuth,
  completeOAuth,
  OAuthCodeExchangeError,
  OAuthStateMismatchError,
  YouTubeChannelNotFoundError,
} from "../services/youtube/youtube-oauth.service.js";
import { getConnectedChannel } from "../services/youtube/youtube-channel.service.js";

const frontendRedirect = (connected: boolean): string =>
  `${env.FRONTEND_URL}/settings/youtube?connected=${connected ? 1 : 0}`;

export const createYouTubeRoutes = (accounts: ConnectedAccountRepository) => {
  const routes = Router();

  routes.get("/api/youtube/connect", (request, response) => {
    response.redirect(beginOAuth(request));
  });

  routes.get("/api/youtube/callback", async (request, response, next) => {
    try {
      const code = request.query.code;
      const state = request.query.state;

      if (typeof code !== "string" || typeof state !== "string") {
        return response.redirect(frontendRedirect(false));
      }

      await completeOAuth(request, code, state, accounts);

      response.redirect(frontendRedirect(true));
    } catch (error) {
      if (
        error instanceof OAuthStateMismatchError ||
        error instanceof OAuthCodeExchangeError ||
        error instanceof YouTubeChannelNotFoundError
      ) {
        return next(error);
      }
      next(error);
    }
  });

  routes.get("/api/youtube/status", (_request, response) => {
    const channel = getConnectedChannel(accounts);
    response.json({
      connected: channel !== null,
      account: channel,
    });
  });

  routes.delete("/api/youtube/connection", (_request, response) => {
    accounts.deleteYouTubeAccount();
    response.json({ connected: false });
  });

  return routes;
};
