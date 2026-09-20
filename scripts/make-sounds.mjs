// Generates placeholder sound effects as WAV files in public/sounds (spec §17).
// Pure Node, no dependencies. Replace the files with production sounds later —
// the content schema only references preset names, never paths.
//
// Run with: node scripts/make-sounds.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const soundsDir = join(projectRoot, "public", "sounds");
mkdirSync(soundsDir, { recursive: true });

const SAMPLE_RATE = 44100;

const writeWav = (name, samples) => {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  const file = join(soundsDir, name);
  writeFileSync(file, buffer);
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
};

// message pop: short sine blip rising in pitch with a fast decay.
const makeMessagePop = () => {
  const duration = 0.09;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    const freq = 620 + 480 * progress;
    const envelope = Math.exp(-progress * 7);
    out[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
  }
  return out;
};

// impact: low thump dropping in pitch plus a short noise burst.
const makeImpact = () => {
  const duration = 0.32;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  let noise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    const freq = 150 * Math.exp(-progress * 2.4) + 44;
    const thump = Math.sin(2 * Math.PI * freq * t) * Math.exp(-progress * 5.5);
    // one-pole lowpassed noise for the transient click
    noise = noise * 0.91 + (Math.random() * 2 - 1) * 0.09;
    const burst = noise * Math.exp(-progress * 26) * 1.6;
    out[i] = (thump * 1.1 + burst) * 0.85;
  }
  return out;
};

// swoosh: band-swept noise with a rise-and-fall envelope.
const makeSwoosh = () => {
  const duration = 0.42;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  let low = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const progress = i / n;
    const white = Math.random() * 2 - 1;
    // the filter cutoff effectively sweeps up then down via the mix
    low = low * 0.82 + white * 0.18;
    const high = white - low;
    const sweep = Math.sin(Math.PI * progress); // 0 → 1 → 0
    const brightness = 0.35 + 0.65 * sweep;
    const value = (low * (1 - brightness) + high * brightness) * 2.2;
    const envelope = Math.pow(sweep, 1.4);
    const smoothed = prev + (value - prev) * 0.6;
    prev = smoothed;
    out[i] = smoothed * envelope * 0.8;
  }
  return out;
};

// join: soft two-note ascending chime (C5 → E5).
const makeJoin = () => {
  const noteFreqs = [523.25, 659.25];
  const noteLength = 0.11;
  const gapLength = 0.03;
  const duration = noteLength * 2 + gapLength;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let noteIndex = 0;
    let noteT = t;
    if (t >= noteLength + gapLength) {
      noteIndex = 1;
      noteT = t - (noteLength + gapLength);
    }
    const progress = noteT / noteLength;
    const envelope = Math.sin(Math.PI * Math.min(1, progress)) ** 1.5;
    out[i] =
      Math.sin(2 * Math.PI * noteFreqs[noteIndex] * t) * envelope * 0.5;
  }
  return out;
};

// leave: gentle descending chime (E5 → D5), slightly softer.
const makeLeave = () => {
  const noteFreqs = [659.25, 587.33];
  const noteLength = 0.12;
  const gapLength = 0.03;
  const duration = noteLength * 2 + gapLength;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let noteIndex = 0;
    let noteT = t;
    if (t >= noteLength + gapLength) {
      noteIndex = 1;
      noteT = t - (noteLength + gapLength);
    }
    const progress = noteT / noteLength;
    const envelope = Math.sin(Math.PI * Math.min(1, progress)) ** 1.5;
    out[i] =
      Math.sin(2 * Math.PI * noteFreqs[noteIndex] * t) * envelope * 0.42;
  }
  return out;
};

// soft message: quieter, lower pop for questions and hesitant lines.
const makeSoftMessage = () => {
  const duration = 0.11;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    const freq = 500 + 260 * progress;
    const envelope = Math.exp(-progress * 6);
    out[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.55;
  }
  return out;
};

// soft impact: the thump without the click transient.
const makeSoftImpact = () => {
  const duration = 0.26;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    const freq = 130 * Math.exp(-progress * 2.2) + 48;
    out[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-progress * 6) * 0.7;
  }
  return out;
};

// low hit: single low body blow (angry / bad news).
const makeLowHit = () => {
  const duration = 0.22;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    const freq = 96 * Math.exp(-progress * 2.6) + 44;
    out[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-progress * 5) * 0.95;
  }
  return out;
};

// reveal: rising low swell that lands on a hit — suspense, then payoff.
const makeRevealSound = () => {
  const duration = 0.5;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / n;
    // swell 58 → 116 Hz through the first 70%, then a decaying hit
    if (progress < 0.7) {
      const swell = progress / 0.7;
      const freq = 58 + 58 * swell;
      out[i] = Math.sin(2 * Math.PI * freq * t) * (0.25 + swell * 0.45);
    } else {
      const hit = (progress - 0.7) / 0.3;
      const freq = 120 * Math.exp(-hit * 2.5) + 50;
      out[i] =
        Math.sin(2 * Math.PI * freq * t) * Math.exp(-hit * 5.5) * 0.95;
    }
  }
  return out;
};

