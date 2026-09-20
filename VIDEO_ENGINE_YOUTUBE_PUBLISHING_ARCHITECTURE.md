# Video Engine Publishing Architecture
## React + Remotion Renderer → YouTube OAuth → Review → Publish

> Detailed implementation specification for extending the existing Arabic React/Remotion video engine with secure YouTube publishing.
>
> Follow this document phase-by-phase. Do not skip ahead.

---

# 1. Current System

The existing project is already a React-based video engine using Remotion.

It already handles:

- Arabic RTL
- Discord-style chat stories
- dynamic message containers
- semantic message states
- forms/surveys
- time-passage screens
- group events
- media screens
- advanced storytelling interactions
- final `.mp4` rendering

Do NOT rewrite the renderer.

The new work adds a separate publishing subsystem.

---

# 2. First Goal

The first end-to-end workflow must be:

```text
Video JSON
   ↓
Existing Remotion Renderer
   ↓
final MP4
   ↓
React Preview
   ↓
Manual Publish Action
   ↓
Node Backend
   ↓
YouTube OAuth Credentials
   ↓
YouTube Upload
   ↓
Store Video ID + URL
   ↓
Show Result in React
```

Phase 1 supports only YouTube.

Do NOT implement TikTok, Instagram, Facebook, LinkedIn, scheduling, analytics, AI captions, or automatic publishing yet.

---

# 3. Critical Security Architecture

The existing React app is a frontend.

The React frontend must NEVER contain:

```text
GOOGLE_CLIENT_SECRET
refresh_token
access_token
OAuth token exchange logic
YouTube upload credentials
```

All OAuth and publishing logic must run inside a Node.js backend.

Correct architecture:

```text
┌──────────────────────────────────────┐
│              React App               │
│                                      │
│ Editor / Preview / Publish UI        │
└───────────────────┬──────────────────┘
                    │ HTTP / JSON
                    ↓
┌──────────────────────────────────────┐
│            Node Backend              │
│                                      │
│ OAuth                                │
│ Token Storage                        │
│ Channel Verification                 │
│ Publish Jobs                         │
│ YouTube Upload                       │
│ Validation                           │
└───────────────────┬──────────────────┘
                    │
                    ↓
          Google / YouTube APIs
```

Development example:

```text
React:   http://localhost:5173
Backend: http://localhost:3001
```

---

# 4. Keep Publishing Separate from Remotion

Remotion is responsible only for producing an MP4.

```text
Story JSON
     ↓
Remotion
     ↓
out/video-name.mp4
```

Publishing is separate:

```text
out/video-name.mp4
     ↓
Publishing Service
     ↓
YouTube
```

Do NOT put Google code inside:

```text
Remotion components
animation utilities
timeline compiler
story compiler
message components
```

---

# 5. Repository Structure

Extend the existing repository.

Recommended structure:

```text
project/
│
├── src/
│   ├── ... existing React + Remotion code ...
│   │
│   ├── publishing/
│   │   ├── api/
│   │   │   └── publishing-api.ts
│   │   │
│   │   ├── components/
│   │   │   ├── YouTubeConnectionCard.tsx
│   │   │   ├── RenderPicker.tsx
│   │   │   ├── PublishPanel.tsx
│   │   │   └── PublishHistory.tsx
│   │   │
│   │   └── types.ts
│   │
│   └── ...
│
├── server/
│   ├── index.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── db/
│   │   ├── database.ts
│   │   └── schema.sql
│   │
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── renders.routes.ts
│   │   ├── youtube.routes.ts
│   │   └── publishing.routes.ts
│   │
│   ├── services/
│   │   ├── youtube/
│   │   │   ├── youtube-client.ts
│   │   │   ├── youtube-oauth.service.ts
│   │   │   ├── youtube-channel.service.ts
│   │   │   └── youtube-publisher.service.ts
│   │   │
│   │   ├── publishing/
│   │   │   ├── publisher.interface.ts
│   │   │   ├── publishing.service.ts
│   │   │   └── validation.service.ts
│   │   │
│   │   └── renders/
│   │       └── render-files.service.ts
│   │
│   ├── repositories/
│   │   ├── connected-account.repository.ts
│   │   └── publish-job.repository.ts
│   │
│   ├── middleware/
│   │   └── error-handler.ts
│   │
│   └── types/
│       └── publishing.ts
│
├── out/
│   └── generated-video.mp4
│
├── data/
│   └── publishing.sqlite
│
├── .env
├── .env.example
└── package.json
```

