import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRightLeft } from 'lucide-react';
import { Architecture } from '../../types/architecture';
import { Modal } from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { listArchitectures, resolveArchitecture } from '../../engine/registry';
import { inferGraph, InferResult } from '../../engine/graph/infer';
import { buildScene, SceneModel } from '../../engine/scene';
import { getOp, OpFamily } from '../../engine/ops';
import { fmtCount, numel, fmtNum } from '../../engine/graph/shape';
import { BACKGROUND } from '../../engine/render/style';

const FAMILY_COLOR: Record<OpFamily, string> = {
  io: '#D9A441',
  embedding: '#E3A23B',
  attention: '#8B6BD6',
  mlp: '#E0876A',
  norm: '#58B4AE',
  merge: '#7A9E7E',
  conv: '#5C86C4',
  routing: '#C9704E',
  ssm: '#C46FA0',
  generative: '#B07CC6',
  misc: '#A8A29E',
};

interface Side {
  arch: Architecture;
  infer: InferResult;
  scene: SceneModel | null;
  families: Map<OpFamily, number>;
}

function useSide(id: string, custom: ReturnType<typeof useAppStore.getState>['custom']): Side {
  const { architecture, spec } = useMemo(() => resolveArchitecture(id, custom), [id, custom]);
  const infer = useMemo(() => inferGraph(spec), [spec]);
  const [scene, setScene] = useState<SceneModel | null>(null);
  useEffect(() => {
    let alive = true;
    setScene(null);
    // overview: collapse top-level blocks so big models stay readable side by side
    const collapsed = new Set((spec.groups ?? []).filter((g) => !g.parent && spec.nodes.length > 30).map((g) => g.id));
    buildScene(spec, infer, collapsed).then((s) => alive && setScene(s));
    return () => {
      alive = false;
    };
  }, [spec, infer]);
  const families = useMemo(() => {
    const m = new Map<OpFamily, number>();
    infer.nodes.forEach((n) => {
      const f = getOp(n.node.op).family;
      m.set(f, (m.get(f) ?? 0) + n.multiplicity);
    });
    return m;
  }, [infer]);
  return { arch: architecture, infer, scene, families };
}

/** A small auto-framed 3D view: every op as a box coloured by family. */
const MiniGraph: React.FC<{ side: Side; highlight: OpFamily | null }> = ({ side, highlight }) => {
  const { scene, infer } = side;
  const ref = React.useRef<any>(null);
  useEffect(() => {
    if (!scene || !ref.current) return;
    const b = scene.layout.bounds;
    ref.current.rotateTo(-0.35, 1.3, false);
    ref.current.fitToBox(new THREE.Box3(new THREE.Vector3(...b.min), new THREE.Vector3(...b.max)), false, { paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 0.5, paddingRight: 0.5 });
  }, [scene]);
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 40 }} dpr={[1, 1.5]} frameloop="demand">
      <color attach="background" args={[BACKGROUND]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 10, 8]} intensity={1.2} />
      <CameraControls ref={ref} makeDefault />
      {scene &&
        scene.visible.edges.map((e) => {
          const le = scene.layout.edges.get(e.id);
          return le ? <Line key={e.id} points={le.points} color="#b8ab9d" lineWidth={1} /> : null;
        })}
      {scene &&
        scene.visible.nodes.map((n) => {
          const ln = scene.layout.nodes.get(n.id);
          if (!ln) return null;
          const fam: OpFamily = n.kind === 'group' ? 'misc' : getOp(infer.nodes.get(n.id)!.node.op).family;
          const dim = highlight !== null && fam !== highlight;
          return (
            <RoundedBox key={n.id} args={[ln.size.w, Math.max(ln.size.h, 0.2), ln.size.d]} radius={0.05} position={ln.pos}>
              <meshStandardMaterial color={n.kind === 'group' ? '#9c8b7b' : FAMILY_COLOR[fam]} transparent opacity={dim ? 0.12 : 1} emissive={!dim && highlight ? FAMILY_COLOR[fam] : '#000'} emissiveIntensity={!dim && highlight ? 0.4 : 0} />
            </RoundedBox>
          );
        })}
    </Canvas>
  );
};

function stats(side: Side) {
  let biggest = side.infer.order[0];
  side.infer.nodes.forEach((n, id) => {
    if (numel(n.out) > numel(side.infer.nodes.get(biggest)!.out)) biggest = id;
  });
  const depth = Math.max(...[...side.infer.nodes.values()].map((n) => n.level)) + 1;
  const layers = [...side.infer.nodes.values()].reduce((s, n) => s + n.multiplicity, 0);
  return { params: side.infer.totalParams, ops: layers, depth, biggest: side.infer.nodes.get(biggest)! };
}

