/**
 * Procedural sound + music with the Web Audio API — no audio files, nothing to download.
 * Off by default; the AudioContext is created on the first user gesture that enables it.
 */
import type { SystemCategory } from '../../types/architecture';

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxOn = false;
let noiseBuf: AudioBuffer | null = null;

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    // gentle compression keeps layered notes from clipping
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.32;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  return ctx;
}

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

function tone(freq: number, t: number, dur: number, o: { type?: Wave; gain?: number; attack?: number; dest?: AudioNode; cutoff?: number; glideTo?: number } = {}) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + dur);
  const a = o.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.2, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (o.cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.cutoff;
    osc.connect(f);
    node = f;
  }
  node.connect(g).connect(o.dest ?? sfxBus!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(t: number, dur: number, o: { from: number; to: number; gain?: number; dest?: AudioNode; q?: number }) {
  if (!ctx || !noiseBuf) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.from, t);
  f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.25, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(o.dest ?? sfxBus!);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/** Each op family has its own pitch, so selecting parts “plays” the architecture. */
const FAMILY_NOTE: Record<string, number> = {
  io: 72, embedding: 74, attention: 79, mlp: 76, norm: 81, merge: 84, conv: 77, routing: 83, ssm: 71, generative: 86, misc: 69,
};

export type Sfx = 'select' | 'step' | 'forward' | 'backprop' | 'correct' | 'wrong' | 'complete' | 'pop' | 'open';

/**
 * Browsers only allow audio after a user gesture. Sound is on by default, so we
 * (re)start the engine on the first click / tap / key press anywhere on the page.
 */
let unlockArmed = false;
let onUnlock: (() => void) | null = null;
function armUnlock() {
  if (unlockArmed || typeof window === 'undefined') return;
  unlockArmed = true;
  const unlock = () => {
    ensure();
    onUnlock?.();
    if (ctx?.state === 'running') ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock, true));
}

export function setSfxEnabled(on: boolean) {
  sfxOn = on;
  if (on) {
    armUnlock();
    if (navigator.userActivation?.hasBeenActive) ensure();
  }
}

export function playSfx(name: Sfx, opts: { family?: string } = {}) {
  if (!sfxOn || !ensure() || !ctx) return;
  const t = ctx.currentTime + 0.005;
  switch (name) {
    case 'select': {
      const n = FAMILY_NOTE[opts.family ?? 'misc'] ?? 72;
      tone(mtof(n), t, 0.35, { type: 'triangle', gain: 0.22 });
      tone(mtof(n + 12), t + 0.02, 0.25, { type: 'sine', gain: 0.08 });
      break;
    }
    case 'step':
      tone(mtof(79), t, 0.5, { type: 'sine', gain: 0.18 });
      tone(mtof(86), t + 0.09, 0.6, { type: 'sine', gain: 0.12 });
      break;
    case 'forward':
      noise(t, 0.6, { from: 300, to: 3200, gain: 0.18 });
      tone(mtof(64), t, 0.5, { type: 'sine', gain: 0.1, glideTo: mtof(76) });
      break;
    case 'backprop':
      noise(t, 0.7, { from: 3000, to: 250, gain: 0.18 });
      tone(mtof(76), t, 0.6, { type: 'sawtooth', gain: 0.05, glideTo: mtof(60), cutoff: 1400 });
      break;
    case 'correct':
      [72, 76, 79].forEach((m, i) => tone(mtof(m), t + i * 0.07, 0.35, { type: 'triangle', gain: 0.2 }));
      break;
    case 'wrong':
      tone(mtof(58), t, 0.3, { type: 'square', gain: 0.07, cutoff: 900 });
      tone(mtof(55), t + 0.12, 0.35, { type: 'square', gain: 0.07, cutoff: 900 });
      break;
    case 'complete':
      [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(mtof(m), t + i * 0.08, 0.7, { type: 'triangle', gain: 0.16 }));
      break;
    case 'pop':
      tone(mtof(88), t, 0.12, { type: 'sine', gain: 0.15, glideTo: mtof(76) });
      break;
    case 'open':
      tone(mtof(84), t, 0.18, { type: 'sine', gain: 0.07 });
      break;
  }
}

