import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Pause } from 'lucide-react';

const card = 'p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.16)] space-y-3';
const label = 'flex items-center justify-between text-[11px] text-[#534a43]';
const range = 'w-full accent-[#eb7c6b]';

/** Gradient descent on L(w) = (w − 3)²: watch the step size decide speed, overshoot or divergence. */
export const GradientSandbox: React.FC = () => {
  const [lr, setLr] = useState(0.15);
  const [w, setW] = useState(-2);
  const [path, setPath] = useState<number[]>([-2]);
  const [running, setRunning] = useState(false);
  const L = (x: number) => (x - 3) ** 2;
  const grad = (x: number) => 2 * (x - 3);

  const step = () =>
    setW((cur) => {
      const next = cur - lr * grad(cur);
      setPath((p) => [...p.slice(-40), next]);
      return next;
    });
  useEffect(() => {
    if (!running) return;
    const t = setInterval(step, 350);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, lr]);
  const reset = () => (setW(-2), setPath([-2]), setRunning(false));
  const diverged = Math.abs(w) > 40;
  useEffect(() => {
    if (diverged || Math.abs(w - 3) < 1e-3) setRunning(false);
  }, [w, diverged]);

  const X = (x: number) => ((x + 3) / 12) * 300;
  const Y = (y: number) => 150 - Math.min(y, 40) * 3.4;
  const curve = Array.from({ length: 61 }, (_, i) => -3 + i * 0.2).map((x) => `${X(x)},${Y(L(x))}`).join(' ');

  return (
    <div className={card}>
      <div className="text-xs font-semibold text-[#2f2a27]">Sandbox · Gradient descent on L(w) = (w − 3)²</div>
      <svg viewBox="0 0 300 160" className="w-full h-40 bg-[#fbf6ee] rounded-xl">
        <polyline points={curve} fill="none" stroke="#8B6BD6" strokeWidth="2" />
        <line x1={X(3)} x2={X(3)} y1="0" y2="160" stroke="#4E9F6B" strokeDasharray="3 3" />
        {path.map((p, i) => i > 0 && <line key={i} x1={X(path[i - 1])} y1={Y(L(path[i - 1]))} x2={X(p)} y2={Y(L(p))} stroke="#eb7c6b" strokeWidth="1" opacity={0.5} />)}
        {!diverged && <circle cx={X(w)} cy={Y(L(w))} r="6" fill="#eb7c6b" />}
      </svg>
      <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
        <div className="p-1.5 rounded-lg bg-[#f3eee5]">w = {diverged ? '∞' : w.toFixed(3)}</div>
        <div className="p-1.5 rounded-lg bg-[#f3eee5]">L = {diverged ? '∞' : L(w).toFixed(3)}</div>
        <div className="p-1.5 rounded-lg bg-[#f3eee5]">∂L/∂w = {diverged ? '∞' : grad(w).toFixed(2)}</div>
      </div>
      <label className="block space-y-1">
        <span className={label}>
          Learning rate η <b className="font-mono">{lr.toFixed(2)}</b>
        </span>
        <input type="range" min={0.01} max={1.1} step={0.01} value={lr} onChange={(e) => setLr(+e.target.value)} className={range} />
      </label>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2f2a27] text-white text-xs">
          {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} {running ? 'Pause' : 'Run'}
        </button>
        <button onClick={step} className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(117,91,70,0.2)] text-xs">
          One step
        </button>
        <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[rgba(117,91,70,0.2)] text-xs">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <p className="text-[11px] text-[#534a43]">
        {diverged ? 'Diverged! The steps were so big they overshot further each time — lower η and reset.' : lr > 1 ? 'η > 1 overshoots more each step: watch it diverge.' : lr > 0.6 ? 'Big steps bounce across the valley before settling.' : lr < 0.05 ? 'Tiny steps: safe, but very slow.' : 'A good step size: fast and stable.'}
      </p>
    </div>
  );
};

