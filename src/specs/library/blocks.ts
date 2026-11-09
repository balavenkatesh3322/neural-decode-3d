import type { GraphEdge, OpNode } from '../../engine/spec/schema';

export interface Block {
  nodes: OpNode[];
  edges: GraphEdge[];
  /** id of the first node (connect the previous output here). */
  first: string;
  /** id of the node whose output leaves the block. */
  last: string;
}

/**
 * A standard transformer layer.
 * - pre-norm (GPT-2, ViT, CLIP, Whisper): x → LN → Attn → +x → LN → FFN → +
 * - post-norm (BERT, original Transformer): x → Attn → +x → LN → FFN → + → LN
 * `cross` adds an encoder–decoder attention sub-layer fed by `crossFrom`.
 */
export function transformerLayer(o: {
  p: string;
  group: string;
  input: string;
  heads: string;
  ff: string;
  preNorm?: boolean;
  causal?: boolean;
  /** true = all projection biases; 'no-k' = no key bias (Whisper). */
  bias?: boolean | 'no-k';
  cross?: { from: string };
  lessons?: { attn?: OpNode['lesson']; ffn?: OpNode['lesson']; cross?: OpNode['lesson'] };
}): Block {
  const { p, group, preNorm = true } = o;
  const g = { group };
  const nodes: OpNode[] = [];
  const edges: GraphEdge[] = [];
  const link = (from: string, to: string, kind?: GraphEdge['kind'], label?: string) => edges.push({ from, to, kind, label });
  let cur = o.input;

  // --- self-attention sub-layer ---
  const attnIn = cur;
  if (preNorm) {
    nodes.push({ id: `${p}_ln1`, op: 'norm', label: 'LayerNorm', ...g });
    link(cur, `${p}_ln1`);
    cur = `${p}_ln1`;
  }
  nodes.push({
    id: `${p}_attn`,
    op: 'attention',
    label: o.causal ? 'Masked Self-Attention' : 'Self-Attention',
    params: { heads: o.heads, causal: !!o.causal, bias: o.bias ?? false },
    lesson: o.lessons?.attn,
    ...g,
  });
  link(cur, `${p}_attn`);
  nodes.push({ id: `${p}_add1`, op: 'add', label: 'Add', ...g });
  link(`${p}_attn`, `${p}_add1`);
  link(attnIn, `${p}_add1`, 'residual');
  cur = `${p}_add1`;
  if (!preNorm) {
    nodes.push({ id: `${p}_ln1`, op: 'norm', label: 'LayerNorm', ...g });
    link(cur, `${p}_ln1`);
    cur = `${p}_ln1`;
  }

  // --- optional cross-attention sub-layer ---
  if (o.cross) {
    const crossIn = cur;
    if (preNorm) {
      nodes.push({ id: `${p}_lnx`, op: 'norm', label: 'LayerNorm', ...g });
      link(cur, `${p}_lnx`);
      cur = `${p}_lnx`;
    }
    nodes.push({ id: `${p}_cross`, op: 'attention', label: 'Cross-Attention', params: { heads: o.heads, kind: 'cross', bias: o.bias ?? false }, lesson: o.lessons?.cross, ...g });
    link(cur, `${p}_cross`);
    link(o.cross.from, `${p}_cross`, 'skip', 'encoder K,V');
    nodes.push({ id: `${p}_addx`, op: 'add', label: 'Add', ...g });
    link(`${p}_cross`, `${p}_addx`);
    link(crossIn, `${p}_addx`, 'residual');
    cur = `${p}_addx`;
  }

  // --- feed-forward sub-layer ---
  const ffnIn = cur;
  if (preNorm) {
    nodes.push({ id: `${p}_ln2`, op: 'norm', label: 'LayerNorm', ...g });
    link(cur, `${p}_ln2`);
    cur = `${p}_ln2`;
  }
  nodes.push({ id: `${p}_ffn`, op: 'ffn', label: 'MLP (GELU)', params: { kind: 'gelu', hidden: o.ff, bias: !!o.bias }, lesson: o.lessons?.ffn, ...g });
  link(cur, `${p}_ffn`);
  nodes.push({ id: `${p}_add2`, op: 'add', label: 'Add', ...g });
  link(`${p}_ffn`, `${p}_add2`);
  link(ffnIn, `${p}_add2`, 'residual');
  cur = `${p}_add2`;
  if (!preNorm) {
    nodes.push({ id: `${p}_ln2`, op: 'norm', label: 'LayerNorm', ...g });
    link(cur, `${p}_ln2`);
    cur = `${p}_ln2`;
  }

  return { nodes, edges, first: nodes[0].id, last: cur };
}

/** Linear chain helper: wires nodes in order and returns them with their edges. */
export function chain(nodes: OpNode[]): Block {
  const edges: GraphEdge[] = [];
  for (let i = 1; i < nodes.length; i++) edges.push({ from: nodes[i - 1].id, to: nodes[i].id });
  return { nodes, edges, first: nodes[0].id, last: nodes[nodes.length - 1].id };
}
