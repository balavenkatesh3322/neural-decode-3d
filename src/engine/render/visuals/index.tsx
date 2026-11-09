import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Label3D } from '../Label3D';
import type { VisualKind } from '../../ops';
import type { Footprint } from '../../layout/footprint';
import { slabCount } from '../../layout/footprint';
import type { Shape } from '../../graph/shape';
import { materialProps, NodeStyle, probColor, seeded, weightColor } from '../style';
import { InstancedGrid, Slab, useSeededMatrix } from './primitives';

export interface VisualProps {
  size: Footprint;
  style: NodeStyle;
  shape: Shape;
  seed: string;
  /** Run idle animations (selected / active / flow playing). */
  live: boolean;
  op: string;
  params: Record<string, any>;
  tokens?: string[];
  /** Repeat count for collapsed group nodes. */
  repeat?: number;
}

const QKV_COLORS = ['#3FA7C9', '#E3A23B', '#8B6BD6'];

// ---------------------------------------------------------------------------

const TensorVisual: React.FC<VisualProps> = ({ size, style }) => <Slab size={[size.w, size.h, size.d]} style={style} />;

const IoVisual: React.FC<VisualProps> = ({ size, style, shape, seed }) => {
  const rand = useMemo(() => seeded(seed), [seed]);
  const isImage = shape.num.length === 4;
  if (isImage) {
    const n = 10;
    return (
      <group>
        <Slab size={[size.w, 0.06, size.d]} style={style} position={[0, -0.08, 0]} color="#efe6da" />
        <InstancedGrid
          rows={n}
          cols={n}
          width={size.w * 0.94}
          depth={size.d * 0.94}
          cellHeight={0.08}
          style={style}
          colorAt={(r, c, out) => {
            // a soft procedural "photo": warm subject on a cool background
            const dx = c / n - 0.5;
            const dy = r / n - 0.45;
            const subject = Math.exp(-(dx * dx + dy * dy) * 9);
            return out.setHSL(0.08 + (1 - subject) * 0.48 + rand() * 0.03, 0.45, 0.45 + subject * 0.2);
          }}
        />
      </group>
    );
  }
  const n = Math.max(1, Math.min(shape.num[1] ?? 1, 12));
  const isTokens = shape.num.length === 2;
  return (
    <group>
      <Slab size={[size.w, size.h * 0.5, size.d]} style={style} position={[0, -size.h * 0.25, 0]} />
      {isTokens && (
        <InstancedGrid
          rows={1}
          cols={n}
          width={size.w * 0.92}
          depth={size.d * 0.6}
          cellHeight={0.16}
          position={[0, 0.06, 0]}
          style={style}
          colorAt={(_, c, out) => out.setHSL(0.1 + c * 0.03, 0.55, 0.62)}
        />
      )}
    </group>
  );
};

const EmbeddingVisual: React.FC<VisualProps> = ({ size, style, seed, tokens, shape }) => {
  const t = Math.min(tokens?.length ?? shape.num[1] ?? 6, 12);
  const dims = 6;
  const rand = useMemo(() => seeded(seed), [seed]);
  const m = useSeededMatrix(dims, t, rand);
  return (
    <group>
      <Slab size={[size.w, 0.08, size.d]} position={[0, -size.h / 2 + 0.04, 0]} style={style} />
      <InstancedGrid
        rows={dims}
        cols={t}
        width={size.w * 0.94}
        depth={size.h * 0.82}
        plane="xy"
        cellHeight={size.d * 0.5}
        position={[0, 0.05, 0]}
        style={style}
        colorAt={(r, c, out) => weightColor(m[r][c], out)}
      />
      {tokens && style.emphasis !== 'dim' && (
        <Label3D position={[0, size.h / 2 + 0.2, 0]} interactive={false}>
          <div className="flex gap-[6px] font-mono text-[10px] text-[#2f2a27] whitespace-nowrap">
            {tokens.slice(0, t).map((tk, i) => (
              <span key={i} className="px-1 rounded bg-white/80 border border-[rgba(117,91,70,0.2)]">
                {tk}
              </span>
            ))}
          </div>
        </Label3D>
      )}
    </group>
  );
};