Do not create a second repository.

---

# 6. Backend Stack

Use:

```text
Node.js
TypeScript
Express
googleapis
better-sqlite3
express-session
cors
zod
```

Install:

```bash
npm install express googleapis better-sqlite3 express-session cors zod
npm install -D @types/express @types/express-session @types/cors @types/better-sqlite3 tsx concurrently
```

Do NOT introduce:

```text
NestJS
Redis
BullMQ
Prisma
PostgreSQL
Docker
Kafka
microservices
```

for Phase 1.

---

# 7. Environment Variables

Create `.env`:

```bash
FRONTEND_URL=http://localhost:5173

BACKEND_PORT=3001
SESSION_SECRET=replace-with-a-long-random-value

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/youtube/callback

RENDER_OUTPUT_DIR=./out
SQLITE_PATH=./data/publishing.sqlite
```

Create `.env.example` with empty values.

Never commit:

```text
.env
data/publishing.sqlite
client_secret.json
tokens.json
```

Update `.gitignore`.

---

# 8. Google OAuth Configuration

Google Cloud OAuth client type:

```text
Web application
```

Authorized redirect URI must exactly equal:

```text
http://localhost:3001/api/youtube/callback
```

OAuth scopes:

```text
https://www.googleapis.com/auth/youtube.upload
https://www.googleapis.com/auth/youtube.readonly
```

Use server-side OAuth.

Do not perform token exchange inside the browser.

---

# 9. OAuth Requirements

Use:

```ts
google.auth.OAuth2
```

Authorization options:

```ts
access_type: "offline"
include_granted_scopes: true
```

During development/first connection, using:

```ts
prompt: "consent"
```

is acceptable to make obtaining the refresh token reliable.

Generate and validate OAuth:

```text
state
```

to prevent CSRF.

---

# 10. Server Environment Validation

Create:

```text
server/config/env.ts
```

Use Zod.

Example:

```ts
const envSchema = z.object({
  FRONTEND_URL: z.string().url(),
  BACKEND_PORT: z.coerce.number(),

  SESSION_SECRET: z.string().min(20),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  RENDER_OUTPUT_DIR: z.string().min(1),
  SQLITE_PATH: z.string().min(1),
});
```

If env is invalid:

```text
fail server startup
```

Do not continue with undefined secrets.

---

# 11. OAuth Client Factory

Create:

```text
server/services/youtube/youtube-client.ts
```

Expose:

```ts
createOAuthClient()
```

It reads validated values from central env config.

Do not read raw `process.env` throughout the project.

---

# 12. Database

Use SQLite.

Required tables:

```text
connected_accounts
publish_jobs
```

---

# 13. connected_accounts Table

```sql
CREATE TABLE IF NOT EXISTS connected_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  platform TEXT NOT NULL,

  external_account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  channel_handle TEXT,

  access_token TEXT,
  refresh_token TEXT,
  token_expiry INTEGER,
  scope TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(platform, external_account_id)
);
```

For Phase 1:

```text
platform = youtube
```

`external_account_id` = YouTube Channel ID.

---

# 14. Token Storage

This MVP is local.

Local SQLite token storage is acceptable only for the local MVP.

The SQLite database must be gitignored.

If the app is later deployed:

```text
encrypt OAuth tokens at rest
```

before production use.

Do not call plaintext SQLite token storage production-ready.

---

# 15. publish_jobs Table

```sql
CREATE TABLE IF NOT EXISTS publish_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  platform TEXT NOT NULL,
  account_id INTEGER NOT NULL,

  video_filename TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  privacy_status TEXT NOT NULL,

  status TEXT NOT NULL,

  external_post_id TEXT,
  external_url TEXT,

  error_message TEXT,

  attempt_count INTEGER NOT NULL DEFAULT 0,

  scheduled_at TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY(account_id)
    REFERENCES connected_accounts(id)
);
```

