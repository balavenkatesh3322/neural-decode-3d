import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { materialProps, NodeStyle } from '../style';

/** A rounded slab using the node's interaction-aware material. */
export const Slab: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  style: NodeStyle;
  color?: string;
  radius?: number;
}> = ({ size, position, rotation, style, color, radius }) => {
  const r = radius ?? Math.min(0.08, Math.min(...size) / 3);
  return (
    <RoundedBox args={size} radius={r} smoothness={3} position={position} rotation={rotation}>
      <meshStandardMaterial {...materialProps(style, color)} />
    </RoundedBox>
  );
};

const unitBox = new THREE.BoxGeometry(1, 1, 1);

/**
 * A grid of small cells drawn with one InstancedMesh (one draw call).
 * `plane: 'xz'` lies flat (seen from above), `'xy'` faces the camera.
 */
export const InstancedGrid: React.FC<{
  rows: number;
  cols: number;
  width: number;
  depth: number;
  cellHeight?: number;
  plane?: 'xz' | 'xy';
  position?: [number, number, number];
  colorAt: (r: number, c: number, out: THREE.Color) => THREE.Color;
  style: NodeStyle;
  /** Optional per-cell scale (0 hides the cell). */
  scaleAt?: (r: number, c: number) => number;
  version?: unknown;
}> = ({ rows, cols, width, depth, cellHeight = 0.05, plane = 'xz', position, colorAt, style, scaleAt, version }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = rows * cols;
  const mat = materialProps(style);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    const cw = width / cols;
    const ch = depth / rows;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = scaleAt ? scaleAt(r, c) : 1;
        const x = -width / 2 + cw * (c + 0.5);
        const y = -depth / 2 + ch * (r + 0.5);
        if (plane === 'xz') {
          p.set(x, 0, y);
          s.set(cw * 0.86 * k, cellHeight, ch * 0.86 * k);
        } else {
          p.set(x, -y, 0);
          s.set(cw * 0.86 * k, ch * 0.86 * k, cellHeight);
        }
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, colorAt(r, c, col));
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, width, depth, cellHeight, plane, version]);

  return (
    <instancedMesh ref={ref} args={[unitBox, undefined, count]} position={position} frustumCulled={false}>
      <meshStandardMaterial
        roughness={0.55}
        metalness={0}
        transparent={mat.transparent}
        opacity={mat.opacity}
        depthWrite={mat.depthWrite}
        toneMapped
      />
    </instancedMesh>
  );
};

/** Pre-computed seeded matrix of values in [-1, 1]. */
export function useSeededMatrix(rows: number, cols: number, rand: () => number) {
  return useMemo(() => {
    const out: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) row.push((rand() * 2 - 1) * (0.35 + rand() * 0.65));
      out.push(row);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols]);
}
