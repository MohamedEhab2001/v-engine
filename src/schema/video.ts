// Screen-based content schema with semantic message states.
// The content describes what a message MEANS; the renderer decides the
// visual effect, sound, and timing (spec §11–§13).

export type Person = {
  name: string;
  role?: string;
  avatar?: string;
  /** Grammatical gender for Arabic event verbs (e.g. انضمت / انضم). */
  gender?: "m" | "f";
};

export type MessageState =
  | "normal"
  | "question"
  | "important"
  | "shock"
  | "angry"
  | "sarcastic"
  | "hesitant"
  | "reveal"
  | "warning"
  | "good-news"
  | "bad-news";

export type SoundPreset =
  | "message"
  | "soft-message"
  | "impact"
  | "soft-impact"
  | "low-hit"
  | "reveal"
  | "positive"
  | "warning"
  | "click"
  | "clock"
  | "typing"
  | "ring"
  | "join"
  | "leave"
  | "swoosh"
  | "none";

export type AnimationPreset =
  | "normal"
  | "soft"
  | "punch"
  | "tiny-shake"
  | "slow-reveal"
  | "reveal"
  | "positive"
  | "none";

export type MessageAccent =
  | "none"
  | "warning"
  | "positive"
  | "negative";

export type DiscordMessageData = {
  id?: string;
  text: string;
  state?: MessageState;
  highlights?: string[];
  pauseBeforeFrames?: number;
  holdAfterFrames?: number;
  /** Discord-style reply context shown above the message. */
  replyTo?: MessageReply;
  /** Rich content inside the message container (not a separate screen). */
  attachment?: MessageAttachment;
  /** Before/after actions: typing, reactions, edits, deletes (spec §3–§13). */
  lifecycle?: MessageLifecycle;
  /** Explicit overrides; "auto" (or omitted) falls back to the state preset. */
  effects?: {
    sound?: SoundPreset | "auto";
    animation?: AnimationPreset | "auto";
  };
};

// ---------- Message lifecycle (spec §3–§13) ----------

export type TypingIndicatorAction = {
  type: "typing";
  durationFrames?: number;
  style?: "dots" | "label";
  /** typing → stop → silence → typing → message (spec §7). */
  interrupted?: boolean;
};

export type MessageReactionAction = {
  type: "reaction";
  emoji: string;
  /** person key who reacted. */
  from?: string;
  delayFrames?: number;
};

export type MessageEditAction = {
  type: "edit";
  text: string;
  delayFrames?: number;
  state?: MessageState;
  highlights?: string[];
};

export type MessageDeleteAction = {
  type: "delete";
  delayFrames?: number;
  replacementText?: string;
};

export type MessageBeforeAction = TypingIndicatorAction;
export type MessageAfterAction =
  | MessageReactionAction
  | MessageEditAction
  | MessageDeleteAction;

export type MessageLifecycle = {
  before?: MessageBeforeAction[];
  after?: MessageAfterAction[];
};

// ---------- Replies (spec §9) ----------

export type MessageReply = {
  messageId?: string;
  /** person key being replied to. */
  speaker?: string;
  previewText: string;
};

// ---------- Attachments (spec §14–§18) ----------

export type ImageAttachment = {
  type: "image";
  src: string;
  alt?: string;
  fit?: "cover" | "contain";
};

export type DocumentAttachment = {
  type: "document";
  title: string;
  meta?: string;
  icon?: "pdf" | "doc" | "file";
};

export type LinkAttachment = {
  type: "link";
  title: string;
  description?: string;
  domain?: string;
  thumbnail?: string;
};

export type AudioAttachment = {
  type: "audio";
  /** absent → visual-only fake voice note. */
  src?: string;
  durationSeconds: number;
  waveform?: number[];
  autoplay?: boolean;
};

export type MessageAttachment =
  | ImageAttachment
  | DocumentAttachment
  | LinkAttachment
  | AudioAttachment;

// ---------- Story beats, camera, notifications (spec §19, §22, §26) ----------

export type StoryBeat =
  | "normal"
  | "tension"
  | "awkward-pause"
  | "reveal"
  | "shock"
  | "conflict"
  | "relief"
  | "payoff"
  | "sad"
  | "comedic";