---

# 16. Publish Job Status

Use:

```ts
export type PublishJobStatus =
  | "READY"
  | "PUBLISHING"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED"
  | "SCHEDULED";
```

Phase 1 mainly uses:

```text
READY
PUBLISHING
PUBLISHED
FAILED
```

Do not implement scheduling yet.

---

# 17. YouTube Privacy

```ts
export type YouTubePrivacyStatus =
  | "private"
  | "unlisted"
  | "public";
```

Default:

```text
private
```

The first end-to-end test must upload privately.

---

# 18. Publisher Interface

Create:

```text
server/services/publishing/publisher.interface.ts
```

```ts
export type PublishRequest = {
  videoFilename: string;
  title: string;
  description?: string;
  privacyStatus: "private" | "unlisted" | "public";
};

export type PublishResult = {
  externalId: string;
  url: string;
  status: "PUBLISHED" | "PROCESSING";
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export interface SocialPublisher {
  validate(
    request: PublishRequest
  ): Promise<ValidationResult>;

  publish(
    request: PublishRequest
  ): Promise<PublishResult>;
}
```

Implement only:

```text
YouTubePublisher
```

Future adapters can implement the same interface.

---

# 19. YouTube Connection Flow

Exact flow:

```text
React
↓
GET /api/youtube/connect
↓
Backend generates OAuth URL
↓
Backend stores state in session
↓
Redirect to Google
↓
User signs in and approves
↓
Google redirects to callback
↓
Backend validates state
↓
Backend exchanges code for tokens
↓
Backend calls channels.list(mine=true)
↓
Backend gets real channel ID + name
↓
Backend stores account + tokens
↓
Redirect to React:
http://localhost:5173/settings/youtube?connected=1
```

Do not skip channel verification.

---

# 20. GET /api/youtube/connect

Responsibilities:

1. create OAuth client
2. generate secure random state
3. save state in session
4. generate Google OAuth URL
5. request:
   - youtube.upload
   - youtube.readonly
6. set offline access
7. redirect to Google

Never return:

```text
client secret
refresh token
```

---

# 21. GET /api/youtube/callback

Responsibilities:

1. read authorization `code`
2. read callback `state`
3. compare against session state
4. reject mismatched state
5. exchange code for tokens
6. configure OAuth client with tokens
7. call YouTube `channels.list`
8. use `mine: true`
9. require at least one channel
10. store channel and credentials
11. redirect to React

Do not return OAuth credentials to React.

---

# 22. Channel Verification

Call:

```ts
youtube.channels.list({
  part: ["snippet"],
  mine: true,
});
```

Store:

```text
channel ID
channel title
channel handle/custom URL if available
```

The React app must show the connected channel.

---

# 23. GET /api/youtube/status

Connected response:

```json
{
  "connected": true,
  "account": {
    "id": 1,
    "channelId": "UC123",
    "name": "Mohamed Dev",
    "handle": "@mohameddev"
  }
}
```

Disconnected response:

```json
{
  "connected": false,
  "account": null
}
```

Never return tokens.

---

# 24. DELETE /api/youtube/connection

For Phase 1:

1. delete local YouTube account row
2. remove locally stored tokens
3. clear related OAuth session state

Google token revocation is a useful later improvement.

---

# 25. Render Files

The backend reads rendered MP4s from:

```text
RENDER_OUTPUT_DIR
```

Example:

```text
out/
├── salary-story.mp4
├── hr-story.mp4
└── employee-story.mp4
```

The renderer remains unchanged.

---

# 26. File Security

Frontend must never send an arbitrary absolute path.

Allowed:

```json
{
  "videoFilename": "salary-story.mp4"
}
```

Forbidden:

```json
{
  "path": "../../secret.mp4"
}
```

Backend must resolve filenames only inside `RENDER_OUTPUT_DIR`.

---

# 27. render-files.service.ts

Create:

```ts
resolveRenderFile(filename: string)
```

It must:

1. reject empty filenames
2. use `path.basename`
3. require `.mp4`
4. join with configured render directory
5. resolve absolute path
6. confirm path is still inside render directory
7. verify file exists
8. verify it is a regular file

