import type { GraphEdge, GraphSpec, OpNode } from '../spec/schema';
import { getOp, InferCtx } from '../ops';
import { resolveConfig, Scope, evalExpr } from './expr';
import { Shape, shapeOf } from './shape';

export interface NodeInfo {
  node: OpNode;
  inputs: Shape[];
  out: Shape;
  /** Parameters of ONE instance of this node. */
  params: number;
  /** How many times the node exists in the real model (product of enclosing group repeats). */
  multiplicity: number;
  /** Longest-path depth from any source — used to stagger flow animation. */
  level: number;
  error?: string;
}

export interface InferResult {
  scope: Scope;
  nodes: Map<string, NodeInfo>;
  order: string[];
  totalParams: number;
  errors: string[];
}

/** Edges that carry the tensor a node computes on (control/condition edges are side-channels). */
export const isDataEdge = (e: GraphEdge) => e.kind !== 'control' && e.kind !== 'condition';

export function topoOrder(spec: GraphSpec): string[] {
  const ids = spec.nodes.map((n) => n.id);
  const nodeSet = new Set(ids);
  const indeg = new Map(ids.map((id) => [id, 0]));
  const out = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of spec.edges) {
    if (!nodeSet.has(e.from) || !nodeSet.has(e.to)) continue;
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
    out.get(e.from)!.push(e.to);
  }
  const queue = ids.filter((id) => indeg.get(id) === 0);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const nxt of out.get(id)!) {
      indeg.set(nxt, indeg.get(nxt)! - 1);
      if (indeg.get(nxt) === 0) queue.push(nxt);
    }
  }
  if (order.length !== ids.length) {
    const stuck = ids.filter((id) => !order.includes(id));
    throw new Error(`Graph has a cycle involving: ${stuck.join(', ')}`);
  }
  return order;
}

export function groupMultiplicity(spec: GraphSpec, groupId: string | undefined, scope: Scope): number {
  let m = 1;
  const byId = new Map((spec.groups ?? []).map((g) => [g.id, g]));
  let g = groupId ? byId.get(groupId) : undefined;
  const seen = new Set<string>();
  while (g && !seen.has(g.id)) {
    seen.add(g.id);
    if (g.repeat !== undefined) m *= Math.max(1, Math.round(evalExpr(g.repeat, scope)));
    g = g.parent ? byId.get(g.parent) : undefined;
  }
  return m;
}

export function inferGraph(spec: GraphSpec, overrides: Record<string, number> = {}): InferResult {
  const scope = resolveConfig(spec.config, overrides);
  const order = topoOrder(spec);
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const nodes = new Map<string, NodeInfo>();
  const errors: string[] = [];

  for (const id of order) {
    const node = byId.get(id)!;
    const op = getOp(node.op);
    const incoming = spec.edges.filter((e) => e.to === id && byId.has(e.from));
    const dataIn = incoming.filter(isDataEdge);
    const inputs = dataIn.map((e) => nodes.get(e.from)!.out);
    const level = incoming.reduce((m, e) => Math.max(m, nodes.get(e.from)!.level + 1), 0);
    const ctx = new InferCtx(inputs, node.params ?? {}, scope);
    let out: Shape = { sym: ['?'], num: [0] };
    let params = 0;
    let error: string | undefined;
    try {
      // explicit overrides (e.g. shapes/weights read from an imported ONNX file) win over inference
      const p = node.params ?? {};
      out = p.__out ? shapeOf(p.__out, scope) : op.infer(ctx);
      params = typeof p.__params === 'number' ? p.__params : op.params ? Math.round(op.params(ctx)) : 0;
      if (out.num.some((n) => !Number.isFinite(n))) throw new Error('produced a non-finite dimension');
    } catch (err) {
      error = `${node.label ?? node.id} (${node.op}): ${(err as Error).message}`;
      errors.push(error);
    }
    nodes.set(id, {
      node,
      inputs,
      out,
      params,
      multiplicity: groupMultiplicity(spec, node.group, scope),
      level,
      error,
    });
  }

  let totalParams = 0;
  nodes.forEach((n) => (totalParams += n.params * n.multiplicity));
  return { scope, nodes, order, totalParams, errors };
}