export const CompareModal: React.FC<{ currentArchitecture: Architecture; onClose: () => void }> = ({ currentArchitecture, onClose }) => {
  const custom = useAppStore((s) => s.custom);
  const all = useMemo(() => listArchitectures(custom), [custom]);
  const [idA, setIdA] = useState(currentArchitecture.id);
  const [idB, setIdB] = useState(() => (currentArchitecture.id === 'mamba' ? 'transformer' : currentArchitecture.category === 'vision' ? 'vit' : 'mamba'));
  const [highlight, setHighlight] = useState<OpFamily | null>(null);
  const A = useSide(idA, custom);
  const B = useSide(idB, custom);
  const sA = stats(A);
  const sB = stats(B);
  const families = [...new Set([...A.families.keys(), ...B.families.keys()])].filter((f) => f !== 'io');
  const maxFam = Math.max(1, ...families.map((f) => Math.max(A.families.get(f) ?? 0, B.families.get(f) ?? 0)));

  const picker = (value: string, set: (v: string) => void, label: string) => (
    <select value={value} onChange={(e) => set(e.target.value)} aria-label={label} className="w-full p-2 bg-white rounded-xl font-serif font-semibold text-sm border border-[rgba(117,91,70,0.2)] text-[#2f2a27]">
      {all.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );

  const rows: [string, string, string][] = [
    ['Parameters', fmtCount(sA.params), fmtCount(sB.params)],
    ['Operations (with repeats)', sA.ops.toLocaleString(), sB.ops.toLocaleString()],
    ['Depth (longest path)', String(sA.depth), String(sB.depth)],
    ['Largest activation', fmtNum(sA.biggest.out), fmtNum(sB.biggest.out)],
    ['Primary use', A.arch.keyFacts.primaryUse, B.arch.keyFacts.primaryUse],
    ['Introduced', A.arch.keyFacts.inventedYear, B.arch.keyFacts.inventedYear],
    ['Key innovation', A.arch.keyFacts.keyInnovations, B.arch.keyFacts.keyInnovations],
  ];

  return (
    <Modal title="Compare architectures" kicker="Side by side, in 3D" icon={<ArrowRightLeft className="w-4 h-4" />} onClose={onClose} size="xl">
      <div className="p-3 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { side: A, value: idA, set: setIdA, label: 'Model A' },
            { side: B, value: idB, set: setIdB, label: 'Model B' },
          ].map(({ side, value, set, label }) => (
            <div key={label} className="space-y-2 min-w-0">
              {picker(value, set, label)}
              <div className="h-[200px] sm:h-[300px] rounded-2xl overflow-hidden border border-[rgba(117,91,70,0.16)] bg-[#f6efe6]">
                <MiniGraph side={side} highlight={highlight} />
              </div>
            </div>
          ))}
        </div>

        {/* building blocks used */}
        <div className="rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] p-3 sm:p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8d847c] mb-2">Building blocks used — hover to highlight in both models</div>
          <div className="space-y-1.5">
            {families.map((f) => {
              const a = A.families.get(f) ?? 0;
              const b = B.families.get(f) ?? 0;
              return (
                <div
                  key={f}
                  className={`grid grid-cols-[1fr_88px_1fr] items-center gap-2 rounded-lg px-1 py-0.5 cursor-default ${highlight === f ? 'bg-[#f3eee5]' : ''}`}
                  onMouseEnter={() => setHighlight(f)}
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => setHighlight(highlight === f ? null : f)}
                >
                  <div className="flex justify-end items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#8d847c]">{a || ''}</span>
                    <div className="h-2.5 rounded-full" style={{ width: `${(a / maxFam) * 100}%`, background: FAMILY_COLOR[f], minWidth: a ? 4 : 0 }} />
                  </div>
                  <span className="text-[11px] font-semibold text-center text-[#2f2a27] capitalize">{f}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 rounded-full" style={{ width: `${(b / maxFam) * 100}%`, background: FAMILY_COLOR[f], minWidth: b ? 4 : 0 }} />
                    <span className="text-[10px] font-mono text-[#8d847c]">{b || ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] overflow-hidden">
          {rows.map(([k, a, b]) => (
            <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-0.5 px-3 py-2 border-b last:border-b-0 border-[rgba(117,91,70,0.1)] text-xs">
              <span className="col-span-2 sm:col-span-1 text-[10px] font-bold uppercase tracking-wide text-[#8d847c]">{k}</span>
              <span className="text-[#2f2a27]">{a}</span>
              <span className="text-[#2f2a27]">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