Reject path traversal.

---

# 28. GET /api/renders

Return available MP4s.

Example:

```json
{
  "videos": [
    {
      "filename": "salary-story.mp4",
      "size": 13420123,
      "modifiedAt": "2026-09-20T10:00:00.000Z"
    }
  ]
}
```

Only inspect the configured render directory.

---

# 29. POST /api/publishing/youtube

Request:

```json
{
  "videoFilename": "salary-story.mp4",
  "title": "ليه الموظفين الشاطرين بيمشوا؟",
  "description": "تفتكر أحمد عمل إيه بعد كده؟",
  "privacyStatus": "private"
}
```

Responsibilities:

1. validate body
2. verify YouTube connection
3. safely resolve file
4. validate metadata
5. create job with `READY`
6. update to `PUBLISHING`
7. upload using YouTube API
8. store YouTube video ID
9. build YouTube URL
10. mark `PUBLISHED`
11. return result

On failure:

1. catch error
2. mark `FAILED`
3. increment attempt count
4. store safe error message
5. return error response

Never lose the job record.

---

# 30. Basic Publish Validation

Validate:

```text
YouTube connected
video exists
video is MP4
video size > 0
title exists
privacy status valid
```

Do not invent platform limits if the implementation model is unsure.

Use current official API docs if strict validation is later added.

---

# 31. YouTubePublisher

Create:

```text
server/services/youtube/youtube-publisher.service.ts
```

Use:

```ts
google.youtube({
  version: "v3",
  auth: oauth2Client,
});
```

Upload using official:

```text
videos.insert
```

Concept:

```ts
youtube.videos.insert({
  part: ["snippet", "status"],

  requestBody: {
    snippet: {
      title,
      description,
    },

    status: {
      privacyStatus,
    },
  },

  media: {
    body: fs.createReadStream(videoPath),
  },
});
```

Use the official `googleapis` client.

Do not manually create multipart upload requests unless necessary.

---

# 32. Refresh Token Handling

Before API calls:

1. load stored credentials
2. create OAuth client
3. set credentials
4. allow Google client library to refresh access token

Important:

```text
refresh_token may not be returned every time
```

When updating credentials:

```text
never overwrite an existing refresh token
with null or undefined
```

Persist refreshed token metadata when practical.

---

# 33. Connected Account Repository

Required functions:

```ts
getYouTubeAccount()

upsertYouTubeAccount(data)

deleteYouTubeAccount()
```

Keep SQL out of route handlers.

---

# 34. Publish Job Repository

Required functions:

```ts
createJob(data)

updateStatus(id, status)

markPublished(id, externalId, url)

markFailed(id, error)

getJob(id)

listJobs()
```

---

# 35. GET /api/publishing/jobs

Example:

```json
{
  "jobs": [
    {
      "id": 12,
      "platform": "youtube",
      "videoFilename": "salary-story.mp4",
      "title": "ليه الموظفين الشاطرين بيمشوا؟",
      "status": "PUBLISHED",
      "externalUrl": "https://www.youtube.com/watch?v=abc123",
      "createdAt": "..."
    }
  ]
}
```

Never return OAuth credentials.

---

# 36. GET /api/publishing/jobs/:id

Return one publish job.

This endpoint will later support:

```text
polling
scheduler state
async processing
```

---

# 37. Health Route

```text
GET /api/health
```

Response:

```json
{
  "ok": true
}
```

React should be able to detect backend availability.

---

# 38. React API Layer

Create:

```text
src/publishing/api/publishing-api.ts
```

Functions:

```ts
getBackendHealth()

getYouTubeStatus()

connectYouTube()

disconnectYouTube()

getRenderedVideos()

publishToYouTube(request)

getPublishJobs()

getPublishJob(id)
```

Do not scatter `fetch()` across components.

Use frontend env:

```bash
VITE_PUBLISHING_API_URL=http://localhost:3001
```

Never use:

```text
VITE_GOOGLE_CLIENT_SECRET
```

or any secret-prefixed browser variable.

---

# 39. YouTubeConnectionCard

Disconnected:

```text
YouTube

Not connected

[ Connect YouTube ]
```

