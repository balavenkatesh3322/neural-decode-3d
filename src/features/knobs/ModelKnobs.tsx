import React, { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal, Minimize2, Maximize2 } from 'lucide-react';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { inferGraph } from '../../engine/graph/infer';
import { fmtCount } from '../../engine/graph/shape';
import { EDGE_COLORS, EDGE_LEGEND } from '../../engine/render/edges';
import { useAppStore } from '../../store/useAppStore';

/**
 * "What if?" panel: change model hyper-parameters and watch every tensor shape
 * and the total parameter count update live in 3D.
 */
export const ModelKnobs: React.FC<{ model: ArchitectureModel }> = ({ model }) => {
  const [open, setOpen] = useState(false);
  const overrides = useAppStore((s) => s.overrides[s.archId]);
  const setOverride = useAppStore((s) => s.setOverride);
  const resetOverrides = useAppStore((s) => s.resetOverrides);
  const collapsed = useAppStore((s) => s.collapsed[s.archId]);
  const setCollapsedAll = useAppStore((s) => s.setCollapsedAll);
  const { spec, infer } = model;

  const baseline = useMemo(() => inferGraph(spec).totalParams, [spec]);
  const delta = infer.totalParams / baseline;
  const groupIds = (spec.groups ?? []).filter((g) => !g.parent).map((g) => g.id);
  const allCollapsed = groupIds.length > 0 && groupIds.every((g) => collapsed?.includes(g));
  const changed = overrides && Object.keys(overrides).length > 0;

  return (
    <div className="absolute top-[58px] right-2 lg:top-5 lg:right-5 z-20 w-[min(268px,calc(100%-16px))] rounded-[20px] bg-[rgba(255,252,247,0.94)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_12px_32px_rgba(87,62,43,0.1)] select-none font-sans overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/60">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8d6bcc]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#eb7c6b]" /> What-if lab
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#2f2a27]">{fmtCount(infer.totalParams)} params</span>
          <ChevronDown className={`w-4 h-4 text-[#8d847c] transition-transform ${open ? '' : '-rotate-90'}`} />
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3 max-h-[52vh] overflow-y-auto custom-scrollbar">
          {changed && (
            <div className="flex items-center justify-between text-[10px] font-mono -mt-1">
              <span className={delta >= 1 ? 'text-rose-600' : 'text-emerald-700'}>
                {delta >= 1 ? '▲' : '▼'} {Math.abs((delta - 1) * 100).toFixed(1)}% vs. default ({fmtCount(baseline)})
              </span>
              <button onClick={resetOverrides} className="flex items-center gap-1 text-[#8d847c] hover:text-[#eb7c6b]">
                <RotateCcw className="w-3 h-3" /> reset
              </button>
            </div>
          )}

          {(spec.controls ?? []).map((c) => {
            const value = infer.scope[c.key];
            const opts = c.options;
            const idx = opts ? Math.max(0, opts.findIndex((o) => o >= value)) : 0;
            return (
              <label key={c.key} className="block space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#534a43]">{c.label}</span>
                  <span className="font-mono font-bold text-[#2f2a27]">{value.toLocaleString('en-US')}</span>
                </div>
                <input
                  type="range"
                  className="w-full accent-[#eb7c6b] h-1.5"
                  min={opts ? 0 : c.min}
                  max={opts ? opts.length - 1 : c.max}
                  step={opts ? 1 : c.step ?? 1}
                  value={opts ? idx : value}
                  onChange={(e) => setOverride(c.key, opts ? opts[Number(e.target.value)] : Number(e.target.value))}
                />
              </label>
            );
          })}

          {groupIds.length > 0 && (
            <button
              onClick={() => setCollapsedAll(allCollapsed ? [] : groupIds)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white border border-[rgba(117,91,70,0.18)] text-[11px] font-semibold text-[#2f2a27] hover:border-[#eb7c6b]"
            >
              {allCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              {allCollapsed ? 'Expand all blocks' : 'Collapse blocks (overview)'}
            </button>
          )}

          <div className="pt-2 border-t border-[rgba(117,91,70,0.12)] space-y-1">
            {EDGE_LEGEND.filter((l) => spec.edges.some((e) => (e.kind ?? 'data') === l.kind)).map((l) => (
              <div key={l.kind} className="flex items-center gap-2 text-[10px] text-[#534a43]">
                <span
                  className="w-5 h-0 border-t-2"
                  style={{ borderColor: EDGE_COLORS[l.kind], borderStyle: l.kind === 'control' || l.kind === 'condition' ? 'dashed' : 'solid' }}
                />
                {l.label}
              </div>
            ))}
            <p className="text-[10px] text-[#8d847c] pt-1 leading-snug">
              Click any part to inspect it · double-click a block to collapse/expand · drag to orbit, scroll to zoom.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
