import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Label3D } from './Label3D';
import { easing } from 'maath';
import { Maximize2 } from 'lucide-react';
import type { VisualKind } from '../ops';
import type { Footprint } from '../layout/footprint';
import type { Shape } from '../graph/shape';
import { fmtNum, fmtSym } from '../graph/shape';
import { NodeStyle } from './style';
import { GroupNodeVisual, Visual } from './visuals';

export interface NodeViewProps {
  id: string;
  target: [number, number, number];
  size: Footprint;
  kind: VisualKind | 'group';
  style: NodeStyle;
  shape: Shape;
  label: string;
  op: string;
  params: Record<string, any>;
  tokens?: string[];
  stepNumber?: number;
  repeat?: number;
  live: boolean;
  showShape: boolean;
  numericShape: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onExpand?: () => void;
}

export const NodeView: React.FC<NodeViewProps> = (p) => {
  const ref = useRef<THREE.Group>(null);
  const first = useRef(true);

  // glide to the laid-out position whenever the layout changes
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (first.current) {
      g.position.set(...p.target);
      first.current = false;
      return;
    }
    easing.damp3(g.position, p.target, 0.25, dt);
  });

  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  const dim = p.style.emphasis === 'dim';
  const highlighted = p.style.emphasis === 'selected' || p.style.emphasis === 'active';

  return (
    <group
      ref={ref}
      onClick={(e) => {
        stop(e);
        p.onSelect(p.id);
      }}
      onDoubleClick={(e) => {
        stop(e);
        p.onExpand?.();
      }}
      onPointerOver={(e) => {
        stop(e);
        p.onHover(p.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        p.onHover(null);
        document.body.style.cursor = '';
      }}
    >
      {p.kind === 'group' ? (
        <GroupNodeVisual size={p.size} style={p.style} shape={p.shape} seed={p.id} live={p.live} op={p.op} params={p.params} repeat={p.repeat} />
      ) : (
        <Visual kind={p.kind} size={p.size} style={p.style} shape={p.shape} seed={p.id} live={p.live} op={p.op} params={p.params} tokens={p.tokens} />
      )}

      <Label3D position={[0, -p.size.h / 2 - 0.08, p.size.d / 2]} origin="center top">
        <div
          className={`flex items-center gap-1 translate-y-1/2 select-none whitespace-nowrap font-sans transition-opacity ${dim ? 'opacity-25' : 'opacity-100'}`}
          onPointerEnter={() => p.onHover(p.id)}
          onPointerLeave={() => p.onHover(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              p.onSelect(p.id);
            }}
            className={`flex items-center gap-1 pl-1 pr-2 py-[2px] rounded-full border text-[10px] shadow-sm transition-colors ${
              highlighted
                ? 'bg-[#eb7c6b] border-[#eb7c6b] text-white'
                : 'bg-[rgba(255,252,247,0.94)] border-[rgba(117,91,70,0.2)] text-[#2f2a27] hover:border-[#eb7c6b]'
            }`}
          >
            {p.stepNumber !== undefined ? (
              <span className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center ${highlighted ? 'bg-white text-[#eb7c6b]' : 'bg-[#eb7c6b] text-white'}`}>
                {p.stepNumber}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: p.style.color }} />
            )}
            <span className="font-semibold">{p.label}</span>
            {p.repeat && p.repeat > 1 && <span className="font-mono text-[9px] opacity-80">×{p.repeat}</span>}
            {p.showShape && p.shape.num.length > 0 && (
              <span className={`font-mono text-[9px] ${highlighted ? 'text-white/85' : 'text-[#8d847c]'}`}>
                {p.numericShape ? fmtNum(p.shape) : fmtSym(p.shape)}
              </span>
            )}
          </button>
          {p.kind === 'group' && p.onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                p.onExpand?.();
              }}
              title="Expand this block"
              className="w-5 h-5 rounded-full flex items-center justify-center bg-white/90 border border-[rgba(117,91,70,0.2)] text-[#8d847c] hover:text-[#eb7c6b]"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </Label3D>
    </group>
  );
};