// ---------------------------------------------------------------------------
// Ambient music — one generative theme per architecture
// ---------------------------------------------------------------------------

type Style = 'flow' | 'bells' | 'airy' | 'pulse' | 'experts' | 'duet' | 'simple';

interface Theme {
  root: number;
  scale: number[];
  bpm: number;
  style: Style;
  /** scale degrees of the arpeggio, one per eighth note (-1 = rest) */
  pattern: number[];
  /** chord roots (scale degrees), one per bar */
  progression: number[];
}

const SCALES = {
  majorPent: [0, 2, 4, 7, 9],
  minorPent: [0, 3, 5, 7, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  whole: [0, 2, 4, 6, 8, 10],
};

const CATEGORY_THEME: Record<SystemCategory, Theme> = {
  llm: { root: 62, scale: SCALES.majorPent, bpm: 84, style: 'flow', pattern: [0, 2, 4, 5, 4, 2, 3, 1], progression: [0, 3, 4, 2] },
  vision: { root: 67, scale: SCALES.lydian, bpm: 96, style: 'bells', pattern: [0, -1, 4, -1, 7, 6, -1, 4], progression: [0, 1, 4, 3] },
  generative: { root: 60, scale: SCALES.whole, bpm: 60, style: 'airy', pattern: [0, -1, -1, 3, -1, -1, 5, -1], progression: [0, 2, 1, 3] },
  ssm: { root: 57, scale: SCALES.minorPent, bpm: 100, style: 'pulse', pattern: [0, 0, 2, 0, 3, 0, 2, 4], progression: [0, 3, 2, 4] },
  classic: { root: 60, scale: SCALES.major, bpm: 90, style: 'simple', pattern: [0, 2, 4, 2, 0, 2, 4, 7], progression: [0, 5, 3, 4] },
  multimodal: { root: 64, scale: SCALES.dorian, bpm: 88, style: 'duet', pattern: [0, 4, 2, 6, 3, 7, 4, 2], progression: [0, 3, 6, 4] },
  custom: { root: 62, scale: SCALES.majorPent, bpm: 80, style: 'flow', pattern: [0, 2, 1, 3, 2, 4, 3, 1], progression: [0, 2, 3, 1] },
};

const ARCH_STYLE: Record<string, Partial<Theme>> = {
  moe: { style: 'experts' },
  deepseek: { style: 'experts' },
  diffusion: { style: 'airy' },
  mamba: { style: 'pulse' },
  lstm: { style: 'pulse', root: 55 },
  gan: { style: 'duet', scale: SCALES.minorPent },
  vae: { style: 'airy', scale: SCALES.dorian },
  clip: { style: 'duet' },
  whisper: { style: 'duet', bpm: 76 },
};

export function themeFor(archId: string, category: SystemCategory): Theme {
  let h = 0;
  for (const c of archId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const base = CATEGORY_THEME[category] ?? CATEGORY_THEME.custom;
  // a small transposition per architecture so each one has its own key
  return { ...base, root: base.root + ((h % 5) - 2), ...(ARCH_STYLE[archId] ?? {}) };
}

class MusicEngine {
  private theme: Theme | null = null;
  private timer: number | null = null;
  private next = 0;
  private step = 0;
  private on = false;

  setEnabled(on: boolean) {
    this.on = on;
    if (on) {
      armUnlock();
      // before the first user gesture the AudioContext cannot start; retry on unlock
      onUnlock = () => this.on && this.setEnabled(true);
      if (!navigator.userActivation?.hasBeenActive && !ctx) return;
      if (!ensure()) return;
      musicBus!.gain.cancelScheduledValues(ctx!.currentTime);
      musicBus!.gain.linearRampToValueAtTime(0.42, ctx!.currentTime + 1.5);
      this.startClock();
    } else if (ctx && musicBus) {
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      window.setTimeout(() => !this.on && this.stopClock(), 700);
    }
  }

  setTheme(t: Theme) {
    this.theme = t;
    this.step = 0;
  }

  private startClock() {
    if (this.timer !== null || !ctx) return;
    this.next = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.tick(), 60);
  }

  private stopClock() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private note(deg: number, octave = 0) {
    const t = this.theme!;
    const n = t.scale.length;
    const o = Math.floor(deg / n);
    return t.root + t.scale[((deg % n) + n) % n] + 12 * (o + octave);
  }

  private tick() {
    if (!ctx || !this.theme) return;
    const eighth = 60 / this.theme.bpm / 2;
    while (this.next < ctx.currentTime + 0.25) {
      this.schedule(this.step, this.next, eighth);
      this.next += eighth;
      this.step++;
    }
  }

  private schedule(step: number, t: number, eighth: number) {
    const th = this.theme!;
    const dest = musicBus!;
    const bar = Math.floor(step / 8);
    const chord = th.progression[bar % th.progression.length];
    const inBar = step % 8;
    const deg = th.pattern[inBar];

    // pad chord at the start of each bar
    if (inBar === 0) {
      const padLen = eighth * 8.5;
      [0, 2, 4].forEach((d) => tone(mtof(this.note(chord + d, -1)), t, padLen, { type: 'sine', gain: th.style === 'airy' ? 0.06 : 0.045, attack: eighth * 2, dest }));
      tone(mtof(this.note(chord, -2)), t, eighth * 4, { type: 'triangle', gain: 0.07, attack: 0.02, dest, cutoff: 600 });
    }

    switch (th.style) {
      case 'flow':
      case 'simple':
        if (deg >= 0) tone(mtof(this.note(chord + deg, th.style === 'simple' ? 0 : 1)), t, eighth * 1.8, { type: 'triangle', gain: 0.06, dest, cutoff: 2600 });
        break;
      case 'bells':
        if (deg >= 0) {
          tone(mtof(this.note(chord + deg, 1)), t, eighth * 4, { type: 'sine', gain: 0.07, dest });
          tone(mtof(this.note(chord + deg, 2)), t, eighth * 2, { type: 'sine', gain: 0.02, dest });
        }
        break;
      case 'airy':
        if (deg >= 0) tone(mtof(this.note(chord + deg, 1)), t, eighth * 6, { type: 'sine', gain: 0.045, attack: eighth * 2, dest });
        if (inBar === 4 && bar % 2 === 0) noise(t, eighth * 8, { from: 4000, to: 600, gain: 0.03, dest, q: 0.8 });
        break;
      case 'pulse':
        tone(mtof(this.note(chord, 0)), t, eighth * 0.7, { type: 'triangle', gain: 0.045, dest, cutoff: 1200 });
        if (deg >= 0 && inBar % 2 === 1) tone(mtof(this.note(chord + deg, 1)), t, eighth * 1.5, { type: 'sine', gain: 0.045, dest });
        break;
      case 'experts': {
        // each note is played by a different "expert" voice (timbre + register)
        const voice = (step * 7 + bar) % 4;
        const types: Wave[] = ['triangle', 'sine', 'square', 'sawtooth'];
        if (deg >= 0) tone(mtof(this.note(chord + deg, voice % 2)), t, eighth * 1.4, { type: types[voice], gain: voice > 1 ? 0.025 : 0.055, dest, cutoff: 2000 });
        break;
      }
      case 'duet':
        // call (high) and response (low) — two modalities talking
        if (deg >= 0) tone(mtof(this.note(chord + deg, inBar < 4 ? 1 : 0)), t, eighth * 1.6, { type: inBar < 4 ? 'triangle' : 'sine', gain: 0.055, dest, cutoff: 2400 });
        break;
    }
  }
}

export const music = new MusicEngine();