export type CameraPreset =
  | "static"
  | "slow-push"
  | "focus-message"
  | "focus-attachment"
  | "micro-punch"
  | "micro-shake";

export type NotificationOverlay = {
  type: "notification";
  source: string;
  title: string;
  body?: string;
  icon?: string;
  delayFrames?: number;
  durationFrames?: number;
  sound?: SoundPreset;
};

export type PresenceState =
  | "online"
  | "idle"
  | "offline"
  | "dnd";

export type MessageScreen = {
  type: "messages";
  speaker: string;
  /** Screen-level story beat — directs timing, camera, and audio. */
  beat?: StoryBeat;
  timestamp?: string;
  camera?: CameraPreset | "auto";
  messages: DiscordMessageData[];
  /** Temporary non-blocking notifications over this screen. */
  overlays?: NotificationOverlay[];
  transition?: {
    sound?: SoundPreset;
  };
};

export type GroupEventType =
  | "joined"
  | "left"
  | "added"
  | "removed";

export type GroupEventScreen = {
  type: "group-event";
  event: GroupEventType;
  person: string;
  by?: string;
  timestamp?: string;
  durationFrames?: number;
};

export type MediaScreen = {
  type: "media";
  mediaType: "image" | "video";
  src: string;
  durationFrames: number;
  fit?: "cover" | "contain";
  muted?: boolean;
};

// ---------- Time passage (cinematic transition screen) ----------

export type TimePassageStyle =
  | "minimal"
  | "clock"
  | "calendar";

export type TimePassageSound =
  | "clock"
  | "swoosh"
  | "none";

export type TimePassageScreen = {
  type: "time-passage";
  /** e.g. "بعد 3 أيام" */
  label: string;
  style?: TimePassageStyle;
  durationFrames?: number;
  sound?: TimePassageSound;
  /** calendar style: dates to cycle through, e.g. ["18 سبتمبر", "19 سبتمبر"] */
  dates?: string[];
};

// ---------- Form interaction screens ----------

export type FormStyle =
  | "survey"
  | "application"
  | "quiz"
  | "feedback"
  | "generic";

export type TextField = {
  type: "text";
  question: string;
  answer: string;
  state?: MessageState;
  typingStyle?: "natural" | "fast" | "slow";
};

export type ChoiceField = {
  type: "choice";
  question: string;
  options: string[];
  selected: string;
  state?: MessageState;
};

export type MultiChoiceField = {
  type: "multi-choice";
  question: string;
  options: string[];
  selected: string[];
  state?: MessageState;
};

export type RatingField = {
  type: "rating";
  question: string;
  max: number;
  selected: number;
  state?: MessageState;
};

export type FormField =
  | TextField
  | ChoiceField
  | MultiChoiceField
  | RatingField;

export type FormInteractionScreen = {
  type: "form-interaction";
  /** person key — shows a subtle "أحمد بيملأ الاستبيان" indicator */
  actor?: string;
  title?: string;
  subtitle?: string;
  formStyle?: FormStyle;
  fields: FormField[];
  submit?: {
    show?: boolean;
    label?: string;
    click?: boolean;
  };
};

// ---------- Call screens (spec §20) ----------

export type CallScreen = {
  type: "call";
  caller: string;
  mode:
    | "incoming"
    | "accepted"
    | "declined"
    | "missed";
  durationFrames?: number;
  callDurationLabel?: string;
};

// ---------- Presence screens (spec §21, §44) ----------

export type PresenceScreen = {
  type: "presence";
  person: string;
  status: PresenceState;
  /** Appearance delay relative to the screen start. */
  delayFrames?: number;
};

export type VideoScreen =
  | MessageScreen
  | GroupEventScreen
  | MediaScreen
  | TimePassageScreen
  | FormInteractionScreen
  | CallScreen
  | PresenceScreen;

export type ChatVideo = {
  id: string;

  settings?: {
    language?: "ar";
    direction?: "rtl";
    fps?: number;
  };

  hook: {
    text: string;
    highlights?: string[];
  };

  people: Record<string, Person>;

  screens: VideoScreen[];

  /** Optional low-volume ambient bed (room tone / soft music). */
  ambience?: {
    src: string;
    volume?: number;
  };
};