const MatrixVisual: React.FC<VisualProps> = ({ size, style, seed }) => {
  const rows = 6;
  const cols = Math.max(6, Math.round(size.w / 0.22));
  const rand = useMemo(() => seeded(seed), [seed]);
  const m = useSeededMatrix(rows, cols, rand);
  return (
    <group>
      <Slab size={[size.w, size.h * 0.55, size.d]} position={[0, -size.h * 0.2, 0]} style={style} />
      <InstancedGrid
        rows={rows}
        cols={cols}
        width={size.w * 0.92}
        depth={size.d * 0.88}
        cellHeight={0.06}
        position={[0, size.h * 0.12, 0]}
        style={style}
        colorAt={(r, c, out) => weightColor(m[r][c], out)}
      />
    </group>
  );
};

const QkvVisual: React.FC<VisualProps> = ({ size, style, seed }) => {
  const w = (size.w - 0.2) / 3;
  const rand = useMemo(() => seeded(seed), [seed]);
  const m = useSeededMatrix(5, 6, rand);
  return (
    <group>
      {QKV_COLORS.map((c, i) => (
        <group key={i} position={[-size.w / 2 + w / 2 + i * (w + 0.1), 0, 0]}>
          <Slab size={[w, size.h * 0.55, size.d]} position={[0, -size.h * 0.2, 0]} style={style} color={c} />
          <InstancedGrid
            rows={5}
            cols={6}
            width={w * 0.86}
            depth={size.d * 0.84}
            cellHeight={0.05}
            position={[0, size.h * 0.12, 0]}
            style={style}
            colorAt={(r, cc, out) => weightColor(m[r][cc], out).lerp(new THREE.Color(c), 0.25)}
          />
          {style.emphasis !== 'dim' && (
            <Label3D position={[0, size.h * 0.2, size.d / 2 + 0.05]} interactive={false}>
              <span className="font-mono font-bold text-[11px] px-1 rounded bg-white/85" style={{ color: c }}>
                {'QKV'[i]}
              </span>
            </Label3D>
          )}
        </group>
      ))}
    </group>
  );
};

/** T×T attention heatmap; causal mask hides the future; a highlight sweeps the query rows. */
const AttentionVisual: React.FC<VisualProps> = ({ size, style, seed, shape, params, live }) => {
  const t = Math.max(2, Math.min(shape.num.length >= 3 ? shape.num[shape.num.length - 2] : 6, 12));
  const causal = !!params.causal;
  const probs = useMemo(() => {
    const rand = seeded(seed);
    const out: number[][] = [];
    for (let i = 0; i < t; i++) {
      const raw: number[] = [];
      for (let j = 0; j < t; j++) {
        if (causal && j > i) { raw.push(-Infinity); continue; }
        // recency bias + a few "interesting" long-range links
        raw.push(-Math.abs(i - j) * 0.45 + rand() * 2.2 + (j === 0 ? 0.6 : 0));
      }
      const mx = Math.max(...raw.filter(Number.isFinite));
      const ex = raw.map((v) => (Number.isFinite(v) ? Math.exp(v - mx) : 0));
      const sum = ex.reduce((a, b) => a + b, 0);
      out.push(ex.map((v) => v / sum));
    }
    return out;
  }, [t, causal, seed]);

  const sweep = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!sweep.current) return;
    sweep.current.visible = live;
    if (!live) return;
    const row = Math.floor((clock.elapsedTime * 1.6) % t);
    const ch = (size.h * 0.9) / t;
    sweep.current.position.y = size.h * 0.45 - ch * (row + 0.5);
  });

  return (
    <group>
      <Slab size={[size.w, size.h, 0.08]} position={[0, 0, -0.06]} style={style} color="#fbf7f1" />
      <InstancedGrid
        rows={t}
        cols={t}
        width={size.w * 0.9}
        depth={size.h * 0.9}
        plane="xy"
        cellHeight={0.06}
        position={[0, 0, 0.02]}
        style={style}
        version={probs}
        colorAt={(r, c, out) => (causal && c > r ? out.set('#3b3430') : probColor(probs[r][c], out))}
      />
      <mesh ref={sweep} position={[0, 0, 0.07]}>
        <boxGeometry args={[size.w * 0.94, (size.h * 0.9) / t, 0.01]} />
        <meshBasicMaterial color="#eb7c6b" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
};

const FfnVisual: React.FC<VisualProps> = ({ size, style, live }) => {
  const mid = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (mid.current) mid.current.scale.x = live ? 1 + Math.sin(clock.elapsedTime * 3) * 0.04 : 1;
  });
  const h = size.h / 3.4;
  return (
    <group>
      <Slab size={[size.w * 0.42, h, size.d * 0.8]} position={[0, -size.h / 2 + h / 2, 0]} style={style} />
      <group ref={mid}>
        <Slab size={[size.w, h * 1.2, size.d]} style={style} />
      </group>
      <Slab size={[size.w * 0.42, h, size.d * 0.8]} position={[0, size.h / 2 - h / 2, 0]} style={style} />
    </group>
  );
};

