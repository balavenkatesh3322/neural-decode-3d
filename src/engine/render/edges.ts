import * as THREE from 'three';
import type { EdgeKind } from '../spec/schema';

export const EDGE_COLORS: Record<EdgeKind, string> = {
  data: '#9c8b7b',
  residual: '#3f9e98',
  skip: '#4f7fd9',
  control: '#a466c2',
  condition: '#d39a2f',
};

export const EDGE_LEGEND: { kind: EdgeKind; label: string }[] = [
  { kind: 'data', label: 'Main data path' },
  { kind: 'residual', label: 'Residual / shortcut' },
  { kind: 'skip', label: 'Skip / memory link' },
  { kind: 'control', label: 'Routing / gating signal' },
  { kind: 'condition', label: 'Conditioning (time, text)' },
];

/**
 * Smooth 3D curve through elk's 2D route. Side-channel edges (residual, skip,
 * condition…) bow out toward the viewer so they read as bypasses in 3D.
 */
export function makeEdgeCurve(points: [number, number, number][], kind: EdgeKind): THREE.CatmullRomCurve3 {
  let pts = points.map((p) => new THREE.Vector3(...p));
  if (pts.length === 2) pts = [pts[0], pts[0].clone().lerp(pts[1], 0.5), pts[1]];
  const bulge = kind === 'data' ? 0 : kind === 'residual' ? 0.9 : 0.6;
  if (bulge) {
    const n = pts.length - 1;
    pts = pts.map((p, i) => p.clone().setZ(p.z + Math.sin((i / n) * Math.PI) * bulge));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}
