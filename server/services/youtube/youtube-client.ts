// OAuth client factory (spec §11, §31). Reads only the validated central
// env config — raw process.env access is confined to config/env.ts.

import { google } from "googleapis";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";

export const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
] as const;

export const createOAuthClient = (): OAuth2Client =>
  new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );

export const createOAuthClientWithCredentials = (
  credentials: Credentials,
): OAuth2Client => {
  const client = createOAuthClient();
  client.setCredentials(credentials);
  return client;
};

export const youtubeClient = (auth: OAuth2Client) =>
  google.youtube({ version: "v3", auth });