/** Softmax with temperature: how logits become probabilities, and how T sharpens or flattens them. */
export const SoftmaxSandbox: React.FC = () => {
  const [logits, setLogits] = useState([3, 2, 1, 0.2]);
  const [T, setT] = useState(1);
  const names = ['“on”', '“under”', '“near”', '“purple”'];
  const probs = useMemo(() => {
    const e = logits.map((z) => Math.exp(z / T));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  }, [logits, T]);
  return (
    <div className={card}>
      <div className="text-xs font-semibold text-[#2f2a27]">Sandbox · Softmax & temperature — “The cat sat ___”</div>
      {logits.map((z, i) => (
        <div key={i} className="grid grid-cols-[64px_1fr_120px] items-center gap-2 text-[11px]">
          <span className="font-mono">{names[i]}</span>
          <input type="range" min={-2} max={5} step={0.1} value={z} onChange={(e) => setLogits(logits.map((v, j) => (j === i ? +e.target.value : v)))} className={range} aria-label={`logit for ${names[i]}`} />
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 rounded-full bg-[#8B6BD6]" style={{ width: `${probs[i] * 70}px` }} />
            <span className="font-mono">{(probs[i] * 100).toFixed(1)}%</span>
          </div>
        </div>
      ))}
      <label className="block space-y-1">
        <span className={label}>
          Temperature T <b className="font-mono">{T.toFixed(2)}</b>
        </span>
        <input type="range" min={0.1} max={3} step={0.05} value={T} onChange={(e) => setT(+e.target.value)} className={range} />
      </label>
      <p className="text-[11px] text-[#534a43]">
        Cross-entropy if “on” is correct: <b className="font-mono">{(-Math.log(probs[0])).toFixed(3)}</b>. Low T → nearly always “on”; high T → even “purple” gets a chance.
      </p>
    </div>
  );
};

const IMAGE = [
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 0, 9, 9, 9],
  [0, 0, 9, 9, 0, 0],
  [0, 9, 9, 0, 0, 0],
  [9, 9, 0, 0, 0, 0],
];
const KERNELS: Record<string, number[][]> = {
  'Vertical edge': [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
  'Horizontal edge': [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
  Blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map((r) => r.map((v) => v / 9)),
  Sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
};

/** A 3×3 kernel sliding over a 6×6 image, one position at a time. */
export const ConvolutionSandbox: React.FC = () => {
  const [name, setName] = useState('Vertical edge');
  const [pos, setPos] = useState(0);
  const k = KERNELS[name];
  const out = useMemo(
    () => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => k.reduce((s, row, u) => s + row.reduce((t, v, w) => t + v * IMAGE[i + u][j + w], 0), 0))),
    [k],
  );
  const pi = Math.floor(pos / 4);
  const pj = pos % 4;
  const max = Math.max(1, ...out.flat().map(Math.abs));
  useEffect(() => {
    const t = setInterval(() => setPos((p) => (p + 1) % 16), 700);
    return () => clearInterval(t);
  }, []);
  const cell = (v: number, hi: boolean, scale = 9) => (
    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[9px] font-mono ${hi ? 'ring-2 ring-[#eb7c6b]' : ''}`} style={{ background: v >= 0 ? `rgba(47,42,39,${Math.min(1, v / scale)})` : `rgba(63,127,209,${Math.min(1, -v / scale)})`, color: Math.abs(v) / scale > 0.5 ? 'white' : '#2f2a27' }}>
      {Number.isInteger(v) ? v : v.toFixed(1)}
    </div>
  );
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#2f2a27]">Sandbox · Convolution</span>
        <select value={name} onChange={(e) => setName(e.target.value)} className="text-[11px] px-2 py-1 rounded-lg border border-[rgba(117,91,70,0.2)] bg-white" aria-label="Kernel">
          {Object.keys(KERNELS).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <div className="grid grid-cols-6 gap-0.5">{IMAGE.flatMap((r, i) => r.map((v, j) => <React.Fragment key={`${i}${j}`}>{cell(v, i >= pi && i < pi + 3 && j >= pj && j < pj + 3)}</React.Fragment>))}</div>
        <span className="text-lg">∗</span>
        <div className="grid grid-cols-3 gap-0.5">{k.flatMap((r, i) => r.map((v, j) => <React.Fragment key={`${i}${j}`}>{cell(v, false, 5)}</React.Fragment>))}</div>
        <span className="text-lg">=</span>
        <div className="grid grid-cols-4 gap-0.5">{out.flatMap((r, i) => r.map((v, j) => <React.Fragment key={`${i}${j}`}>{cell(Math.round(v * 10) / 10, i === pi && j === pj, max)}</React.Fragment>))}</div>
      </div>
      <p className="text-[11px] text-[#534a43]">The highlighted 3×3 window is multiplied element-wise with the kernel and summed into the highlighted output cell. Same 9 weights, reused at all 16 positions.</p>
    </div>
  );
};

/** Dropout: neurons switch off at random during training, never at inference. */
export const DropoutSandbox: React.FC = () => {
  const [p, setP] = useState(0.5);
  const [training, setTraining] = useState(true);
  const [seed, setSeed] = useState(0);
  const values = [2, 4, 6, 8, 1, 3, 5, 7];
  const mask = useMemo(() => values.map((_, i) => Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453) % 1 >= p), [p, seed]);
  useEffect(() => {
    if (!training) return;
    const t = setInterval(() => setSeed((s) => s + 1), 900);
    return () => clearInterval(t);
  }, [training]);
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2f2a27]">Sandbox · Dropout</span>
        <div className="flex p-0.5 rounded-full bg-[#f3eee5] text-[11px]">
          {(['train', 'eval'] as const).map((m) => (
            <button key={m} onClick={() => setTraining(m === 'train')} className={`px-2.5 py-1 rounded-full ${training === (m === 'train') ? 'bg-white shadow-sm font-semibold' : ''}`}>
              model.{m}()
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {values.map((v, i) => {
          const kept = !training || mask[i];
          return (
            <div key={i} className={`aspect-square rounded-full flex items-center justify-center font-mono text-[11px] transition-all ${kept ? 'bg-[#eb7c6b] text-white' : 'bg-[#e9e2d8] text-[#b6aca1] scale-75'}`}>
              {kept ? (training ? +(v / (1 - p)).toFixed(1) : v) : 0}
            </div>
          );
        })}
      </div>
      <label className="block space-y-1">
        <span className={label}>
          Drop probability p <b className="font-mono">{p.toFixed(2)}</b>
        </span>
        <input type="range" min={0} max={0.9} step={0.05} value={p} onChange={(e) => setP(+e.target.value)} className={range} />
      </label>
      <p className="text-[11px] text-[#534a43]">In training, survivors are scaled by 1/(1−p) = {(1 / (1 - p)).toFixed(2)} so the expected sum stays the same. In eval mode, nothing is dropped.</p>
    </div>
  );
};

/** Attention: click a word to see where it looks. */
export const AttentionSandbox: React.FC = () => {
  const words = ['The', 'animal', 'didn’t', 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'];
  const [q, setQ] = useState(7);
  const [causal, setCausal] = useState(true);
  // hand-tuned, plausible attention pattern: "it" → "animal", verbs → subjects, everyone → itself a bit
  const weights = useMemo(() => {
    const raw = words.map((_, j) => {
      if (causal && j > q) return -Infinity;
      let s = j === q ? 1.2 : 0;
      if (q === 7 && j === 1) s += 3.2;
      if (q === 7 && j === 5) s += 1.0;
      if (q === 9 && (j === 7 || j === 1)) s += 2.2;
      if (q === 3 && j === 1) s += 2;
      if (q === 5 && j === 3) s += 1.8;
      return s - Math.abs(q - j) * 0.08;
    });
    const m = Math.max(...raw.filter(Number.isFinite));
    const e = raw.map((v) => (Number.isFinite(v) ? Math.exp(v - m) : 0));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  }, [q, causal]);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={card} ref={ref}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2f2a27]">Sandbox · Attention — click a word (the query)</span>
        <label className="flex items-center gap-1.5 text-[11px] text-[#534a43]">
          <input type="checkbox" checked={causal} onChange={(e) => setCausal(e.target.checked)} className="accent-[#eb7c6b]" /> causal mask
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {words.map((w, j) => (
          <button
            key={j}
            onClick={() => setQ(j)}
            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${j === q ? 'border-[#eb7c6b] ring-2 ring-[#eb7c6b]/30' : 'border-transparent'}`}
            style={{ background: `rgba(139,107,214,${0.08 + weights[j] * 0.9})`, color: weights[j] > 0.45 ? 'white' : '#2f2a27' }}
          >
            {w}
            <span className="block text-[9px] font-mono opacity-80">{(weights[j] * 100).toFixed(0)}%</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#534a43]">
        “{words[q]}” builds a query and compares it with every key. The colour is the softmax weight: how much of each word’s value gets mixed into “{words[q]}”.{causal ? ' With the causal mask (GPT-style), words cannot look ahead.' : ' Without the mask (BERT-style), words also see the future.'}
      </p>
    </div>
  );
};