// positive: bright two-note ascending chime (E5 → A5).
const makePositive = () => {
  const noteFreqs = [659.25, 880];
  const noteLength = 0.1;
  const gapLength = 0.03;
  const duration = noteLength * 2 + gapLength;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let noteIndex = 0;
    let noteT = t;
    if (t >= noteLength + gapLength) {
      noteIndex = 1;
      noteT = t - (noteLength + gapLength);
    }
    const progress = noteT / noteLength;
    const envelope = Math.sin(Math.PI * Math.min(1, progress)) ** 1.5;
    out[i] = Math.sin(2 * Math.PI * noteFreqs[noteIndex] * t) * envelope * 0.45;
  }
  return out;
};

// warning: two soft low taps — no alarm tone.
const makeWarning = () => {
  const tapLength = 0.08;
  const gapLength = 0.05;
  const duration = tapLength * 2 + gapLength;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let tapT = t;
    if (t >= tapLength + gapLength) {
      tapT = t - (tapLength + gapLength);
    }
    const progress = tapT / tapLength;
    const envelope = Math.sin(Math.PI * Math.min(1, progress));
    out[i] =
      Math.sin(2 * Math.PI * 150 * t) * envelope * 0.4;
  }
  return out;
};

// click: tiny dry tick (sarcastic beat).
const makeClick = () => {
  const duration = 0.03;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const progress = i / n;
    out[i] =
      (Math.sin(2 * Math.PI * 1800 * (i / SAMPLE_RATE)) *
        Math.exp(-progress * 10) +
        (Math.random() * 2 - 1) * Math.exp(-progress * 22) * 0.6) *
      0.6;
  }
  return out;
};

// clock: tick...tock — two resonant wood-block-ish taps, low volume.
const makeClock = () => {
  const duration = 0.55;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  const tick = (t, freq, level) => {
    const decay = Math.exp(-((t % 0.26) / 0.26) * 9);
    return Math.sin(2 * Math.PI * freq * t) * decay * level;
  };
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    if (t < 0.26) {
      out[i] = tick(t, 1900, 0.5);
    } else {
      out[i] = tick(t - 0.28, 1450, 0.45);
    }
  }
  return out;
};

// typing: ~0.8s of soft muffled key taps at an uneven but fixed rhythm.
const makeTyping = () => {
  const duration = 0.8;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  const taps = [0.02, 0.11, 0.19, 0.27, 0.36, 0.43, 0.52, 0.6, 0.68, 0.75];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    for (const tapAt of taps) {
      const dt = t - tapAt;
      if (dt >= 0 && dt < 0.035) {
        const decay = Math.exp(-dt * 160);
        const freq = 950 + ((tapAt * 997) % 220);
        out[i] +=
          (Math.sin(2 * Math.PI * freq * t) * 0.6 +
            (Math.sin(tapAt * 10000) * 0.5 + 0.5) * 0.25) *
          decay *
          0.55;
      }
    }
  }
  return out;
};

writeWav("message-pop.wav", makeMessagePop());
writeWav("soft-message.wav", makeSoftMessage());
writeWav("impact.wav", makeImpact());
writeWav("soft-impact.wav", makeSoftImpact());
writeWav("low-hit.wav", makeLowHit());
writeWav("reveal.wav", makeRevealSound());
writeWav("positive.wav", makePositive());
writeWav("warning.wav", makeWarning());
writeWav("click.wav", makeClick());
// ring: a classic dual-tone ring burst (~0.9s, two pulses).
const makeRing = () => {
  const duration = 0.9;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const pulse = t < 0.4 ? 1 : t >= 0.5 && t < 0.9 ? 1 : 0;
    const envelope = pulse
      ? (t < 0.4 ? Math.sin((Math.PI * t) / 0.4) : Math.sin((Math.PI * (t - 0.5)) / 0.4))
      : 0;
    const tone =
      Math.sin(2 * Math.PI * 440 * t) * 0.5 +
      Math.sin(2 * Math.PI * 480 * t) * 0.5;
    out[i] = tone * envelope * 0.35;
  }
  return out;
};

// ambience: soft dark room tone — heavily lowpassed noise, very quiet.
const makeAmbience = () => {
  const duration = 4;
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float64Array(n);
  let low = 0;
  let lower = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    low = low * 0.985 + white * 0.015;
    lower = lower * 0.99 + low * 0.01;
    // fade the loop edges so the loop point is inaudible
    const t = i / n;
    const edge = Math.min(1, Math.min(t, 1 - t) * 24);
    out[i] = lower * 26 * edge;
  }
  return out;
};

writeWav("clock.wav", makeClock());
writeWav("ring.wav", makeRing());
writeWav("ambience.wav", makeAmbience());
writeWav("typing.wav", makeTyping());
writeWav("swoosh.wav", makeSwoosh());
writeWav("join.wav", makeJoin());
writeWav("leave.wav", makeLeave());
