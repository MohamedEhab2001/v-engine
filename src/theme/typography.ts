import { fontFamily } from "./fonts";

// Central typography configuration (spec §7).
// IBM Plex Sans Arabic ships 400/500/600/700, so the hook uses Bold (700) —
// the strongest available weight.
export const typography = {
  family: fontFamily,
  hookWeight: 700,
  messageWeight: 600,
  metadataWeight: 500,
  nameWeight: 700,
  emphasisWeight: 700,
};
