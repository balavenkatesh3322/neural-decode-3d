import type { VisualKind } from '../ops';
import type { Shape } from '../graph/shape';

/** Size of a node's 3D visual in world units. Shared by layout and rendering. */
export interface Footprint {
  w: number;
  h: number;
  d: number;
}

const L = (n: number) => Math.log2(Math.max(1, n));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Width that grows with the feature dimension on a log scale, so 4096 → 14336 is visibly wider. */
export const featureWidth = (d: number) => clamp(0.6 + L(d) / 5, 0.9, 3.4);
/** Depth that grows with sequence length. */
export const seqDepth = (t: number) => clamp(0.35 + L(t) / 4, 0.45, 2);
/** Number of feature-map slabs drawn for C channels. */
export const slabCount = (c: number) => clamp(Math.round(L(c) / 2), 2, 6);
/** Side length of a feature-map slab for spatial size H. */
export const slabSize = (h: number) => clamp(0.55 + L(h) / 4.2, 0.7, 2.4);

export function footprint(visual: VisualKind | 'group', shape: Shape, opts: { tokens?: number } = {}): Footprint {
  const n = shape.num;
  const rank = n.length;
  const last = n[rank - 1] ?? 1;
  const isImage = rank === 4;
  const seq = rank >= 3 ? n[rank - 2] : 1;

  switch (visual) {
    case 'group':
      return { w: 3.2, h: 0.9, d: 1.3 };
    case 'io':
      return isImage ? { w: slabSize(n[2]), h: 0.25, d: slabSize(n[2]) } : { w: Math.max(1.6, featureWidth(last)), h: 0.4, d: 0.6 };
    case 'embedding': {
      const t = Math.min(opts.tokens ?? seq, 12);
      return { w: Math.max(1.6, t * 0.34), h: 0.9, d: 0.6 };
    }
    case 'matrix':
      return { w: clamp(featureWidth(last), 1.4, 3.2), h: 0.3, d: 1.2 };
    case 'qkv':
      return { w: 3.1, h: 0.3, d: 1.1 };
    case 'attention': {
      const t = rank === 4 ? n[2] : seq;
      const s = clamp(0.9 + t * 0.12, 1.3, 2.4);
      return { w: s, h: s * 0.8, d: 0.2 };
    }
    case 'ffn':
      return { w: 3.0, h: 0.95, d: 1.0 };
    case 'norm':
      return { w: isImage ? slabSize(n[2]) : clamp(featureWidth(last), 1.2, 2.4), h: 0.16, d: 0.9 };
    case 'merge':
      return { w: 0.6, h: 0.6, d: 0.6 };
    case 'conv':
    case 'pool': {
      if (isImage) {
        const s = slabSize(n[2]);
        return { w: s, h: visual === 'pool' ? 0.55 : 0.12 * slabCount(n[1]) + 0.12, d: s };
      }
      return { w: clamp(featureWidth(last), 1.2, 2.6), h: 0.45, d: 0.8 };
    }
    case 'router':
      return { w: 0.95, h: 0.95, d: 0.95 };
    case 'scan':
      return { w: 3.0, h: 0.42, d: 0.55 };
    case 'clock':
      return { w: 0.9, h: 0.9, d: 0.3 };
    case 'graph':
      return { w: 1.8, h: 0.9, d: 1.4 };
    case 'tensor':
    default:
      return isImage
        ? { w: slabSize(n[2]), h: 0.5, d: slabSize(n[2]) }
        : { w: featureWidth(last), h: 0.5, d: seqDepth(seq) };
  }
}
