import * as THREE from 'three';

export type Emphasis = 'normal' | 'hover' | 'selected' | 'active' | 'dim' | 'inactive';

export interface NodeStyle {
  color: string;
  emphasis: Emphasis;
}

export const ACCENT = '#eb7c6b';
export const UPSTREAM = '#3FA7C9';
export const DOWNSTREAM = '#eb7c6b';
export const BACKGROUND = '#f6efe6';

/** Material props for a node's main surfaces given its interaction state. */
export function materialProps(style: NodeStyle, colorOverride?: string) {
  const color = colorOverride ?? style.color;
  const base = {
    color,
    roughness: 0.42,
    metalness: 0.06,
    emissive: '#000000',
    emissiveIntensity: 0,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    toneMapped: true,
  };
  switch (style.emphasis) {
    case 'selected':
      // > 1 un-tone-mapped emissive → picked up by the Bloom pass
      return { ...base, emissive: ACCENT, emissiveIntensity: 1.6, toneMapped: false };
    case 'active':
      return { ...base, emissive: color, emissiveIntensity: 1.4, toneMapped: false };
    case 'hover':
      return { ...base, emissive: color, emissiveIntensity: 0.35 };
    case 'dim':
      return { ...base, transparent: true, opacity: 0.1, depthWrite: false };
    case 'inactive':
      return { ...base, color: '#c9c2b9', transparent: true, opacity: 0.55 };
    default:
      return base;
  }
}

/** Deterministic PRNG so "sample weights" look the same on every visit. */
export function seeded(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
/** Diverging ramp for weights in [-1, 1]: blue ← cream → coral. */
export function weightColor(v: number, out = new THREE.Color()) {
  const t = Math.max(-1, Math.min(1, v));
  tmpA.set('#f3eadf');
  tmpB.set(t < 0 ? '#3f7fd1' : '#e0664f');
  return out.copy(tmpA).lerp(tmpB, Math.abs(t));
}
/** Sequential ramp for probabilities in [0, 1]: cream → violet. */
export function probColor(p: number, out = new THREE.Color()) {
  tmpA.set('#f6efe6');
  tmpB.set('#5b3fb3');
  return out.copy(tmpA).lerp(tmpB, Math.pow(Math.max(0, Math.min(1, p)), 0.6));
}
