import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, GraduationCap, Boxes, Cpu, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Architecture, NodeComponent } from '../../types/architecture';
import { Modal } from '../common/Modal';
import { Formula } from '../common/Formula';
import { useArchitectureModel } from '../../engine/useArchitectureModel';
import { getOp } from '../../engine/ops';
import { fmtBytes, fmtCount, fmtNum, fmtSym, numel, type Shape } from '../../engine/graph/shape';
import { isDataEdge } from '../../engine/graph/infer';
import { storyFor } from '../../engine/story';
import { BASICS } from '../../data/basics';
import { useAppStore } from '../../store/useAppStore';
import { walkthroughFor, dimMeaning } from '../../features/deepdive/walkthroughs';
import { playSfx } from '../../features/audio/audio';

/** A tensor shape explained dimension by dimension, in plain words. */
const ShapeExplainer: React.FC<{ shape: Shape; tone: 'in' | 'out' }> = ({ shape, tone }) => (
  <div className="flex flex-wrap gap-1.5">
    {shape.num.map((n, i) => (
      <div key={i} className={`px-2.5 py-1.5 rounded-xl border text-center min-w-[84px] ${tone === 'in' ? 'bg-[#eef7fa] border-[#3FA7C9]/30' : 'bg-[#fdf0ec] border-[#eb7c6b]/30'}`}>
        <div className="font-mono font-bold text-sm text-[#2f2a27]">{n.toLocaleString('en-US')}</div>
        <div className="font-mono text-[10px] text-[#8d847c]">{shape.sym[i]}</div>
        <div className="text-[10px] text-[#534a43] leading-tight mt-0.5">{dimMeaning(shape.sym[i], i, shape.num.length)}</div>
      </div>
    ))}
  </div>
);

/** What changed between input and output, in one sentence. */
function shapeChange(a: Shape | undefined, b: Shape): string {
  if (!a) return `It produces a tensor of shape ${fmtNum(b)}.`;
  if (fmtNum(a) === fmtNum(b)) return 'The shape does not change — only the numbers inside are transformed. That is why this block can be stacked many times.';
  if (a.num.length !== b.num.length) return `The tensor is re-arranged from ${a.num.length} to ${b.num.length} dimensions: ${fmtSym(a)} → ${fmtSym(b)}.`;
  const diffs = a.num
    .map((v, i) => (v !== b.num[i] ? `${a.sym[i]} ${v.toLocaleString('en-US')} → ${b.sym[i]} ${b.num[i].toLocaleString('en-US')}` : null))
    .filter(Boolean);
  return `What changes: ${diffs.join(', ')}.`;
}

/**
 * Deep-dive lesson for one component: where it sits, what goes in, what happens inside
 * (a real worked example), what comes out, the formula, its cost, why it matters, and
 * a check — with previous/next to walk through the whole architecture end to end.
 */