const NormVisual: React.FC<VisualProps> = ({ size, style }) => {
  const m = materialProps(style);
  return (
    <group scale={[1, 1, size.d / size.w]}>
      <mesh>
        <cylinderGeometry args={[size.w / 2, size.w / 2, size.h, 48]} />
        <meshStandardMaterial {...m} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, size.h / 2, 0]}>
        <torusGeometry args={[size.w / 2 - 0.05, 0.025, 8, 64]} />
        <meshStandardMaterial {...materialProps(style, '#ffffff')} />
      </mesh>
    </group>
  );
};

const MergeVisual: React.FC<VisualProps> = ({ size, style, op }) => {
  const r = size.w / 2;
  const symbol = materialProps({ ...style, emphasis: style.emphasis === 'dim' ? 'dim' : 'normal' }, '#ffffff');
  const rot = op === 'multiply' ? Math.PI / 4 : 0;
  return (
    <group>
      <mesh>
        <sphereGeometry args={[r, 32, 24]} />
        <meshStandardMaterial {...materialProps(style)} />
      </mesh>
      {op !== 'concat' && op !== 'denoise' && (
        <group position={[0, 0, r * 0.92]} rotation={[0, 0, rot]}>
          <mesh>
            <boxGeometry args={[r * 1.1, r * 0.18, 0.04]} />
            <meshStandardMaterial {...symbol} />
          </mesh>
          <mesh>
            <boxGeometry args={[r * 0.18, r * 1.1, 0.04]} />
            <meshStandardMaterial {...symbol} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/** Stacked feature-map slabs; a kernel cube slides across the top map. */
const ConvVisual: React.FC<VisualProps> = ({ size, style, shape, live, seed }) => {
  const kernel = useRef<THREE.Mesh>(null);
  const isImage = shape.num.length === 4;
  const n = isImage ? slabCount(shape.num[1]) : 3;
  const gap = isImage ? 0.12 : size.h / 3;
  const s = size.w;
  useFrame(({ clock }) => {
    if (!kernel.current) return;
    kernel.current.visible = live;
    if (!live) return;
    const steps = 5;
    const k = Math.floor(clock.elapsedTime * 4) % (steps * steps);
    const cx = (k % steps) / (steps - 1) - 0.5;
    const cz = Math.floor(k / steps) / (steps - 1) - 0.5;
    kernel.current.position.set(cx * s * 0.75, size.h / 2 + 0.06, cz * (isImage ? s : size.d) * 0.75);
  });
  const hues = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: n }, () => 0.55 + rand() * 0.12);
  }, [n, seed]);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <Slab
          key={i}
          size={[s, 0.07, isImage ? s : size.d]}
          position={[0, -size.h / 2 + 0.06 + i * gap, 0]}
          style={style}
          color={new THREE.Color(style.color).offsetHSL(hues[i] - 0.6, 0, (i / n) * 0.12).getStyle()}
          radius={0.02}
        />
      ))}
      <mesh ref={kernel}>
        <boxGeometry args={[s * 0.22, 0.12, (isImage ? s : size.d) * 0.22]} />
        <meshStandardMaterial color="#eb7c6b" emissive="#eb7c6b" emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

const PoolVisual: React.FC<VisualProps> = ({ size, style, op }) => {
  const up = op === 'upsample' || op === 'up_conv';
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <cylinderGeometry args={[(up ? size.w : size.w * 0.32) / Math.SQRT2, (up ? size.w * 0.32 : size.w) / Math.SQRT2, size.h, 4]} />
      <meshStandardMaterial {...materialProps(style)} flatShading />
    </mesh>
  );
};

const RouterVisual: React.FC<VisualProps> = ({ size, style, live }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * (live ? 1.4 : 0.3);
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size.w / 2, 0]} />
      <meshStandardMaterial {...materialProps(style)} flatShading />
    </mesh>
  );
};

