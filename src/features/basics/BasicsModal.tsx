import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, AlertTriangle, Boxes, Code2, Sigma, Search } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Formula } from '../../components/common/Formula';
import { BASICS, UNITS, type Basic, type SandboxKind } from '../../data/basics';
import { useAppStore } from '../../store/useAppStore';
import { ALL_ARCHITECTURES } from '../../data/architectures';
import { GRAPHS } from '../../specs';
import { WeightBiasSandbox } from '../../components/sandboxes/WeightBiasSandbox';
import { ActivationSandbox } from '../../components/sandboxes/ActivationSandbox';
import { GradientSandbox, SoftmaxSandbox, ConvolutionSandbox, DropoutSandbox, AttentionSandbox } from './Sandboxes';
import { playSfx } from '../audio/audio';

const SANDBOX: Record<SandboxKind, React.FC> = {
  'weight-bias': WeightBiasSandbox,
  activation: ActivationSandbox,
  gradient: GradientSandbox,
  softmax: SoftmaxSandbox,
  convolution: ConvolutionSandbox,
  dropout: DropoutSandbox,
  attention: AttentionSandbox,
};

/** Architectures (and the first node) where a concept's ops appear — the bridge from theory to the 3D models. */
function usedIn(b: Basic) {
  if (!b.relatedOps?.length) return [];
  const out: { archId: string; name: string; nodeId: string; nodeLabel: string }[] = [];
  for (const a of ALL_ARCHITECTURES) {
    const spec = GRAPHS[a.id];
    const node = spec?.nodes.find((n) => b.relatedOps!.includes(n.op));
    if (node) out.push({ archId: a.id, name: a.name, nodeId: node.id, nodeLabel: node.label ?? node.op });
  }
  return out;
}

