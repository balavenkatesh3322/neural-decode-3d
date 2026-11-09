import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Label3D } from './Label3D';
import { Minimize2 } from 'lucide-react';
import type { LaidOutGroup } from '../layout/layout';

/**
 * An expanded group: a translucent panel behind its children with a title tab.
 * Repeated blocks (×N) get ghost outlines stacked behind to show depth.
 */
export const GroupFrame: React.FC<{
  group: LaidOutGroup;
  label: string;
  color: string;
  repeat: number;
  stepNumber?: number;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}> = ({ group, label, color, repeat, stepNumber, selected, onToggle, onSelect }) => {
  const { w, h } = group;
  const outline = useMemo(() => {
    const r = 0.25;
    const pts: THREE.Vector3[] = [];
    const corners: [number, number, number][] = [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, Math.PI / 2],
      [-w / 2 + r, -h / 2 + r, Math.PI],
      [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
    ];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= 6; i++) {
        const a = a0 + (i / 6) * (Math.PI / 2);
        pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
      }
    }
    pts.push(pts[0].clone());
    return pts;
  }, [w, h]);

  const ghosts = Math.min(Math.max(repeat - 1, 0), 3);

  return (
    <group position={group.pos}>
      {/* back panel */}
      <mesh position={[0, 0, -1.2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <Line points={outline} color={selected ? '#eb7c6b' : color} lineWidth={selected ? 2.4 : 1.4} transparent opacity={0.75} position={[0, 0, -1.2]} />
      {Array.from({ length: ghosts }, (_, i) => (
        <Line
          key={i}
          points={outline}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.35 - i * 0.09}
          dashed
          dashSize={0.25}
          gapSize={0.15}
          position={[(i + 1) * 0.16, (i + 1) * 0.16, -1.2 - (i + 1) * 0.45]}
        />
      ))}
        <Label3D position={[-w / 2 + 1.4, h / 2 - 0.25, -1.2]} zIndexRange={[14, 0]}>
          <div className="flex items-center gap-1.5 select-none whitespace-nowrap font-sans">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-[rgba(255,252,247,0.95)] hover:bg-white shadow-sm"
              style={{ borderColor: `${color}66`, color: '#2f2a27' }}
            >
              {stepNumber !== undefined && (
                <span className="w-4 h-4 rounded-full text-[9px] font-mono font-bold text-white flex items-center justify-center bg-[#eb7c6b]">
                  {stepNumber}
                </span>
              )}
              <span>{label}</span>
              {repeat > 1 && (
                <span className="font-mono text-[10px] px-1 rounded" style={{ background: `${color}22`, color }}>
                  ×{repeat}
                </span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              title="Collapse this block"
              className="w-5 h-5 rounded-full flex items-center justify-center bg-white/90 border border-[rgba(117,91,70,0.2)] text-[#8d847c] hover:text-[#eb7c6b]"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </Label3D>
    </group>
  );
};
