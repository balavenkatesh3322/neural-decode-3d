/**
 * Procedural sound effects with the Web Audio API — no audio files, nothing to download.
 * On by default; browsers only let the AudioContext start after the first user gesture.
 */
type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
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
function armUnlock() {
  if (unlockArmed || typeof window === 'undefined') return;
  unlockArmed = true;
  const unlock = () => {
    ensure();
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