const CheckQuestion: React.FC<{ b: Basic; onPass: () => void }> = ({ b, onPass }) => {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    setPicked(null);
  }, [b.id]);
  const right = picked === b.check.answer;
  return (
    <div className="p-4 rounded-2xl bg-[#f3eee5] border border-[rgba(117,91,70,0.14)] space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8d6bcc]">Check yourself</div>
      <p className="text-sm font-semibold text-[#2f2a27]">{b.check.q}</p>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {b.check.options.map((o, i) => (
          <button
            key={o}
            onClick={() => {
              setPicked(i);
              const ok = i === b.check.answer;
              playSfx(ok ? 'correct' : 'wrong');
              if (ok) onPass();
            }}
            className={`text-left px-3 py-2 rounded-xl text-xs border transition-colors ${
              picked === null ? 'bg-white border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b]' : i === b.check.answer ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : i === picked ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-[rgba(117,91,70,0.12)] opacity-60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && <p className={`text-xs ${right ? 'text-emerald-700' : 'text-rose-700'}`}>{right ? '✓ Correct — ' : '✗ Not quite — '}{b.check.why}</p>}
    </div>
  );
};

/** “Deep Learning Basics”: an ordered, end-to-end course from tensors to sampling. */
export const BasicsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const done = useAppStore((s) => s.progress.basicsDone ?? []);
  const markDone = useAppStore((s) => s.markBasicDone);
  const setArch = useAppStore((s) => s.setArch);
  const select = useAppStore((s) => s.select);
  const [idx, setIdx] = useState(() => {
    const st = useAppStore.getState();
    // opened from a deep-dive link → jump straight to that concept
    const focus = st.basicsFocus ? BASICS.findIndex((b) => b.id === st.basicsFocus) : -1;
    if (focus >= 0) {
      useAppStore.setState({ basicsFocus: null });
      return focus;
    }
    return Math.max(0, BASICS.findIndex((b) => !(st.progress.basicsDone ?? []).includes(b.id)));
  });
  const [query, setQuery] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const b = BASICS[idx];
  const Sandbox = b.sandbox ? SANDBOX[b.sandbox] : null;
  const links = useMemo(() => usedIn(b), [b]);
  const unit = UNITS.find((u) => u.id === b.unit)!;

  // (braces matter: scrollTo returns a Promise in newer browsers, which must not be returned from an effect)
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  const filtered = BASICS.map((x, i) => ({ x, i })).filter(({ x }) => !query || `${x.name} ${x.eli5} ${x.whatIsIt}`.toLowerCase().includes(query.toLowerCase()));

  const openIn3D = (archId: string, nodeId: string) => {
    setArch(archId);
    setTimeout(() => select(nodeId), 60);
    onClose();
  };

  return (
    <Modal title="Deep Learning Basics" kicker={`${done.length}/${BASICS.length} concepts completed`} icon={<GraduationCap className="w-4 h-4" />} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-[270px_minmax(0,1fr)] h-full min-h-[70dvh]">
        {/* learning path */}
        <nav className="border-b md:border-b-0 md:border-r border-[rgba(117,91,70,0.14)] bg-white/40 md:max-h-[calc(90dvh-70px)] md:overflow-y-auto custom-scrollbar" aria-label="Learning path">
          <div className="p-3 sticky top-0 bg-[#fffbf4] z-10 space-y-2">
            <div className="h-1.5 rounded-full bg-[#ece4d8] overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(done.length / BASICS.length) * 100}%` }} />
            </div>
            <label className="relative block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8d847c]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a concept…" className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white border border-[rgba(117,91,70,0.18)] text-xs outline-none focus:border-[#eb7c6b]" />
            </label>
            {/* compact picker on phones */}
            <select value={idx} onChange={(e) => setIdx(+e.target.value)} className="md:hidden w-full p-2 rounded-lg border border-[rgba(117,91,70,0.2)] text-sm bg-white" aria-label="Concept">
              {UNITS.map((u) => (
                <optgroup key={u.id} label={u.title}>
                  {BASICS.map((x, i) =>
                    x.unit === u.id ? (
                      <option key={x.id} value={i}>
                        {i + 1}. {x.name} {done.includes(x.id) ? '✓' : ''}
                      </option>
                    ) : null,
                  )}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="hidden md:block px-2 pb-3">
            {UNITS.map((u) => {
              const items = filtered.filter(({ x }) => x.unit === u.id);
              if (!items.length) return null;
              return (
                <div key={u.id} className="mb-2">
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8d847c]">{u.title}</div>
                  {items.map(({ x, i }) => (
                    <button
                      key={x.id}
                      onClick={() => setIdx(i)}
                      className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${i === idx ? 'bg-[#eb7c6b]/12 text-[#c55d4c] font-semibold' : 'text-[#2f2a27] hover:bg-white'}`}
                    >
                      {done.includes(x.id) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <span className="w-3.5 text-center text-[10px] font-mono text-[#8d847c] flex-shrink-0">{i + 1}</span>}
                      <span className="truncate">{x.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </nav>

        {/* concept */}
        <article ref={bodyRef} className="p-4 sm:p-6 space-y-4 md:max-h-[calc(90dvh-70px)] md:overflow-y-auto custom-scrollbar">
          <header>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8d847c]">
              {unit.title} · concept {idx + 1} of {BASICS.length}
            </div>
            <h3 className="font-serif text-3xl text-[#2f2a27] leading-tight">{b.name}</h3>
          </header>

          <div className="p-4 rounded-2xl bg-[#eb7c6b] text-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Explain like I’m 5</div>
            <p className="font-serif text-lg leading-snug">“{b.eli5}”</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            <section className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]">
              <h4 className="text-xs font-bold text-[#2f2a27] mb-1">What it is</h4>
              <p className="text-sm text-[#534a43] leading-relaxed">{b.whatIsIt}</p>
            </section>
            <section className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]">
              <h4 className="text-xs font-bold text-[#2f2a27] mb-1">Why it is needed</h4>
              <p className="text-sm text-[#534a43] leading-relaxed">{b.whyNeeded}</p>
            </section>
          </div>

          <section className="p-4 rounded-2xl bg-[#fff2c9] border border-[#f0e2b0]">
            <h4 className="text-xs font-bold text-[#8d6bcc] mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Analogy · {b.analogy.title}
            </h4>
            <p className="text-sm text-[#534a43] leading-relaxed">{b.analogy.text}</p>
          </section>

          <section className="p-4 rounded-2xl bg-[#2f2a27] text-[#f3e9dc] space-y-2">
            <h4 className="text-xs font-bold text-[#f5b3a8] flex items-center gap-1.5">
              <Sigma className="w-3.5 h-3.5" /> Worked example
            </h4>
            <p className="text-sm font-mono leading-relaxed">{b.example}</p>
            {b.formula && (
              <div className="pt-2 border-t border-white/10 text-[#ffe7c4]">
                <Formula tex={b.formula} />
              </div>
            )}
          </section>

          {Sandbox && <Sandbox />}

          {b.code && (
            <details className="rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] p-3">
              <summary className="text-xs font-bold text-[#2f2a27] cursor-pointer flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> In code (PyTorch)
              </summary>
              <pre className="mt-2 p-3 rounded-xl bg-[#2f2a27] text-[#f5d9a8] text-[11px] overflow-x-auto">{b.code}</pre>
            </details>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <section className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Remember this</h4>
              <p className="text-sm font-semibold text-emerald-900">{b.takeaway}</p>
            </section>
            {b.pitfall && (
              <section className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Common pitfall
                </h4>
                <p className="text-sm text-rose-900">{b.pitfall}</p>
              </section>
            )}
          </div>

          {links.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#2f2a27] flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-[#eb7c6b]" /> See it inside a real model
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {links.slice(0, 8).map((l) => (
                  <button key={l.archId} onClick={() => openIn3D(l.archId, l.nodeId)} className="px-2.5 py-1 rounded-full text-[11px] bg-white border border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b] text-[#2f2a27]">
                    {l.name} <span className="text-[#8d847c]">→ {l.nodeLabel}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <CheckQuestion b={b} onPass={() => markDone(b.id)} />

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#534a43] hover:bg-stone-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => {
                markDone(b.id);
                setIdx(Math.min(BASICS.length - 1, idx + 1));
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold"
            >
              {idx === BASICS.length - 1 ? 'Finish' : `Next: ${BASICS[idx + 1].name}`} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    </Modal>
  );
};