Connected:

```text
YouTube

Connected ✓

Mohamed Dev
@mohameddev

[ Disconnect ]
```

`Connect YouTube` must navigate to:

```text
http://localhost:3001/api/youtube/connect
```

OAuth should use browser navigation, not AJAX.

---

# 40. RenderPicker

Show available MP4 files from:

```text
GET /api/renders
```

Example:

```text
Rendered Video

[ salary-story.mp4 ▼ ]
```

Display optional:

```text
file size
modified date
```

---

# 41. PublishPanel

Required UI:

```text
Video

[ salary-story.mp4 ▼ ]

Title

[________________________]

Description

[________________________]
[________________________]

Privacy

● Private
○ Unlisted
○ Public

[ Publish to YouTube ]
```

---

# 42. Publish UI Rules

Disable publish if:

```text
YouTube disconnected
no video selected
title empty
upload currently running
```

During upload:

```text
Publishing...
```

Disable duplicate submission.

Success:

```text
Published ✓

YouTube Video ID:
abc123

[ Open on YouTube ]
```

Failure:

```text
Upload failed

<safe error>

[ Try Again ]
```

---

# 43. Human Approval Rule

Phase 1 must NOT automatically upload after render.

The manual action:

```text
Publish to YouTube
```

acts as approval.

Future:

```text
Render
↓
READY_FOR_REVIEW
↓
Approve
↓
Publish / Schedule
```

Do not implement full approval workflow yet.

---

# 44. First Upload Rule

First successful test:

```text
privacyStatus = private
```

Verify all four:

```text
correct Google account
correct YouTube channel
correct video file
correct title
```

Only then test unlisted/public.

---

# 45. Server Error Format

Use:

```json
{
  "error": {
    "code": "YOUTUBE_UPLOAD_FAILED",
    "message": "Could not upload video to YouTube."
  }
}
```

Do not expose:

```text
tokens
client secrets
raw authorization headers
database path
stack trace
```

to frontend responses.

---

# 46. Error Codes

Use:

```text
BACKEND_ERROR
VALIDATION_ERROR
YOUTUBE_NOT_CONNECTED
OAUTH_STATE_MISMATCH
OAUTH_CODE_EXCHANGE_FAILED
YOUTUBE_CHANNEL_NOT_FOUND
VIDEO_NOT_FOUND
INVALID_VIDEO_FILENAME
YOUTUBE_UPLOAD_FAILED
PUBLISH_JOB_NOT_FOUND
```

---

# 47. CORS

Allow configured frontend only.

Example:

```ts
cors({
  origin: env.FRONTEND_URL,
  credentials: true,
});
```

Do not use unrestricted CORS by default.

---

# 48. Sessions

Use `express-session` for temporary OAuth state.

Local settings:

```text
httpOnly = true
sameSite = lax
secure = false
```

Production HTTPS later:

```text
secure = true
```

Do not store Google OAuth tokens in browser session/localStorage.

---

# 49. Backend Startup Order

`server/index.ts` must:

1. validate env
2. ensure data directory exists
3. initialize SQLite
4. apply/create schema
5. create Express app
6. configure CORS
7. configure JSON parser
8. configure session
9. register routes
10. register error handler
11. listen

Log:

```text
Publishing API listening on http://localhost:3001
```

Never log secrets.

---

# 50. Scripts

Preserve existing frontend scripts.

Add equivalent scripts:

```json
{
  "scripts": {
    "dev:server": "tsx server/index.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\""
  }
}
```

Adapt `npm run dev` to whatever the project already uses.

Do not break current render commands.

---

# 51. Phase 1 Exact Scope

Implement ONLY:

```text
Node backend
SQLite
YouTube OAuth
channel verification
safe rendered-file listing
manual YouTube upload
private upload default
publish history
React YouTube connection UI
React publish UI
```

Do NOT implement yet:

```text
scheduler
background worker
TikTok
Instagram
Facebook
LinkedIn
analytics
AI captions
AI thumbnails
automatic publish after render
```

---

# 52. Phase 1 End-to-End Acceptance Test

## 1

Start frontend and backend.

## 2

Open publishing settings.

