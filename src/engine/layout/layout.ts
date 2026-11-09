import type { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api';
import type { VisibleGraph } from '../graph/visible';
import type { Footprint } from './footprint';

/** World units → elk pixels. */
const PX = 40;
/** Room reserved under each node for its label chip (px). */
const LABEL_PX = 18;
const GROUP_PAD = '[top=46,left=26,bottom=22,right=26]';

export interface LaidOutNode {
  id: string;
  /** Centre of the node's geometry in world space. */
  pos: [number, number, number];
  size: Footprint;
}

export interface LaidOutGroup {
  id: string;
  pos: [number, number, number];
  w: number;
  h: number;
}

export interface LaidOutEdge {
  id: string;
  points: [number, number, number][];
}

export interface Layout {
  nodes: Map<string, LaidOutNode>;
  groups: Map<string, LaidOutGroup>;
  edges: Map<string, LaidOutEdge>;
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

// elkjs is ~1.4 MB. In the browser it runs in a Web Worker (off the main thread, so the UI never
// stutters during layout); in Node (tests) it falls back to the bundled in-process build.
type ElkInstance = { layout: (g: ElkNode) => Promise<ElkNode> };
let elkPromise: Promise<ElkInstance> | null = null;
export const getElk = () =>
  (elkPromise ??=
    typeof Worker !== 'undefined'
      ? import('elkjs/lib/elk-api').then(
          (m) =>
            new (m.default as any)({
              workerFactory: () => new Worker(new URL('elkjs/lib/elk-worker.min.js', import.meta.url)),
            }) as ElkInstance,
        )
      : import('elkjs/lib/elk.bundled.js').then((m) => new m.default() as ElkInstance));

export async function computeLayout(
  graph: VisibleGraph,
  sizes: Map<string, Footprint>,
  opts: { spread?: number } = {},
): Promise<Layout> {
  const spread = opts.spread ?? 1;

  // --- build elk hierarchy -------------------------------------------------
  const elkNodes = new Map<string, ElkNode>();
  const root: ElkNode = {
    id: '__root__',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'UP',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'POLYLINE',
      'elk.layered.spacing.nodeNodeBetweenLayers': String(46 * spread),
      'elk.spacing.nodeNode': String(34 * spread),
      'elk.spacing.edgeNode': String(18 * spread),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.semiInteractive': 'true',
    },
    children: [],
    edges: [],
  };
  elkNodes.set(root.id, root);

  for (const g of graph.groups) {
    elkNodes.set(g.id, { id: g.id, layoutOptions: { 'elk.padding': GROUP_PAD }, children: [] });
  }
  for (const g of graph.groups) {
    const parent = (g.parent && elkNodes.get(g.parent)) || root;
    parent.children!.push(elkNodes.get(g.id)!);
  }
  graph.nodes.forEach((n, i) => {
    const s = sizes.get(n.id)!;
    const en: ElkNode = {
      id: n.id,
      width: s.w * PX,
      height: s.h * PX + LABEL_PX,
      // preserve authoring order within a layer for stable, predictable layouts
      layoutOptions: { 'elk.position': `(${i * 10}, 0)` },
    };
    elkNodes.set(n.id, en);
    const parent = (n.parent && elkNodes.get(n.parent)) || root;
    parent.children!.push(en);
  });

  const parentOf = new Map<string, string>();
  const walk = (n: ElkNode) => (n.children ?? []).forEach((c) => (parentOf.set(c.id, n.id), walk(c)));
  walk(root);

  root.edges = graph.edges
    .filter((e) => elkNodes.has(e.from) && elkNodes.has(e.to))
    .map<ElkExtendedEdge>((e) => ({ id: e.id, sources: [e.from], targets: [e.to] }));

  const out = await (await getElk()).layout(root);

  // --- convert to absolute world coordinates -------------------------------
  // elkjs: node x/y are relative to the parent; edge points are relative to the
  // lowest common ancestor of the edge's endpoints.
  const abs = new Map<string, { x: number; y: number; w: number; h: number }>();
  const absWalk = (n: ElkNode, ox: number, oy: number) => {
    const x = ox + (n.x ?? 0);
    const y = oy + (n.y ?? 0);
    abs.set(n.id, { x, y, w: n.width ?? 0, h: n.height ?? 0 });
    (n.children ?? []).forEach((c) => absWalk(c, x, y));
  };
  absWalk(out, 0, 0);

  const chain = (id: string) => {
    const c: string[] = [];
    let cur: string | undefined = id;
    while (cur) {
      c.unshift(cur);
      cur = parentOf.get(cur);
    }
    return c;
  };
  const lca = (a: string, b: string) => {
    const ca = chain(a);
    const cb = chain(b);
    let i = 0;
    while (i < ca.length && i < cb.length && ca[i] === cb[i]) i++;
    // the LCA container: if one endpoint is an ancestor of the other, it is that endpoint's parent
    const common = ca[i - 1];
    return common === a || common === b ? parentOf.get(common) ?? '__root__' : common;
  };

  const rootBox = abs.get('__root__')!;
  const cx = rootBox.w / 2;
  const cy = rootBox.h / 2;
  const toWorld = (x: number, y: number): [number, number] => [(x - cx) / PX, -(y - cy) / PX];

  const nodes = new Map<string, LaidOutNode>();
  for (const n of graph.nodes) {
    const b = abs.get(n.id)!;
    const size = sizes.get(n.id)!;
    // geometry sits in the top part of the elk box; the label lives below it
    const [x, y] = toWorld(b.x + b.w / 2, b.y + (b.h - LABEL_PX) / 2);
    nodes.set(n.id, { id: n.id, pos: [x, y, 0], size });
  }

  const groups = new Map<string, LaidOutGroup>();
  for (const g of graph.groups) {
    const b = abs.get(g.id)!;
    const [x, y] = toWorld(b.x + b.w / 2, b.y + b.h / 2);
    groups.set(g.id, { id: g.id, pos: [x, y, 0], w: b.w / PX, h: b.h / PX });
  }

  const edges = new Map<string, LaidOutEdge>();
  for (const e of out.edges ?? []) {
    const ge = graph.edges.find((x) => x.id === e.id)!;
    const container = abs.get(lca(ge.from, ge.to)) ?? { x: 0, y: 0 };
    const pts: [number, number, number][] = [];
    for (const s of (e as ElkExtendedEdge).sections ?? []) {
      const seq = [s.startPoint, ...(s.bendPoints ?? []), s.endPoint];
      for (const p of seq) {
        const [x, y] = toWorld(container.x + p.x, container.y + p.y);
        pts.push([x, y, 0]);
      }
    }
    if (pts.length >= 2) edges.set(e.id, { id: e.id, points: pts });
  }

  const hw = rootBox.w / PX / 2;
  const hh = rootBox.h / PX / 2;
  return { nodes, groups, edges, bounds: { min: [-hw, -hh, -1.5], max: [hw, hh, 1.5] } };
}
