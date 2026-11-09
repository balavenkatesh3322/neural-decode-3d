import { useMemo } from 'react';
import type { Architecture, NodeComponent } from '../types/architecture';
import type { GraphSpec } from './spec/schema';
import { inferGraph, InferResult } from './graph/infer';
import { resolveArchitecture } from './registry';
import { useAppStore } from '../store/useAppStore';

export interface ArchitectureModel {
  architecture: Architecture;
  spec: GraphSpec;
  infer: InferResult;
  /** NodeComponent id → spec node/group id carrying that lesson. */
  specIdForComponent: Map<string, string>;
  /** spec node/group id → NodeComponent (lesson content). */
  componentForSpecId: Map<string, NodeComponent>;
  /** spec node/group id → 1-based lesson number (order of architecture.components). */
  stepNumber: Map<string, number>;
  /** Spec id highlighted by a given tour step (1-based). */
  specIdForStep: (step: number) => string | undefined;
}

export function buildArchitectureModel(architecture: Architecture, spec: GraphSpec, overrides: Record<string, number>): ArchitectureModel {
  const infer = inferGraph(spec, overrides);
  const specIdForComponent = new Map<string, string>();
  const componentForSpecId = new Map<string, NodeComponent>();
  const stepNumber = new Map<string, number>();
  const comps = new Map(architecture.components.map((c, i) => [c.id, { c, i }]));

  const carriers = [...spec.nodes, ...(spec.groups ?? [])];
  for (const n of carriers) {
    // hand-written lesson files reference nodes via `content`; generated lessons use the node id itself
    const contentId = n.content ?? (comps.has(n.id) ? n.id : undefined);
    if (!contentId) continue;
    const hit = comps.get(contentId);
    if (!hit) continue;
    specIdForComponent.set(contentId, n.id);
    componentForSpecId.set(n.id, hit.c);
    stepNumber.set(n.id, hit.i + 1);
  }

  const specIdForStep = (step: number) => {
    const s = architecture.dataFlowSteps.find((d) => d.stepIndex === step);
    return s ? specIdForComponent.get(s.activeNodeId) : undefined;
  };

  return { architecture, spec, infer, specIdForComponent, componentForSpecId, stepNumber, specIdForStep };
}

export function useArchitectureModel(): ArchitectureModel {
  const archId = useAppStore((s) => s.archId);
  const overrides = useAppStore((s) => s.overrides[s.archId]);
  const custom = useAppStore((s) => s.custom);
  return useMemo(() => {
    const { architecture, spec } = resolveArchitecture(archId, custom);
    return buildArchitectureModel(architecture, spec, overrides ?? {});
  }, [archId, overrides, custom]);
}
