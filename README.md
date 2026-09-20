# Arabic Chat Video Engine — Discord-Style Screens

A deterministic **Arabic-first chat-story video template** built with
[Remotion](https://www.remotion.dev), React and TypeScript. The engine renders
**screen-based** stories in a Discord-style dark chat UI:

- One consecutive same-speaker turn = **one screen**; a speaker change is a
  screen transition. Previous screens are removed — the conversation never
  accumulates. All messages of a turn stay visible together until the screen
  exits.
- The Discord frame is **content-aware**: its height is computed from the
  actual messages (clamped 360–1050px) and animates between screens; compact
  turns get compact frames, centered in the lower region.
- Messages carry a **semantic state** (`question`, `shock`, `reveal`,
  `hesitant`, `angry`, `sarcastic`, `important`, `warning`, `good-news`,
  `bad-news`, `normal`) — the renderer maps state → animation, sound effect,
  font weight, accent, pauses, and reading hold automatically.
- Screens hold long enough to read: the reading hold is calculated from word
  volume × the strongest state multiplier.
- **Time passage** screens (`type: "time-passage"`) are cinematic beats:
  centered icon/label on black (panel hidden), ~1.3s, in `minimal` / `clock`
  (sweeping hand + tick) / `calendar` (quickly cycling `dates`) styles.
- **Form interaction** screens (`type: "form-interaction"`) show a person
  filling a survey/application/quiz: questions reveal one by one, choices
  fill with a punch and click, answers **type themselves** with deterministic
  natural timing and a blinking cursor, ratings fill star by star, and the
  submit button presses at the end. Fields support the same semantic
  `state` system (e.g. `angry` types faster, `hesitant` slower).
- Group events (`joined` / `left` / `added` / `removed`) render as compact
  standalone system screens with badges and join/leave sounds.
- Images and videos render as their own screens, transitioning like the rest.
- RTL Arabic with correct shaping throughout, mixed Arabic/English/numbers,
  bold hook pinned to the top third, phrase highlights — all deterministic
  and offline.

Each new video is created by editing **one TypeScript file**
(`src/videos/current-video.ts`) and optionally dropping media into `public/`.

## Commands

**Install dependencies**

```console
npm install
```

> **If `npm install` or `npm run <script>` fails on this machine** with
> `ERR_INVALID_ARG_TYPE: The "file" argument must be of type string` (or a
> script prints its banner and exits silently), the `COMSPEC` environment
> variable is empty, which breaks npm's script spawning. Fix it once with:
>
> ```console
> npm config set script-shell "C:\Windows\System32\cmd.exe"
> ```

**Start Remotion Studio (preview)**

```console
npm run dev
```

**Render the current video to `out/video.mp4`**

```console
npm run render
```

**Print the compiled screens (frame math, no rendering)**

```console
npm run timeline
```

**Regenerate placeholder assets (sounds, sample image)**

```console
npm run assets
```

**Typecheck / lint**

```console
npm run lint
```

## Publishing to YouTube

A separate publishing subsystem (Phase 1, YouTube only) takes rendered MP4s
from `out/` and uploads them through a Node backend that owns all OAuth
secrets — the renderer never touches Google code.

```bash
npm run dev:server   # publishing API on http://localhost:3001
npm run dev:all      # Remotion Studio + publishing API together
```

Then open **http://localhost:3001/** (built-in publishing UI):

1. **Connect YouTube** — server-side OAuth (`youtube.upload` +
   `youtube.readonly`), the channel is verified via `channels.list(mine=true)`
2. Pick a rendered MP4, enter title/description, keep **Private**
3. **Publish to YouTube** — the manual click is the approval; nothing uploads
   automatically
4. The video ID + URL are stored in SQLite (`data/publishing.sqlite`) and
   shown in History

**One-time Google Cloud Console setup (required):** in APIs & Services →
Credentials → your OAuth client (type *Web application*), add this exact
Authorized redirect URI, or Google will reject the flow with
`redirect_uri_mismatch`:

```text
http://localhost:3001/api/youtube/callback
```

Secrets live in `.env` (gitignored; see `.env.example`). Never put client
secrets or tokens in the frontend. Note: Google may restrict uploads from
unverified API projects to private visibility.

## Publishing subsystem structure

```
server/                      Express + SQLite + googleapis (owns all secrets)
  config/env.ts              zod-validated environment (fails fast)
  db/                        schema.sql + better-sqlite3 bootstrap
  routes/                    health, renders, youtube OAuth, publishing jobs
  services/youtube/          oauth client, channel verify, videos.insert
  services/publishing/       SocialPublisher interface + validation
  services/renders/          safe MP4 listing (path-traversal-proof)
  repositories/              connected_accounts + publish_jobs
src/publishing/              frontend: API layer + connection/publish UI
  main.tsx                   bundled to server/public/app.js
```

API: `GET /api/health`, `GET /api/youtube/connect|callback|status`,
`DELETE /api/youtube/connection`, `GET /api/renders`,
`POST /api/publishing/youtube`, `GET /api/publishing/jobs[/:id]`.

## Batch pipeline: render → Cloudinary → Video Library

A local production server batches renders, stores videos in Cloudinary, and
registers them with the publishing server's Video Library.

```bash
npm run dev:local      # local production server on http://localhost:3002
```

1. Drop story files into **`stories/`** — each exports `video` with a unique
   `id` (the schema is unchanged; the import path may be
   `../src/schema/video`)
2. Open **http://localhost:3002/** — all scripts with their status
3. **Render All** (or per-script **Render**) — the queue runs sequentially
   (concurrency 1): render → Cloudinary upload → VPS registration →
   COMPLETED
4. Videos appear in the Video Library at
   **http://localhost:3001/#/videos**, playing straight from Cloudinary

Queue state persists in `data/local.sqlite`: restarting the local server
resumes PENDING work and never re-renders COMPLETED jobs. Failed jobs are
retried **from their first unfinished stage** (a `REGISTERING_FAILED` job
re-registers the already-uploaded Cloudinary asset without re-rendering).
`Retry Failed` retries everything failed; per-script `Retry` also exists.

Required local env (`.env`): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, `CLOUDINARY_VIDEO_FOLDER`,
`PUBLISHING_SERVER_URL`, `PUBLISHING_SERVER_API_KEY` (must equal the
publishing server's `MEDIA_INGEST_API_KEY`). While a queued render is in
flight, `src/videos/current-video.ts` is temporarily swapped with the story
being rendered and restored right after — avoid editing it mid-render.

## Deploying the publishing server (VPS)

The publishing server is deployment-ready and does NOT need Remotion:

```bash
npm ci
npm run build:server     # bundles to dist-server/index.cjs
npm run start:server     # node dist-server/index.cjs
```

Server `.env` needs: `FRONTEND_URL`, `BACKEND_PORT`, `SESSION_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`,
`RENDER_OUTPUT_DIR`, `SQLITE_PATH`, `MEDIA_INGEST_API_KEY` (machine key the
local app sends as `Authorization: Bearer …` on `POST /api/media-assets`).
Commit none of: `.env`, `data/`, `client_secret*.json`, `tokens*.json`.
Set `cookie.secure = true` in `server/index.ts` when serving over HTTPS.

## Creating a new video

**The one-command way (recommended):** write your script anywhere as a plain
`export const video = { ... }` file (schema below — no imports needed), then:

```console
npm run make -- path/to/my-story.ts
```

This installs the script, validates it (speaker IDs, unknown states, overflow
warnings are printed before rendering), and renders to `out/<video-id>.mp4`.

**The manual way:** paste the script into `src/videos/current-video.ts`
(keeping the `import type { ChatVideo }` line at the top), preview with
`npm run dev`, render with `npm run render` (→ `out/video.mp4`).

Either way: optionally copy media into `public/avatars`, `public/images`,
`public/videos`, `public/sounds` and reference them by path in the script.

### Screen schema in one minute

```ts
export const video: ChatVideo = {
  id: "my-story",
  settings: { language: "ar", direction: "rtl", fps: 30 },
  hook: {
    text: "ليه الموظفين الشاطرين بيمشوا؟",
    highlights: ["الشاطرين"],          // light-accent phrases in the title
  },
  people: {
    ahmed: { name: "أحمد", role: "مطور", avatar: "avatars/ahmed.png" },
    sara: { name: "سارة", role: "مصممة", gender: "f" }, // gender → انضمت/غادرت
  },
  screens: [
    {
      type: "messages",                  // one speaking turn = one screen
      speaker: "ahmed",
      timestamp: "8:31 م",
      messages: [
        { text: "ممكن أسألك سؤال؟", state: "question" },
        { text: "بياخد أكتر مني بـ 4000 جنيه؟", state: "shock", highlights: ["4000 جنيه"] },
        { text: "هو ابن صاحب الشركة.", state: "reveal" },
      ],
    },
    {
      type: "time-passage",                  // cinematic transition beat
      label: "بعد أسبوع",
      style: "calendar",                     // minimal | clock | calendar
      dates: ["21 سبتمبر", "28 سبتمبر"],     // calendar cycling (optional)
    },
    {
      type: "form-interaction",               // animated form filling
      actor: "ahmed",
      title: "استبيان رضا الموظفين",
      formStyle: "survey",
      fields: [
        { type: "choice", question: "هل أنت راضي عن مرتبك؟", options: ["نعم", "لا"], selected: "لا" },
        { type: "multi-choice", question: "إيه المشاكل؟", options: ["المرتب", "الإدارة"], selected: ["المرتب"] },
        { type: "rating", question: "قيم رضاك", max: 5, selected: 2 },
        { type: "text", question: "ليه؟", answer: "أنا شايف إن مرتبي أقل من اللي بستحقه.", state: "angry" },
      ],
      submit: { show: true, label: "إرسال" },
    },
    {
      type: "group-event",               // standalone system screen
      event: "added",                    // joined | left | added | removed
      person: "omar",
      by: "manager",                     // optional; used by added/removed
      timestamp: "8:33 م",
    },
    {
      type: "media",                     // image or video screen
      mediaType: "video",
      src: "videos/sample-clip.mp4",
      durationFrames: 60,
      fit: "cover",
      muted: true,
    },
  ],
};
```

Messages describe **meaning**, not presentation: `state` drives the
animation preset, sound effect, font weight, accent, pauses, and reading
hold (see `src/message/message-states.ts`). Explicit overrides are available
when needed:

```ts
{ text: "...", state: "shock", effects: { sound: "none" } }   // silent shock
{ text: "...", pauseBeforeFrames: 35, holdAfterFrames: 20 }    // manual pacing
```

Screens transition automatically (fade up/down with a subtle swoosh,
overridable with `transition: { sound: ... }`); the next screen enters while
the previous exits, so the chat is never empty. Durations derive from
message count, text volume, states, explicit pauses, and the calculated
reading hold — never a fixed value. Message text never shrinks; an oversized
turn produces a clear "split this turn" warning.

## Project structure

```
public/
  avatars/   speaker avatars (optional; initials are used when missing)
  fonts/     IBM Plex Sans Arabic (bundled locally, OFL license)
  images/    media screen assets
  sounds/    message / impact / reveal / positive / warning / ... effects
  videos/    media screen assets
src/
  Root.tsx                    composition registration (1080x1920@30)
  compositions/ChatStoryVideo one active screen inside a dynamic Discord frame
  components/
    DiscordFrame.tsx          dynamic-height panel + channel header
    MessageScreen.tsx         one speaking turn (header + message containers)
    DiscordMessage.tsx        one message container with state effects
    SpeakerHeader.tsx         avatar + name + role • time (bidi-safe)
    GroupEventScreen.tsx      compact joined/left/added/removed screens
    MediaScreen.tsx           image/video screen (cover/contain)
    ScreenTransition.tsx      shared enter/exit motion
    Hook.tsx, HighlightText.tsx, Avatar.tsx
  message/
    message-states.ts         semantic state presets + presentation resolver
    message-effects.ts        per-animation entrance math
    message-timing.ts         message starts + calculated reading hold
    panel-layout.ts           dynamic panel height utility
  compiler/
    compile-screens.ts        screens → frame ranges + panels + validation
    duration.ts               per-screen duration math
  animation/                  timings + presets (all motion math)
  audio/                      sound presets, event presets, soundtrack builder
  theme/                      Discord-like palette, panel geometry, fonts
  schema/video.ts             the content schema (the contract)
  videos/current-video.ts     ← the file you edit
scripts/                      asset generation + screen printing utilities
```

## Configuration

All knobs are centralized:

- `src/theme/theme.ts` — Discord-like palette, panel geometry, font sizes
- `src/theme/typography.ts` — font family and weights
- `src/animation/timings.ts` — every frame count (screen enter/exit, message
  gaps, reading hold bounds)
- `src/message/message-states.ts` — the semantic map: state → sound,
  animation, weight, accent, and timing multipliers
- `src/audio/presets.ts` — sound files, volumes, and group-event presets

## Notes

- Rendering is deterministic: no randomness, no network access. Fonts are
  loaded locally from `public/fonts` via `@remotion/fonts`.
- Placeholder sounds and media are generated by `scripts/*.mjs`; replace the
  files in `public/` whenever you like — content only references preset names
  and paths.
- IBM Plex Sans Arabic is licensed under the SIL Open Font License.
