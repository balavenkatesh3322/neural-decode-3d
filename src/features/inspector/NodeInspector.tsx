import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, ArrowUpFromLine, BookOpen, Maximize2, Minimize2, Cpu, Database, Layers } from 'lucide-react';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { getOp } from '../../engine/ops';
import { fmtBytes, fmtCount, fmtNum, fmtSym, numel } from '../../engine/graph/shape';
import { nodesInGroup } from '../../engine/graph/visible';
import { evalExpr } from '../../engine/graph/expr';
import { isDataEdge } from '../../engine/graph/infer';
import { useAppStore } from '../../store/useAppStore';
import { Formula } from '../../components/common/Formula';

const Chip: React.FC<{ label: string; onClick: () => void; tone: 'up' | 'down' }> = ({ label, onClick, tone }) => (
  <button
    onClick={onClick}
    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
      tone === 'up' ? 'border-[#3FA7C9]/40 text-[#2a7f9a] hover:bg-[#3FA7C9]/10' : 'border-[#eb7c6b]/40 text-[#c55d4c] hover:bg-[#eb7c6b]/10'
    }`}
  >
    {label}
  </button>
);

/** Explains the selected node or group: shapes in → out, parameters, memory, formula, neighbours. */
export const NodeInspector: React.FC<{ model: ArchitectureModel }> = ({ model }) => {
  const selectedId = useAppStore((s) => s.selectedId);
  const select = useAppStore((s) => s.select);
  const hover = useAppStore((s) => s.hover);
  const openModal = useAppStore((s) => s.openModal);
  const collapsed = useAppStore((s) => s.collapsed[s.archId]);
  const toggleCollapsed = useAppStore((s) => s.toggleCollapsed);
  const numeric = useAppStore((s) => s.view.numericShapes);
  const { spec, infer, componentForSpecId } = model;

  const data = useMemo(() => {
    if (!selectedId) return null;
    const labelOf = (id: string) => {
      const n = spec.nodes.find((x) => x.id === id);
      if (n) return n.label ?? getOp(n.op).label;
      return spec.groups?.find((g) => g.id === id)?.label ?? id;
    };
    const group = spec.groups?.find((g) => g.id === selectedId);
    const comp = componentForSpecId.get(selectedId);
    const preds = spec.edges.filter((e) => e.to === selectedId).map((e) => ({ id: e.from, label: labelOf(e.from), kind: e.kind }));
    const succs = spec.edges.filter((e) => e.from === selectedId).map((e) => ({ id: e.to, label: labelOf(e.to), kind: e.kind }));

    if (group) {
      const members = nodesInGroup(spec, group.id);
      const params = members.reduce((s, id) => s + (infer.nodes.get(id)?.params ?? 0), 0);
      let repeat = 1;
      try {
        repeat = group.repeat ? Math.round(evalExpr(group.repeat, infer.scope)) : 1;
      } catch {
        /* keep 1 */
      }
      return { kind: 'group' as const, group, comp, members, params, repeat, preds, succs };
    }

    const info = infer.nodes.get(selectedId);
    if (!info) return null;
    const op = getOp(info.node.op);
    const dataPreds = spec.edges.filter((e) => e.to === selectedId && isDataEdge(e));
    return { kind: 'node' as const, info, op, comp, preds, succs, dataPreds };
  }, [selectedId, spec, infer, componentForSpecId]);

  const fmt = (s: { sym: string[]; num: number[] }) => (numeric ? fmtNum(s) : fmtSym(s));

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="absolute left-2 right-2 bottom-[96px] max-h-[46%] lg:left-[80px] lg:right-auto lg:bottom-auto lg:top-5 lg:w-[330px] lg:max-h-[calc(100%-210px)] overflow-y-auto custom-scrollbar z-30 rounded-[20px] bg-[rgba(255,252,247,0.95)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_18px_40px_rgba(87,62,43,0.14)] font-sans select-text"
        >
          <div className="p-4 space-y-3">
            {/* header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#eb7c6b]">
                  {data.kind === 'group' ? `Block${data.repeat > 1 ? ` · repeated ×${data.repeat}` : ''}` : `${data.op.family} · ${data.op.label}`}
                </span>
                <h3 className="font-serif text-lg leading-tight text-[#2f2a27]">
                  {data.comp?.name ?? (data.kind === 'group' ? data.group.label : data.info.node.label ?? data.op.label)}
                </h3>
              </div>
              <button onClick={() => select(null)} className="p-1 rounded-lg text-[#8d847c] hover:text-[#2f2a27] hover:bg-stone-100" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* shapes in → out */}
            {data.kind === 'node' && (
              <div className="rounded-xl bg-[#2f2a27] text-white p-3 font-mono text-[11px] space-y-1.5">
                {data.info.inputs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-[#67c6e0] flex-shrink-0" />
                    <span className="text-white/60 truncate">{data.dataPreds[i]?.from ?? 'in'}</span>
                    <span className="ml-auto text-[#a9e2f1]">{fmt(s)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <ArrowUpFromLine className="w-3.5 h-3.5 text-[#eb7c6b] flex-shrink-0" />
                  <span className="text-white/60">out</span>
                  <span className="ml-auto text-[#f5b3a8] font-bold">{fmt(data.info.out)}</span>
                </div>
                {!numeric && <div className="text-[9px] text-white/40 pt-0.5">= {fmtNum(data.info.out)}</div>}
              </div>
            )}

            {/* stats */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {data.kind === 'node' ? (
                <>
                  <Stat icon={<Cpu className="w-3 h-3" />} label="Params" value={fmtCount(data.info.params)} hint={data.info.multiplicity > 1 ? `×${data.info.multiplicity} = ${fmtCount(data.info.params * data.info.multiplicity)}` : undefined} />
                  <Stat icon={<Database className="w-3 h-3" />} label="Activation (fp16)" value={fmtBytes(numel(data.info.out) * 2)} />
                  <Stat icon={<Layers className="w-3 h-3" />} label="Elements" value={fmtCount(numel(data.info.out))} />
                </>
              ) : (
                <>
                  <Stat icon={<Cpu className="w-3 h-3" />} label="Params / block" value={fmtCount(data.params)} />
                  <Stat icon={<Layers className="w-3 h-3" />} label="Repeats" value={`×${data.repeat}`} />
                  <Stat icon={<Cpu className="w-3 h-3" />} label="Total" value={fmtCount(data.params * data.repeat)} />
                </>
              )}
            </div>

            {/* formula */}
            {(data.comp?.mathFormula || (data.kind === 'node' && data.op.formula)) && (
              <div className="rounded-xl bg-[#fbf6ee] border border-[rgba(117,91,70,0.14)] px-3 py-2 text-[#2f2a27] text-[13px]">
                <Formula tex={data.comp?.mathFormula ?? (data.kind === 'node' ? data.op.formula! : '')} />
              </div>
            )}

            {/* formula symbols ↔ 3D parts */}
            {data.kind === 'node' && data.op.symbols && (
              <div className="flex flex-wrap gap-1 -mt-1" aria-label="What the symbols refer to">
                {data.dataPreds.map((e, i) => {
                  const sym = data.op.symbols!.in[Math.min(i, data.op.symbols!.in.length - 1)];
                  const src = data.preds.find((p) => p.id === e.from);
                  return (
                    <button
                      key={e.from + i}
                      onMouseEnter={() => hover(e.from)}
                      onMouseLeave={() => hover(null)}
                      onFocus={() => hover(e.from)}
                      onBlur={() => hover(null)}
                      onClick={() => select(e.from)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-[#3FA7C9]/40 text-[#2a7f9a] hover:bg-[#3FA7C9]/10"
                      title="Hover to highlight in 3D, click to go there"
                    >
                      <b>{sym}</b> ← {src?.label ?? e.from} {fmt(data.info.inputs[i])}
                    </button>
                  );
                })}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-[#eb7c6b]/40 text-[#c55d4c]">
                  <b>{data.op.symbols.out}</b> = this block’s output {fmt(data.info.out)}
                </span>
              </div>
            )}

            {/* explanation */}
            <p className="text-xs leading-relaxed text-[#534a43]">
              {data.comp?.description ?? (data.kind === 'node' ? data.op.describe : `A repeated block of ${data.members.length} operations.`)}
            </p>
            {(data.comp?.fiveYearOldWhy || (data.kind === 'node' && data.op.eli5)) && (
              <div className="p-2.5 rounded-xl bg-[#fff2c9] border border-[#f0e2b0] text-[11px] text-[#534a43]">
                <span className="font-bold text-[#8d6bcc]">Like I’m 5: </span>
                {data.comp?.fiveYearOldWhy ?? (data.kind === 'node' ? data.op.eli5 : '')}
              </div>
            )}
            {data.comp?.componentImpact && <p className="text-[11px] text-rose-700/90 leading-relaxed">{data.comp.componentImpact}</p>}

            {/* neighbours */}
            {(data.preds.length > 0 || data.succs.length > 0) && (
              <div className="space-y-1.5 pt-1 border-t border-[rgba(117,91,70,0.12)]">
                {data.preds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-[#8d847c] mr-1">Comes from</span>
                    {data.preds.map((p) => (
                      <Chip key={p.id + p.kind} label={p.label} tone="up" onClick={() => select(p.id)} />
                    ))}
                  </div>
                )}
                {data.succs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-[#8d847c] mr-1">Feeds into</span>
                    {data.succs.map((p) => (
                      <Chip key={p.id + p.kind} label={p.label} tone="down" onClick={() => select(p.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* actions */}
            <div className="flex gap-2 pt-1">
              {data.comp && (
                <button
                  onClick={() => openModal('detail')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#eb7c6b] text-white text-xs font-semibold hover:bg-[#e06a58] shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Deep-dive lesson
                </button>
              )}
              {data.kind === 'group' && (
                <button
                  onClick={() => toggleCollapsed(data.group.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-[#2f2a27] text-xs font-semibold hover:border-[#eb7c6b]"
                >
                  {collapsed?.includes(data.group.id) ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" /> Expand block
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" /> Collapse block
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string }> = ({ icon, label, value, hint }) => (
  <div className="rounded-xl bg-white border border-[rgba(117,91,70,0.12)] px-1.5 py-1.5">
    <div className="flex items-center justify-center gap-1 text-[9px] text-[#8d847c] uppercase tracking-wide">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    <div className="font-mono font-bold text-[13px] text-[#2f2a27]">{value}</div>
    {hint && <div className="font-mono text-[9px] text-[#8d847c]">{hint}</div>}
  </div>
);
