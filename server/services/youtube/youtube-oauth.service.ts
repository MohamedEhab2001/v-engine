// YouTube OAuth service (spec §19–§22, §32): authorization URL with CSRF
// state, callback code exchange, and channel verification. Tokens never
// leave this layer except into the database.

import { randomBytes } from "node:crypto";
import type { Request } from "express";
import { google } from "googleapis";
import { createOAuthClient, OAUTH_SCOPES } from "./youtube-client.js";
import {
  createConnectedAccountRepository,
} from "../../repositories/connected-account.repository.js";
import type { ConnectedAccountRepository } from "../../repositories/connected-account.repository.js";

export class OAuthStateMismatchError extends Error {
  readonly code = "OAUTH_STATE_MISMATCH";
  constructor() {
    super("OAuth state validation failed.");
  }
}

export class OAuthCodeExchangeError extends Error {
  readonly code = "OAUTH_CODE_EXCHANGE_FAILED";
  constructor() {
    super("Could not exchange the OAuth authorization code.");
  }
}

export class YouTubeChannelNotFoundError extends Error {
  readonly code = "YOUTUBE_CHANNEL_NOT_FOUND";
  constructor() {
    super("No YouTube channel is associated with this Google account.");
  }
}

const SESSION_STATE_KEY = "youtube_oauth_state";

export const beginOAuth = (request: Request): string => {
  const client = createOAuthClient();
  const state = randomBytes(24).toString("hex");

  request.session[SESSION_STATE_KEY] = state;

  return client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    prompt: "consent",
    scope: [...OAUTH_SCOPES],
    state,
  });
};

export type CompletedOAuth = {
  accountId: number;
  channelId: string;
  channelName: string;
  channelHandle: string | null;
};

export const completeOAuth = async (
  request: Request,
  code: string,
  state: string,
  accounts: ConnectedAccountRepository,
): Promise<CompletedOAuth> => {
  const expectedState = request.session[SESSION_STATE_KEY];
  if (!expectedState || expectedState !== state) {
    throw new OAuthStateMismatchError();
  }
  delete request.session[SESSION_STATE_KEY];

  const client = createOAuthClient();

  let tokens;
  try {
    const response = await client.getToken(code);
    tokens = response.tokens;
  } catch {
    throw new OAuthCodeExchangeError();
  }

  if (!tokens.access_token) {
    throw new OAuthCodeExchangeError();
  }
  client.setCredentials(tokens);

  // Channel verification (spec §22): channels.list(mine=true) — do not skip.
  const youtube = google.youtube({ version: "v3", auth: client });
  let channelsResponse;
  try {
    channelsResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });
  } catch {
    throw new YouTubeChannelNotFoundError();
  }

  const channel = channelsResponse.data.items?.[0];
  if (!channel?.id || !channel.snippet?.title) {
    throw new YouTubeChannelNotFoundError();
  }

  const customUrl =
    (channel.snippet as { customUrl?: string } | undefined)?.customUrl ?? null;

  accounts.upsertYouTubeAccount({
    externalAccountId: channel.id,
    accountName: channel.snippet.title,
    channelHandle: customUrl,
    accessToken: tokens.access_token,
    // A refresh token is only returned on first consent — never overwrite
    // the stored one with null (spec §32).
    refreshToken: tokens.refresh_token ?? null,
    tokenExpiry: tokens.expiry_date ?? null,
    scope: tokens.scope ?? null,
  });

  return {
    accountId: (accounts.getYouTubeAccount() as { id: number }).id,
    channelId: channel.id,
    channelName: channel.snippet.title,
    channelHandle: customUrl,
  };
};