export const ComponentDetailModal: React.FC<{ component: NodeComponent; architecture: Architecture; onClose: () => void }> = ({ component, architecture, onClose }) => {
  const model = useArchitectureModel();
  const select = useAppStore((s) => s.select);
  const openBasics = useAppStore((s) => s.openBasics);
  const bodyRef = useRef<HTMLDivElement>(null);
  const comps = architecture.components;
  const idx = comps.findIndex((c) => c.id === component.id);
  const specId = model.specIdForComponent.get(component.id);
  const info = specId ? model.infer.nodes.get(specId) : undefined;
  const op = info ? getOp(info.node.op) : null;
  const story = useMemo(() => storyFor(model), [model]);
  const tokens = model.spec.sampleTokens ?? [];
  const steps = useMemo(() => (info ? walkthroughFor(info.node.op, info.node.params ?? {}, tokens) : []), [info, tokens]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setStep(0);
    setPicked(null);
    bodyRef.current?.closest('.overflow-y-auto')?.scrollTo({ top: 0 });
  }, [component.id]);

  const labelOf = (id: string) => {
    const n = model.spec.nodes.find((x) => x.id === id);
    return n ? n.label ?? getOp(n.op).label : model.spec.groups?.find((g) => g.id === id)?.label ?? id;
  };
  const preds = specId ? model.spec.edges.filter((e) => e.to === specId && isDataEdge(e)).map((e) => e.from) : [];
  const succs = specId ? model.spec.edges.filter((e) => e.from === specId).map((e) => e.to) : [];
  const basics = op ? BASICS.filter((b) => b.relatedOps?.includes(info!.node.op)).slice(0, 4) : [];
  const quiz = architecture.quizQuestions.find((q) => q.targetNodeId === component.id || q.targetNodeId === specId);
  const journeyLine = story.journey[Math.min(idx, story.journey.length - 1)];

  const go = (d: number) => {
    const next = comps[idx + d];
    if (!next) return;
    const id = model.specIdForComponent.get(next.id);
    if (id) select(id);
  };

  const section = 'p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]';
  const h = 'text-[10px] font-bold uppercase tracking-wider text-[#8d847c] mb-2 flex items-center gap-1.5';
  const cur = steps[step];

  return (
    <Modal
      title={component.name}
      kicker={`Deep dive · part ${idx + 1} of ${comps.length} · ${architecture.name}`}
      icon={<BookOpen className="w-4 h-4" />}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => go(-1)} disabled={idx <= 0} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#534a43] hover:bg-stone-100 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">{comps[idx - 1]?.name ?? 'Previous'}</span>
          </button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl text-xs font-semibold text-[#eb7c6b]">
            Show in 3D
          </button>
          <button onClick={() => go(1)} disabled={idx >= comps.length - 1} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold disabled:opacity-30">
            <span className="hidden sm:inline">Next: {comps[idx + 1]?.name ?? 'end'}</span>
            <span className="sm:hidden">Next</span> <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div ref={bodyRef} className="p-4 sm:p-5 space-y-4">
        {/* 1 — where it sits */}
        <section className={section}>
          <div className={h}>
            <Boxes className="w-3.5 h-3.5" /> 1 · Where it sits
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {preds.length ? preds.map((p) => <span key={p} className="px-2 py-1 rounded-lg bg-[#eef7fa] text-[#2a7f9a]">{labelOf(p)}</span>) : <span className="px-2 py-1 rounded-lg bg-[#f3eee5] text-[#8d847c]">real input</span>}
            <ChevronRight className="w-4 h-4 text-[#8d847c]" />
            <span className="px-2.5 py-1 rounded-lg bg-[#eb7c6b] text-white font-semibold">{component.name}</span>
            <ChevronRight className="w-4 h-4 text-[#8d847c]" />
            {succs.length ? succs.slice(0, 3).map((p) => <span key={p} className="px-2 py-1 rounded-lg bg-[#fdf0ec] text-[#c55d4c]">{labelOf(p)}</span>) : <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">final output</span>}
          </div>
          {journeyLine && <p className="text-sm text-[#534a43] mt-2 leading-relaxed">{journeyLine}</p>}
        </section>

        {/* 2 — in one sentence */}
        <section className="p-4 rounded-2xl bg-[#eb7c6b] text-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 2 · In one sentence
          </div>
          <p className="font-serif text-lg leading-snug mt-0.5">“{component.fiveYearOldWhy}”</p>
          <p className="text-sm text-white/90 mt-2 leading-relaxed">{component.description}</p>
        </section>

        {/* 3 — what goes in */}
        {info?.inputs[0] && (
          <section className={section}>
            <div className={h}>
              <ArrowDownToLine className="w-3.5 h-3.5 text-[#3FA7C9]" /> 3 · What goes in — {fmtSym(info.inputs[0])}
            </div>
            <ShapeExplainer shape={info.inputs[0]} tone="in" />
            {info.inputs.length > 1 && <p className="text-xs text-[#534a43] mt-2">Plus {info.inputs.length - 1} more input{info.inputs.length > 2 ? 's' : ''}: {info.inputs.slice(1).map(fmtSym).join(', ')} (e.g. a residual or skip connection).</p>}
          </section>
        )}

        {/* 4 — what happens inside */}
        {cur && (
          <section className="p-4 rounded-2xl bg-[#2f2a27] text-[#f3e9dc] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#f5b3a8]">4 · What happens inside — worked example</div>
              <span className="text-[10px] font-mono text-white/60">
                step {step + 1}/{steps.length}
              </span>
            </div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#eb7c6b]' : 'bg-white/15'}`} aria-label={`Step ${i + 1}`} />
              ))}
            </div>
            <h4 className="font-serif text-xl text-white">{cur.title}</h4>
            <p className="text-sm leading-relaxed text-white/85">{cur.text}</p>
            {cur.table && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {cur.table.cols.map((c) => (
                        <th key={c} className="text-left font-semibold text-[#f5d9a8] px-2 py-1.5 border-b border-white/15 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cur.table.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j} className={`px-2 py-1.5 border-b border-white/5 whitespace-nowrap ${j === 0 ? 'text-white/70' : 'text-white'}`}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {cur.formula && (
              <div className="text-[#ffe7c4] pt-1">
                <Formula tex={cur.formula} />
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-3 py-1.5 rounded-lg text-xs bg-white/10 disabled:opacity-30">
                ← Back
              </button>
              <button
                onClick={() => {
                  setStep(Math.min(steps.length - 1, step + 1));
                  playSfx('step');
                }}
                disabled={step === steps.length - 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#eb7c6b] text-white font-semibold disabled:opacity-30"
              >
                Next step →
              </button>
            </div>
          </section>
        )}

        {/* 5 — what comes out */}
        {info && (
          <section className={section}>
            <div className={h}>
              <ArrowUpFromLine className="w-3.5 h-3.5 text-[#eb7c6b]" /> 5 · What comes out — {fmtSym(info.out)}
            </div>
            <ShapeExplainer shape={info.out} tone="out" />
            <p className="text-sm text-[#534a43] mt-2">{shapeChange(info.inputs[0], info.out)}</p>
          </section>
        )}

        {/* 6 — the formula */}
        {(component.mathFormula || op?.formula) && (
          <section className={section}>
            <div className={h}>6 · The formula</div>
            <div className="text-[#2f2a27]">
              <Formula tex={component.mathFormula || op!.formula!} />
            </div>
            {op?.symbols && (
              <ul className="mt-2 space-y-1 text-xs text-[#534a43]">
                {op.symbols.in.slice(0, Math.max(1, preds.length)).map((s, i) => (
                  <li key={s}>
                    <b className="font-mono text-[#2a7f9a]">{s}</b> — the input{preds[i] ? ` from “${labelOf(preds[i])}”` : ''}
                    {info?.inputs[i] ? ` ${fmtNum(info.inputs[i])}` : ''}
                  </li>
                ))}
                <li>
                  <b className="font-mono text-[#c55d4c]">{op.symbols.out}</b> — this part’s output {info ? fmtNum(info.out) : ''}
                </li>
                {component.explanation && <li className="pt-1">{component.explanation}</li>}
              </ul>
            )}
          </section>
        )}

        {/* 7 — size & cost */}
        {info && (
          <section>
          <div className={h}>
            <Cpu className="w-3.5 h-3.5" /> 7 · Size & cost
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Cpu className="w-3.5 h-3.5" />, label: 'Learned numbers', value: fmtCount(info.params), hint: info.multiplicity > 1 ? `× ${info.multiplicity} copies = ${fmtCount(info.params * info.multiplicity)}` : info.params ? 'weights + biases' : 'no weights — pure arithmetic' },
              { icon: <Database className="w-3.5 h-3.5" />, label: 'Output size', value: fmtCount(numel(info.out)), hint: `${fmtBytes(numel(info.out) * 2)} at 16-bit` },
              { icon: <Boxes className="w-3.5 h-3.5" />, label: 'Share of model', value: model.infer.totalParams ? `${((info.params * info.multiplicity * 100) / model.infer.totalParams).toFixed(1)}%` : '—', hint: `of ${fmtCount(model.infer.totalParams)} parameters` },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-[#8d847c]">
                  {s.icon} {s.label}
                </div>
                <div className="font-mono font-bold text-base text-[#2f2a27]">{s.value}</div>
                <div className="text-[10px] text-[#8d847c] leading-tight">{s.hint}</div>
              </div>
            ))}
          </div>
          </section>
        )}

        {/* 8 — why it matters */}
        {component.componentImpact && (
          <section className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> 8 · What breaks without it
            </div>
            <p className="text-sm text-rose-900">{component.componentImpact.replace(/^IF MISSING:\s*/i, '')}</p>
          </section>
        )}

        {component.keyMetrics.length > 0 && (
          <section className="flex flex-wrap gap-1.5">
            {component.keyMetrics.map((m) => (
              <span key={m.label} className="px-2.5 py-1 rounded-full bg-[#f3eee5] text-[11px] text-[#534a43]">
                {m.label}: <b className="text-[#2f2a27]">{m.value}</b>
              </span>
            ))}
          </section>
        )}

        {/* 9 — basics behind it */}
        {basics.length > 0 && (
          <section className={section}>
            <div className={h}>
              <GraduationCap className="w-3.5 h-3.5 text-[#8d6bcc]" /> 9 · Learn the basics behind it
            </div>
            <div className="flex flex-wrap gap-1.5">
              {basics.map((b) => (
                <button key={b.id} onClick={() => openBasics(b.id)} className="px-2.5 py-1.5 rounded-xl text-xs bg-[#f6f1fb] border border-[#8d6bcc]/25 text-[#5b3fb3] hover:border-[#8d6bcc]" title={b.eli5}>
                  {b.name} →
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 10 — check yourself */}
        <section className="p-4 rounded-2xl bg-[#f3eee5] border border-[rgba(117,91,70,0.14)] space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8d6bcc]">10 · Check yourself</div>
          {quiz ? (
            <>
              <p className="text-sm font-semibold text-[#2f2a27]">{quiz.question}</p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {quiz.options.map((o, i) => (
                  <button
                    key={o}
                    onClick={() => {
                      setPicked(i);
                      playSfx(i === quiz.correctOptionIndex ? 'correct' : 'wrong');
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-xs border ${
                      picked === null ? 'bg-white border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b]' : i === quiz.correctOptionIndex ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : i === picked ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white opacity-60 border-transparent'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {picked !== null && <p className="text-xs text-[#534a43]">{quiz.explanation}</p>}
            </>
          ) : info?.inputs[0] ? (
            <>
              <p className="text-sm font-semibold text-[#2f2a27]">
                Input shape {fmtNum(info.inputs[0])} goes in. What shape comes out?
              </p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {[fmtNum(info.out), fmtNum(info.inputs[0]), `(${info.out.num.slice(0, -1).concat(Math.max(1, Math.round(info.out.num[info.out.num.length - 1] / 2))).join(', ')})`]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .sort()
                  .map((o) => {
                    const right = o === fmtNum(info.out);
                    return (
                      <button
                        key={o}
                        onClick={() => {
                          setPicked(right ? 1 : 0);
                          playSfx(right ? 'correct' : 'wrong');
                        }}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-mono border ${picked === null ? 'bg-white border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b]' : right ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-white opacity-60 border-transparent'}`}
                      >
                        {o}
                      </button>
                    );
                  })}
              </div>
              {picked !== null && (
                <p className="text-xs text-[#534a43] flex gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {shapeChange(info.inputs[0], info.out)}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[#534a43]">This is where data enters the model — follow the Next button to see what happens to it.</p>
          )}
        </section>
      </div>
    </Modal>
  );
};
