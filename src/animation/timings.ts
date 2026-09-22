// Central timing configuration — fast message entrances, content-driven
// screen holds (spec §31–§32). All frame counts live here.

export const timing = {
  fps: 30,

  // The hook is visible from frame 0; the first screen enters after this
  // short delay, so the first message appears within ~0.6s.
  firstScreenDelayFrames: 10,

  screenEnterFrames: 7,
  screenExitFrames: 7,

  // Messages appear briskly; the completed screen holds for reading.
  messageEnterFrames: 6,
  messageGapFrames: 14,

  // Base hold right after a message appears, folded into the reading hold.
  normalHoldAfterAppearFrames: 8,

  // Reading hold (spec §32): word volume × state multiplier, clamped.
  readingFramesPerWord: 2.2,
  screenMinimumReadingHoldFrames: 16,
  screenMaximumReadingHoldFrames: 66,

  // Group event screens — short system moments (~1.8s total).
  eventEnterFrames: 6,
  eventHoldFrames: 42,
  eventExitFrames: 6,

  // Channel-create screens — a slightly longer cinematic beat than a group
  // event: sidebar icon pop-in + centered card both need to read (~2.2s).
  channelCreateTiming: {
    enterFrames: 8,
    holdFrames: 58,
    exitFrames: 8,
  },

  // Time passage screens — short cinematic beats (~1.3s total).
  timePassageTiming: {
    enterFrames: 6,
    holdFrames: 28,
    exitFrames: 6,
    calendarDateFrames: 7,
  },

  // Form interaction screens: fields reveal and answer progressively.
  formTiming: {
    questionEnterFrames: 6,
    fieldGapFrames: 10,
    choiceDecisionPauseFrames: 12,
    choiceSelectFrames: 6,
    multiSelectGapFrames: 8,
    ratingFillFrames: 8,
    textStartPauseFrames: 10,
    typingLoopFrames: 22,
    submitPauseFrames: 14,
    submitPressFrames: 6,
    finalHoldFrames: 24,
  },

  // The final screen ends with this hold and no per-screen exit; the whole
  // composition fades out over the last few frames instead.
  finalVideoHoldFrames: 18,
};
