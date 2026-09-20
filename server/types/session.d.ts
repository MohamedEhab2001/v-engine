import "express-session";

// Typed OAuth state slot on the session (spec §20, §48).
declare module "express-session" {
  interface SessionData {
    youtube_oauth_state?: string;
  }
}