/** Recurrent state cells on a conveyor; a highlight travels along the sequence. */
const ScanVisual: React.FC<VisualProps> = ({ size, style, live }) => {
  const n = 10;
  const cell = (size.w - 0.1) / n;
  const head = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!head.current) return;
    head.current.visible = live;
    const i = (clock.elapsedTime * 3) % n;
    head.current.position.x = -size.w / 2 + cell * (Math.floor(i) + 0.5) + 0.05;
  });
  return (
    <group>
      <Slab size={[size.w, 0.06, size.d]} position={[0, -size.h / 2 + 0.03, 0]} style={style} color="#d9cfe9" />
      {Array.from({ length: n }, (_, i) => (
        <Slab
          key={i}
          size={[cell * 0.78, size.h * 0.6, size.d * 0.7]}
          position={[-size.w / 2 + cell * (i + 0.5) + 0.05, 0.04, 0]}
          style={style}
          radius={0.03}
        />
      ))}
      <mesh ref={head} position={[0, size.h * 0.45, 0]}>
        <boxGeometry args={[cell * 0.9, 0.06, size.d * 0.8]} />
        <meshStandardMaterial color="#eb7c6b" emissive="#eb7c6b" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
};

const ClockVisual: React.FC<VisualProps> = ({ size, style, live }) => {
  const hand = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (hand.current) hand.current.rotation.z -= dt * (live ? 3 : 0.5);
  });
  const r = size.w / 2;
  return (
    <group>
      <mesh>
        <torusGeometry args={[r * 0.85, r * 0.15, 16, 48]} />
        <meshStandardMaterial {...materialProps(style)} />
      </mesh>
      <mesh ref={hand}>
        <boxGeometry args={[0.05, r * 0.7, 0.05]} />
        <meshStandardMaterial {...materialProps(style, '#2f2a27')} />
      </mesh>
    </group>
  );
};

/** Node-link diagram: graph nodes on a ring, neighbours linked, a message pulse travelling along edges. */
const GraphVisual: React.FC<VisualProps> = ({ size, style, seed, live }) => {
  const n = 7;
  const { pts, links } = useMemo(() => {
    const rand = seeded(seed);
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * size.w * 0.38, (rand() - 0.5) * size.h * 0.5, Math.sin(a) * size.d * 0.38);
    });
    const links: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      links.push([i, (i + 1) % n]);
      if (rand() > 0.55) links.push([i, (i + 3) % n]);
    }
    return { pts, links };
  }, [seed, size.w, size.h, size.d]);
  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    pulse.current.visible = live;
    const t = clock.elapsedTime * 0.9;
    const [a, b] = links[Math.floor(t) % links.length];
    pulse.current.position.lerpVectors(pts[a], pts[b], t % 1);
  });
  const m = materialProps(style);
  return (
    <group>
      {links.map(([a, b], i) => {
        const mid = pts[a].clone().add(pts[b]).multiplyScalar(0.5);
        const len = pts[a].distanceTo(pts[b]);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pts[b].clone().sub(pts[a]).normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.025, 0.025, len, 6]} />
            <meshStandardMaterial {...m} color="#b8ab9d" />
          </mesh>
        );
      })}
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial {...m} />
        </mesh>
      ))}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial color="#eb7c6b" emissive="#eb7c6b" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** A collapsed group: one block with ghost copies behind it hinting at the stack depth. */
export const GroupNodeVisual: React.FC<VisualProps> = ({ size, style, repeat = 1 }) => {
  const ghosts = Math.min(Math.max(repeat - 1, 0), 4);
  return (
    <group>
      {Array.from({ length: ghosts }, (_, i) => (
        <mesh key={i} position={[(i + 1) * 0.1, (i + 1) * 0.1, -(i + 1) * 0.28]}>
          <boxGeometry args={[size.w, size.h, size.d]} />
          <meshStandardMaterial color={style.color} transparent opacity={0.22 - i * 0.04} depthWrite={false} />
        </mesh>
      ))}
      <Slab size={[size.w, size.h, size.d]} style={style} />
    </group>
  );
};

const VISUALS: Record<VisualKind, React.FC<VisualProps>> = {
  io: IoVisual,
  tensor: TensorVisual,
  embedding: EmbeddingVisual,
  matrix: MatrixVisual,
  qkv: QkvVisual,
  attention: AttentionVisual,
  ffn: FfnVisual,
  norm: NormVisual,
  merge: MergeVisual,
  conv: ConvVisual,
  pool: PoolVisual,
  router: RouterVisual,
  scan: ScanVisual,
  clock: ClockVisual,
  graph: GraphVisual,
};

export const Visual: React.FC<VisualProps & { kind: VisualKind }> = ({ kind, ...props }) => {
  const C = VISUALS[kind] ?? TensorVisual;
  return <C {...props} />;
};
