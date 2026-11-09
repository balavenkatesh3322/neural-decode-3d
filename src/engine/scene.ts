import type { GraphSpec } from './spec/schema';
import { getOp } from './ops';
import type { InferResult } from './graph/infer';
import { buildVisibleGraph, VisibleGraph } from './graph/visible';
import { footprint, Footprint } from './layout/footprint';
import { computeLayout, Layout } from './layout/layout';

export interface SceneModel {
  /** The spec this scene was built from — a scene must never be drawn against a different spec. */
  spec: GraphSpec;
  visible: VisibleGraph;
  layout: Layout;
}

/** infer → collapse → size → layout. Pure (no React), so it is unit-testable. */
export async function buildScene(
  spec: GraphSpec,
  infer: InferResult,
  collapsed: Set<string>,
  opts: { spread?: number } = {},
): Promise<SceneModel> {
  const visible = buildVisibleGraph(spec, collapsed);
  const sizes = new Map<string, Footprint>();
  for (const n of visible.nodes) {
    if (n.kind === 'group') {
      sizes.set(n.id, footprint('group', { sym: [], num: [] }));
      continue;
    }
    const info = infer.nodes.get(n.id)!;
    const visual = getOp(info.node.op).visual;
    const tokens: string[] | undefined = info.node.params?.tokens ?? spec.sampleTokens;
    sizes.set(n.id, footprint(visual, info.out, { tokens: tokens?.length }));
  }
  const layout = await computeLayout(visible, sizes, opts);
  return { spec, visible, layout };
}
