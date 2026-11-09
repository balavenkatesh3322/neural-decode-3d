import type { EdgeKind, GraphSpec, GraphGroup } from '../spec/schema';

/**
 * The graph as currently shown: collapsed groups are replaced by a single
 * summary node, edges are re-targeted and de-duplicated.
 */
export interface VisibleNode {
  id: string;
  kind: 'op' | 'group';
  /** Expanded group that contains this node (layout parent). */
  parent?: string;
}

export interface VisibleEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  label?: string;
  /** The underlying spec node whose output this edge carries (for shape labels). */
  sourceNode?: string;
}

export interface VisibleGraph {
  nodes: VisibleNode[];
  /** Expanded groups (rendered as frames), parents before children. */
  groups: GraphGroup[];
  edges: VisibleEdge[];
  /** Maps any spec node/group id to the visible id that represents it. */
  rep: Map<string, string>;
}

export function buildVisibleGraph(spec: GraphSpec, collapsed: Set<string>): VisibleGraph {
  const groups = spec.groups ?? [];
  const byId = new Map(groups.map((g) => [g.id, g]));

  const ancestors = (gid: string | undefined): string[] => {
    const chain: string[] = [];
    const seen = new Set<string>();
    let g = gid ? byId.get(gid) : undefined;
    while (g && !seen.has(g.id)) {
      seen.add(g.id);
      chain.unshift(g.id); // outermost first
      g = g.parent ? byId.get(g.parent) : undefined;
    }
    return chain;
  };

  /** Outermost collapsed group in a chain, if any. */
  const collapsedRoot = (chain: string[]) => chain.find((id) => collapsed.has(id));

  const rep = new Map<string, string>();
  const nodes: VisibleNode[] = [];
  const shownGroups = new Set<string>();
  const addedGroupNodes = new Set<string>();

  for (const g of groups) {
    const chain = ancestors(g.id);
    const root = collapsedRoot(chain);
    if (root) {
      rep.set(g.id, root);
      if (!addedGroupNodes.has(root)) {
        addedGroupNodes.add(root);
        const parentChain = ancestors(byId.get(root)!.parent);
        nodes.push({ id: root, kind: 'group', parent: parentChain[parentChain.length - 1] });
      }
    } else {
      rep.set(g.id, g.id);
      shownGroups.add(g.id);
    }
  }

  for (const n of spec.nodes) {
    const chain = ancestors(n.group);
    const root = collapsedRoot(chain);
    if (root) {
      rep.set(n.id, root);
    } else {
      rep.set(n.id, n.id);
      nodes.push({ id: n.id, kind: 'op', parent: n.group });
    }
  }

  const edges: VisibleEdge[] = [];
  const seen = new Set<string>();
  spec.edges.forEach((e) => {
    const from = rep.get(e.from) ?? e.from;
    const to = rep.get(e.to) ?? e.to;
    if (from === to) return; // internal to a collapsed group
    const kind = e.kind ?? 'data';
    const key = `${from}->${to}:${kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: key,
      from,
      to,
      kind,
      label: e.label,
      sourceNode: spec.nodes.some((n) => n.id === e.from) ? e.from : undefined,
    });
  });

  const orderedGroups = groups
    .filter((g) => shownGroups.has(g.id))
    .sort((a, b) => ancestors(a.id).length - ancestors(b.id).length);

  return { nodes, groups: orderedGroups, edges, rep };
}

/** All spec node ids inside a group (recursively). */
export function nodesInGroup(spec: GraphSpec, gid: string): string[] {
  const groups = spec.groups ?? [];
  const inside = new Set<string>([gid]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const g of groups) {
      if (g.parent && inside.has(g.parent) && !inside.has(g.id)) {
        inside.add(g.id);
        grew = true;
      }
    }
  }
  return spec.nodes.filter((n) => n.group && inside.has(n.group)).map((n) => n.id);
}
