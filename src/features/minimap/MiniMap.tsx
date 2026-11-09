import React, { useMemo, useState } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import type { SceneModel } from '../../engine/scene';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { getOp } from '../../engine/ops';
import { EDGE_COLORS } from '../../engine/render/edges';
import { useAppStore } from '../../store/useAppStore';

/**
 * A flat 2D map of the same laid-out graph. Click a block to fly there — handy for
 * orientation in tall models, and a non-3D way to read the structure.
 */
export const MiniMap: React.FC<{ model: ArchitectureModel; scene: SceneModel }> = ({ model, scene }) => {
  const [open, setOpen] = useState(true);
  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredId = useAppStore((s) => s.hoveredId);
  const select = useAppStore((s) => s.select);
  const hover = useAppStore((s) => s.hover);
  const { layout, visible } = scene;

  const { minX, minY, w, h } = useMemo(() => {
    const pad = 0.6;
    return {
      minX: layout.bounds.min[0] - pad,
      minY: layout.bounds.min[1] - pad,
      w: layout.bounds.max[0] - layout.bounds.min[0] + pad * 2,
      h: layout.bounds.max[1] - layout.bounds.min[1] + pad * 2,
    };
  }, [layout]);

  // SVG y grows downward; the 3D graph flows upward
  const Y = (y: number) => minY + h - (y - minY);
  const sel = selectedId ? visible.rep.get(selectedId) ?? selectedId : null;
  const hov = hoveredId ? visible.rep.get(hoveredId) ?? hoveredId : null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="hidden lg:flex absolute right-5 bottom-24 z-20 items-center gap-1.5 px-3 py-2 rounded-full bg-[rgba(255,252,247,0.94)] border border-[rgba(117,91,70,0.18)] text-[11px] font-semibold text-[#534a43] shadow-sm" title="Show the 2D map">
        <MapIcon className="w-3.5 h-3.5 text-[#eb7c6b]" /> Map
      </button>
    );
  }

  const aspect = w / h;
  const boxH = 230;
  const boxW = Math.min(190, Math.max(90, boxH * aspect));

  return (
    <div className="hidden lg:block absolute right-5 bottom-24 z-20 rounded-2xl bg-[rgba(255,252,247,0.94)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_12px_32px_rgba(87,62,43,0.1)] p-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#8d847c] flex items-center gap-1">
          <MapIcon className="w-3 h-3" /> Map
        </span>
        <button onClick={() => setOpen(false)} className="text-[#8d847c] hover:text-[#2f2a27]" aria-label="Hide map">
          <X className="w-3 h-3" />
        </button>
      </div>
      <svg viewBox={`${minX} ${minY} ${w} ${h}`} width={boxW} height={boxH} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Map of ${model.architecture.name}`}>
        {visible.groups.map((g) => {
          const lg = layout.groups.get(g.id);
          if (!lg) return null;
          return (
            <rect
              key={g.id}
              x={lg.pos[0] - lg.w / 2}
              y={Y(lg.pos[1]) - lg.h / 2}
              width={lg.w}
              height={lg.h}
              rx={0.3}
              fill={g.color ?? '#9c8b7b'}
              fillOpacity={0.08}
              stroke={g.color ?? '#9c8b7b'}
              strokeOpacity={0.5}
              strokeWidth={0.06}
            />
          );
        })}
        {visible.edges.map((e) => {
          const le = layout.edges.get(e.id);
          if (!le) return null;
          return (
            <polyline
              key={e.id}
              points={le.points.map((p) => `${p[0]},${Y(p[1])}`).join(' ')}
              fill="none"
              stroke={e.to === sel ? '#3FA7C9' : e.from === sel ? '#eb7c6b' : EDGE_COLORS[e.kind]}
              strokeWidth={e.to === sel || e.from === sel ? 0.16 : 0.07}
              strokeDasharray={e.kind === 'control' || e.kind === 'condition' ? '0.2 0.15' : undefined}
              opacity={0.85}
            />
          );
        })}
        {visible.nodes.map((n) => {
          const ln = layout.nodes.get(n.id);
          if (!ln) return null;
          const info = model.infer.nodes.get(n.id);
          const color = n.kind === 'group' ? model.spec.groups?.find((g) => g.id === n.id)?.color ?? '#9c8b7b' : getOp(info?.node.op ?? 'custom').color;
          const active = n.id === sel;
          return (
            <rect
              key={n.id}
              x={ln.pos[0] - ln.size.w / 2}
              y={Y(ln.pos[1]) - ln.size.h / 2}
              width={ln.size.w}
              height={Math.max(ln.size.h, 0.25)}
              rx={0.12}
              fill={color}
              stroke={active ? '#eb7c6b' : n.id === hov ? '#2f2a27' : 'none'}
              strokeWidth={0.18}
              className="cursor-pointer"
              onClick={() => select(n.id)}
              onMouseEnter={() => hover(n.id)}
              onMouseLeave={() => hover(null)}
            >
              <title>{info?.node.label ?? n.id}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
};