Expected:

```text
YouTube: Not connected
```

## 3

Click:

```text
Connect YouTube
```

## 4

Google OAuth opens.

## 5

Choose account containing correct YouTube channel.

## 6

Approve scopes.

## 7

Return to React.

Expected:

```text
YouTube Connected ✓
<actual channel name>
```

## 8

Existing rendered MP4 files appear.

## 9

Select one video.

## 10

Enter title and description.

## 11

Keep:

```text
Private
```

## 12

Click:

```text
Publish to YouTube
```

## 13

UI shows:

```text
Published ✓
Video ID
YouTube URL
```

## 14

Open YouTube Studio.

Expected:

```text
correct video
correct channel
PRIVATE visibility
```

Phase 1 is complete only if all 14 steps work.

---

# 53. Phase 2 — Scheduling

Do NOT implement until Phase 1 passes.

Later add:

```text
Publish Now
Schedule
```

The table already contains:

```text
scheduled_at
SCHEDULED
```

Use a simple Node process:

```text
every 60 seconds
↓
find jobs:
status = SCHEDULED
scheduled_at <= now
↓
publish
```

No Redis required initially.

---

# 54. Phase 3 — Retry

After scheduling works:

```text
attempt 1
↓
failure
↓
retry
```

Use bounded retry:

```text
max 3 attempts
```

Add duplicate-upload safeguards before aggressive retries.

---

# 55. Phase 4 — Multi-Platform

Future:

```text
SocialPublisher
│
├── YouTubePublisher
├── TikTokPublisher
├── InstagramPublisher
├── FacebookPublisher
└── LinkedInPublisher
```

Do not implement the additional publishers now.

---

# 56. Future Job Model

One video later creates independent jobs:

```text
salary-story.mp4

├── YouTube Job
├── TikTok Job
├── Instagram Job
└── Facebook Job
```

If TikTok fails:

```text
YouTube   PUBLISHED
Instagram PUBLISHED
Facebook  PUBLISHED
TikTok    FAILED
```

Retry only TikTok.

---

# 57. Future Platform Metadata

Later:

```ts
publishing: {
  youtube: {
    title: "...",
    description: "..."
  },

  tiktok: {
    caption: "..."
  },

  instagram: {
    caption: "..."
  },

  facebook: {
    caption: "..."
  }
}
```

Do not force one caption onto all networks.

---

# 58. Future Cover Generator

Later Remotion may produce:

```text
video.mp4
cover.png
```

Do not implement now.

Keep the publishing request extensible so thumbnail support can be added later.

---

# 59. Future Validation

Later pre-publish validation may check:

```text
resolution
duration
audio
missing assets
layout overflow
caption
cover
platform connection
```

Phase 1 only needs basic file/metadata validation.

---

# 60. Future Analytics

Later:

```text
publish
↓
store external video ID
↓
query analytics
↓
associate results with story metadata
```

This is why Phase 1 MUST save the YouTube Video ID.

---

# 61. Security Rules

Never expose to React:

```text
GOOGLE_CLIENT_SECRET
access_token
refresh_token
SESSION_SECRET
```

Never commit:

```text
.env
publishing.sqlite
Google credential JSON
```

Never trust browser filesystem paths.

Never log OAuth secrets/tokens.

Never allow path traversal.

---

# 62. Exact Implementation Order

A weaker coding model must implement these sequentially.

## Step 1 — Backend Skeleton

Build:

```text
Express
env validation
GET /api/health
```

Acceptance:

```json
{"ok":true}
```

---

## Step 2 — SQLite

Create database and both tables.

Acceptance:

```text
server starts
database exists
tables exist
```

---

## Step 3 — OAuth Client

Implement `createOAuthClient()` only.

---

## Step 4 — OAuth Routes

Implement:

```text
GET /api/youtube/connect
GET /api/youtube/callback
```

Acceptance:

```text
Google consent opens
callback succeeds
```

---

## Step 5 — Channel Verification

Call:

```text
channels.list(mine=true)
```

Acceptance:

```text
real channel ID/name saved
```

---

## Step 6 — Status API

Implement:

```text
GET /api/youtube/status
```

Acceptance:

```text
safe channel data
no OAuth tokens
```

---

## Step 7 — Connection UI

Build `YouTubeConnectionCard`.

---

## Step 8 — Render File Service

Implement safe MP4 listing.

Acceptance:

```text
GET /api/renders
```

returns only MP4s in `out/`.

---

## Step 9 — RenderPicker

Build frontend selector.

---

## Step 10 — YouTubePublisher

Implement one known PRIVATE upload.

Test backend first before UI integration.

---

## Step 11 — Publish Job API

Implement:

```text
POST /api/publishing/youtube
```

and repository updates.

---

## Step 12 — PublishPanel

Connect React to backend.

---

## Step 13 — Publish History

Build basic job list.

---

## Step 14 — Full Acceptance Test

Run all 14 end-to-end steps.

Only then move to scheduling.

---

# 63. Explicit Anti-Patterns

Do NOT:

```text
put Google client secret in React
```

Do NOT:

```text
upload directly from browser to YouTube
```

Do NOT:

```text
store refresh token in localStorage
```

Do NOT:

```text
rewrite Remotion
```

Do NOT:

```text
implement all social platforms now
```

Do NOT:

```text
auto-publish after render
```

Do NOT:

```text
default to public
```

Do NOT:

```text
accept arbitrary absolute paths
```

Do NOT:

```text
add Redis/BullMQ now
```

Do NOT:

```text
add AI publishing features now
```

---

# 64. Phase 1 API Summary

```text
GET    /api/health

GET    /api/youtube/connect
GET    /api/youtube/callback
GET    /api/youtube/status
DELETE /api/youtube/connection

GET    /api/renders

POST   /api/publishing/youtube
GET    /api/publishing/jobs
GET    /api/publishing/jobs/:id
```

Do not add unnecessary endpoints.

---

# 65. Frontend Summary

Required publishing UI:

```text
Publishing Settings/Page

├── YouTubeConnectionCard
├── RenderPicker
├── PublishPanel
└── PublishHistory
```

Existing renderer UI remains intact.

---

# 66. Recommended User Flow

```text
Create Story
↓
Preview
↓
Render MP4
↓
Open Publish Page
↓
Select MP4
↓
Confirm YouTube Channel
↓
Enter Metadata
↓
Private
↓
Publish
↓
Receive YouTube URL
```

---

# 67. Official API Notes

Implementation must follow current Google/YouTube official behavior:

- YouTube authorization uses OAuth 2.0.
- Server-side apps should use the server-side OAuth flow.
- `access_type: offline` allows refreshable access.
- OAuth `state` should be used to protect the flow.
- `youtube.upload` allows uploading/managing videos.
- `youtube.readonly` allows reading the connected YouTube account/channel.
- Video upload uses YouTube Data API `videos.insert`.
- Google may restrict uploads from some unverified API projects to private visibility until required verification/audit conditions are met.

Do not attempt to bypass Google verification/audit requirements.

Official references:

```text
https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps

https://developers.google.com/youtube/v3/docs/videos/insert

https://developers.google.com/youtube/v3/getting-started
```

---

# 68. Definition of Done

The architecture is successful when:

```text
React contains no private credentials
```

and:

```text
Node backend owns OAuth and publishing
```

and:

```text
YouTube channel connects successfully
```

and:

```text
correct channel identity is displayed
```

and:

```text
backend safely finds a rendered MP4
```

and:

```text
user can manually upload it as PRIVATE
```

and:

```text
Video ID + YouTube URL are saved
```

and:

```text
React displays publish result/history
```

without changing the existing Remotion renderer.

---

# 69. Final Instruction to the Coding Agent

Do not build a social-media platform yet.

Build one reliable vertical slice:

```text
React
↓
Node Backend
↓
Google OAuth
↓
Connected YouTube Channel
↓
Existing MP4
↓
Manual PRIVATE Upload
↓
Stored Result
```

Make this flow stable first.

Only after it passes end-to-end should the project add:

```text
scheduling
retry
TikTok
Instagram
Facebook
analytics
AI metadata
```

When uncertain, choose the simpler implementation while preserving:

```text
security
clear separation
future extensibility
```
