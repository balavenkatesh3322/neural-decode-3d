import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { FlowMode } from '../../store/useAppStore';
import { EDGE_COLORS } from './edges';
import type { EdgeKind } from '../spec/schema';

export interface FlowEdge {
  id: string;
  curve: THREE.CatmullRomCurve3;
  kind: EdgeKind;
  /** Depth of the edge's source in the visible graph (forward wave order). */
  level: number;
  /** Depth of the edge's target. */
  targetLevel: number;
  to: string;
  /** Packet radius — bigger tensors make bigger packets. */
  size: number;
  inactive?: boolean;
}

const TRAIL = 3;
const sphere = new THREE.SphereGeometry(1, 14, 10);
const BACKPROP = new THREE.Color('#e5486b');

/**
 * Tensor "packets" travelling along the real edges of the graph.
 * - forward: a wave sweeps from inputs to outputs in dependency order
 * - backward: gradients sweep outputs → inputs, in rose
 * - off + focusId: packets loop only on the edges feeding the focused node
 */
export const FlowPackets: React.FC<{
  edges: FlowEdge[];
  mode: FlowMode;
  focusId?: string | null;
  speed?: number;
}> = ({ edges, mode, focusId, speed = 1 }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const clock = useRef(0);
  const maxLevel = useMemo(() => edges.reduce((m, e) => Math.max(m, e.targetLevel), 1), [edges]);
  const count = Math.max(1, edges.length * TRAIL);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    edges.forEach((e, i) => {
      for (let k = 0; k < TRAIL; k++) {
        c.set(mode === 'backward' ? BACKPROP : EDGE_COLORS[e.kind]);
        if (mode !== 'backward' && e.kind === 'data') c.set('#eb7c6b');
        mesh.setColorAt(i * TRAIL + k, c);
      }
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [edges, mode]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    clock.current += Math.min(dt, 0.05) * speed * (mode === 'backward' ? 1.3 : 1);
    const cycle = maxLevel + 1.6;
    const t = clock.current % cycle;

    edges.forEach((e, i) => {
      for (let k = 0; k < TRAIL; k++) {
        let local = -1;
        if (mode === 'forward') local = t - e.level - k * 0.07;
        else if (mode === 'backward') local = t - (maxLevel - e.targetLevel) - k * 0.07;
        else if (focusId && e.to === focusId) local = ((clock.current * 0.8) % 1) - k * 0.07;

        const visible = local >= 0 && local <= 1 && !e.inactive;
        if (visible) {
          const u = mode === 'backward' ? 1 - local : local;
          e.curve.getPointAt(Math.min(1, Math.max(0, u)), p);
          const r = e.size * (1 - k * 0.28);
          s.set(r, r, r);
        } else {
          s.set(0, 0, 0);
        }
        m.compose(p, q, s);
        mesh.setMatrixAt(i * TRAIL + k, m);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[sphere, undefined, count]} frustumCulled={false} key={count}>
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.25} toneMapped={false} roughness={0.3} />
    </instancedMesh>
  );
};
