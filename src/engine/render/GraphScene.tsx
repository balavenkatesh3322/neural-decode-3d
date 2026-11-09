import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ArchitectureModel } from '../useArchitectureModel';
import type { SceneModel } from '../scene';
import { getOp } from '../ops';
import { evalExpr } from '../graph/expr';
import { numel } from '../graph/shape';
import { useAppStore } from '../../store/useAppStore';
import { NodeView } from './NodeView';
import { EdgeView, EdgeEmphasis } from './EdgeView';
import { GroupFrame } from './GroupFrame';
import { FlowPackets, FlowEdge } from './FlowPackets';
import { CameraRig } from './CameraRig';
import { makeEdgeCurve } from './edges';
import type { Emphasis } from './style';
import { playSfx } from '../../features/audio/audio';
import { Label3D } from './Label3D';
import { ioNodes, storyFor } from '../story';

export const GraphScene: React.FC<{ model: ArchitectureModel; scene: SceneModel; spread: number }> = ({ model, scene, spread }) => {
  const story = useMemo(() => storyFor(model), [model]);
  const io = useMemo(() => ioNodes(model), [model]);
  const { spec, infer, componentForSpecId, stepNumber } = model;
  const { visible, layout } = scene;

  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredId = useAppStore((s) => s.hoveredId);
  const view = useAppStore((s) => s.view);
  const flow = useAppStore((s) => s.flow);
  const tourSpeed = useAppStore((s) => s.tour.speed);
  const cameraNonce = useAppStore((s) => s.cameraNonce);
  const archId = useAppStore((s) => s.archId);
  const liveTokens = useAppStore((s) => s.liveTokens);
  const select = useAppStore((s) => s.select);
  const hover = useAppStore((s) => s.hover);
  const toggleStore = useAppStore((s) => s.toggleCollapsed);
  const toggleCollapsed = (id: string) => {
    playSfx('pop');
    toggleStore(id);
  };

  const groupsById = useMemo(() => new Map((spec.groups ?? []).map((g) => [g.id, g])), [spec]);
  const repeatOf = (gid: string) => {
    const g = groupsById.get(gid);
    if (!g?.repeat) return 1;
    try {
      return Math.max(1, Math.round(evalExpr(g.repeat, infer.scope)));
    } catch {
      return 1;
    }
  };

  // selection may point at a node hidden inside a collapsed group
  const visSelected = selectedId ? visible.rep.get(selectedId) ?? selectedId : null;
  const visHovered = hoveredId ? visible.rep.get(hoveredId) ?? hoveredId : null;

  const { preds, succs } = useMemo(() => {
    const preds = new Set<string>();
    const succs = new Set<string>();
    if (visSelected) {
      for (const e of visible.edges) {
        if (e.to === visSelected) preds.add(e.from);
        if (e.from === visSelected) succs.add(e.to);
      }
    }
    return { preds, succs };
  }, [visible, visSelected]);

  // MoE: experts the router did not pick are shown idle
  const inactive = useMemo(() => {
    const out = new Set<string>();
    for (const n of spec.nodes) {
      const active: string[] | undefined = n.params?.active;
      if (!active) continue;
      spec.edges.filter((e) => e.from === n.id && e.kind === 'control').forEach((e) => {
        if (!active.includes(e.to) && spec.nodes.find((x) => x.id === e.to)?.op === 'expert') out.add(e.to);
      });
    }
    return out;
  }, [spec]);

  const selectedGroupChildren = useMemo(() => {
    if (!visSelected || !groupsById.has(visSelected) || !layout.groups.has(visSelected)) return null;
    return new Set(visible.nodes.filter((n) => n.parent === visSelected).map((n) => n.id));
  }, [visSelected, groupsById, layout, visible]);


  const emphasisFor = (id: string): Emphasis => {
    if (id === visSelected) return 'selected';
    if (selectedGroupChildren?.has(id)) return 'active';
    if (inactive.has(id)) return 'inactive';
    if (id === visHovered) return 'hover';
    return 'normal';
  };

  // --- levels for the flow wave ---------------------------------------------
  const levels = useMemo(() => {
    const lv = new Map<string, number>(visible.nodes.map((n) => [n.id, 0]));
    // visible graph is a DAG; relax edges |V| times (tiny graphs)
    for (let i = 0; i < visible.nodes.length; i++) {
      let changed = false;
      for (const e of visible.edges) {
        const a = lv.get(e.from);
        const b = lv.get(e.to);
        if (a === undefined || b === undefined) continue;
        if (b < a + 1) {
          lv.set(e.to, a + 1);
          changed = true;
        }
      }
      if (!changed) break;
    }
    return lv;
  }, [visible]);

  const curves = useMemo(() => {
    const m = new Map<string, THREE.CatmullRomCurve3>();
    for (const e of visible.edges) {
      const le = layout.edges.get(e.id);
      if (le) m.set(e.id, makeEdgeCurve(le.points, e.kind));
    }
    return m;
  }, [visible, layout]);

  const flowEdges: FlowEdge[] = useMemo(
    () =>
      visible.edges
        .filter((e) => curves.has(e.id))
        .map((e) => {
          const src = e.sourceNode ? infer.nodes.get(e.sourceNode) : undefined;
          const n = src ? numel(src.out) : 1e5;
          return {
            id: e.id,
            curve: curves.get(e.id)!,
            kind: e.kind,
            level: levels.get(e.from) ?? 0,
            targetLevel: levels.get(e.to) ?? 1,
            to: e.to,
            size: Math.min(0.17, Math.max(0.07, 0.04 + Math.log10(Math.max(10, n)) * 0.018)),
            inactive: inactive.has(e.to),
          };
        }),
    [visible, curves, levels, infer, inactive],
  );

  const edgeEmphasis = (from: string, to: string): EdgeEmphasis => {
    if (inactive.has(to) || inactive.has(from)) return 'inactive';
    if (!visSelected) return 'normal';
    if (to === visSelected) return 'upstream';
    if (from === visSelected) return 'downstream';
    if (selectedGroupChildren && selectedGroupChildren.has(from) && selectedGroupChildren.has(to)) return 'active';
    return 'normal';
  };

  // --- camera targets -----------------------------------------------------------
  // include room for the real-input card below and the output card above the graph
  const modelBox = useMemo(() => new THREE.Box3(new THREE.Vector3(layout.bounds.min[0], layout.bounds.min[1] - 1.8, layout.bounds.min[2]), new THREE.Vector3(layout.bounds.max[0], layout.bounds.max[1] + 1.4, layout.bounds.max[2])), [layout]);
  const focusBox = useMemo(() => {
    if (!visSelected) return null;
    const box = new THREE.Box3();
    const addNode = (id: string) => {
      const n = layout.nodes.get(id);
      if (!n) return false;
      const c = new THREE.Vector3(...n.pos);
      const half = new THREE.Vector3(n.size.w / 2, n.size.h / 2 + 0.3, n.size.d / 2);
      box.expandByPoint(c.clone().sub(half)).expandByPoint(c.clone().add(half));
      return true;
    };
    const g = layout.groups.get(visSelected);
    if (g) {
      const c = new THREE.Vector3(...g.pos);
      const half = new THREE.Vector3(g.w / 2, g.h / 2, 1);
      return new THREE.Box3(c.clone().sub(half), c.clone().add(half));
    }
    if (!addNode(visSelected)) return null;
    // include direct neighbours (but not far-away ones) so the "where from / where to" context is in frame
    const center = new THREE.Vector3(...layout.nodes.get(visSelected)!.pos);
    for (const id of [...preds, ...succs]) {
      const n = layout.nodes.get(id);
      if (n && center.distanceTo(new THREE.Vector3(...n.pos)) < 6) addNode(id);
    }
    // never zoom in so far that the node fills the screen
    const size = box.getSize(new THREE.Vector3());
    const minSize = new THREE.Vector3(5, 3.4, 2);
    const grow = minSize.sub(size).max(new THREE.Vector3()).multiplyScalar(0.5);
    box.expandByVector(grow);
    return box;
    // re-fly only when the selection or layout actually changes
  }, [visSelected, layout, preds, succs]);

  return (
    <>
      <CameraRig modelBox={modelBox} focusBox={focusBox} frameNonce={`${archId}:${cameraNonce}:${spread}`} autoRotate={view.autoRotate} />

      {visible.groups.map((g) => {
        const lg = layout.groups.get(g.id);
        if (!lg) return null;
        return (
          <GroupFrame
            key={g.id}
            group={lg}
            label={g.label}
            color={g.color ?? '#9c8b7b'}
            repeat={repeatOf(g.id)}
            stepNumber={stepNumber.get(g.id)}
            selected={g.id === visSelected}
            onToggle={() => toggleCollapsed(g.id)}
            onSelect={() => select(g.id)}
          />
        );
      })}

      {visible.edges.map((e) => {
        const curve = curves.get(e.id);
        if (!curve) return null;
        return (
          <EdgeView
            key={e.id}
            curve={curve}
            kind={e.kind}
            emphasis={edgeEmphasis(e.from, e.to)}
            label={e.label}
            showLabel={view.showShapes}
          />
        );
      })}

      {visible.nodes.map((vn) => {
        const ln = layout.nodes.get(vn.id);
        if (!ln) return null;
        const emphasis = emphasisFor(vn.id);
        const base = { emphasis };
        if (vn.kind === 'group') {
          const g = groupsById.get(vn.id)!;
          return (
            <NodeView
              key={vn.id}
              id={vn.id}
              target={ln.pos}
              size={ln.size}
              kind="group"
              style={{ ...base, color: g.color ?? '#9c8b7b' }}
              shape={{ sym: [], num: [] }}
              label={g.label}
              op="group"
              params={{}}
              stepNumber={stepNumber.get(vn.id)}
              repeat={repeatOf(vn.id)}
              live={flow !== 'off'}
              showShape={false}
              numericShape={view.numericShapes}
              onSelect={select}
              onHover={hover}
              onExpand={() => toggleCollapsed(vn.id)}
            />
          );
        }
        const info = infer.nodes.get(vn.id)!;
        const op = getOp(info.node.op);
        const comp = componentForSpecId.get(vn.id);
        return (
          <NodeView
            key={vn.id}
            id={vn.id}
            target={ln.pos}
            size={ln.size}
            kind={op.visual}
            style={{ ...base, color: comp?.color ?? op.color }}
            shape={info.out}
            label={info.node.label ?? op.label}
            op={info.node.op}
            params={info.node.params ?? {}}
            tokens={op.visual === 'embedding' ? (liveTokens?.archId === archId && info.node.op === 'embedding' ? liveTokens.tokens : info.node.params?.tokens ?? spec.sampleTokens) : undefined}
            stepNumber={stepNumber.get(vn.id)}
            live={emphasis === 'selected' || (flow !== 'off' && emphasis !== 'dim' && emphasis !== 'inactive')}
            showShape={view.showShapes}
            numericShape={view.numericShapes}
            onSelect={select}
            onHover={hover}
          />
        );
      })}

      <FlowPackets edges={flowEdges} mode={flow} focusId={visSelected} speed={tourSpeed} />

      {/* the real-world example entering and leaving the network */}
      {io.inputId && layout.nodes.get(visible.rep.get(io.inputId) ?? io.inputId) && (() => {
        const n = layout.nodes.get(visible.rep.get(io.inputId!) ?? io.inputId!)!;
        return (
          <Label3D position={[n.pos[0], n.pos[1] - n.size.h / 2 - 0.75, n.pos[2] + n.size.d / 2]} interactive={false} origin="center top">
            <div className="w-[220px] px-2.5 py-1.5 rounded-xl bg-[#2f2a27]/95 text-white shadow-xl text-center">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#f5d9a8]">Real input · {story.input.label}</div>
              <div className="text-[11px] font-serif italic leading-snug">{story.input.value}</div>
            </div>
          </Label3D>
        );
      })()}
      {io.outputId && layout.nodes.get(visible.rep.get(io.outputId) ?? io.outputId) && (() => {
        const n = layout.nodes.get(visible.rep.get(io.outputId!) ?? io.outputId!)!;
        return (
          <Label3D position={[n.pos[0], n.pos[1] + n.size.h / 2 + 0.55, n.pos[2] + n.size.d / 2]} interactive={false} origin="center bottom">
            <div className="w-[220px] px-2.5 py-1.5 rounded-xl bg-[#4E9F6B] text-white shadow-xl text-center">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/80">Output · {story.output.label}</div>
              <div className="text-[11px] font-semibold leading-snug">{story.output.value}</div>
            </div>
          </Label3D>
        );
      })()}
    </>
  );
};
