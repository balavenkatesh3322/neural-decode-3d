import { onnx } from 'onnx-proto';
import type { GraphEdge, GraphGroup, GraphSpec, OpNode } from '../../engine/spec/schema';

/** ONNX op → our visual op. Anything unknown becomes a generic block. */
const OP_MAP: Record<string, string> = {
  Conv: 'conv2d',
  ConvTranspose: 'up_conv',
  Gemm: 'linear',
  MatMul: 'linear',
  Relu: 'activation',
  LeakyRelu: 'activation',
  PRelu: 'activation',
  Sigmoid: 'activation',
  Tanh: 'activation',
  Gelu: 'activation',
  Erf: 'activation',
  Silu: 'activation',
  HardSwish: 'activation',
  HardSigmoid: 'activation',
  Clip: 'activation',
  Softmax: 'softmax',
  LogSoftmax: 'softmax',
  Add: 'add',
  Sum: 'add',
  Mul: 'multiply',
  Concat: 'concat',
  MaxPool: 'pool',
  AveragePool: 'pool',
  GlobalAveragePool: 'pool',
  GlobalMaxPool: 'pool',
  BatchNormalization: 'norm',
  LayerNormalization: 'norm',
  SimplifiedLayerNormalization: 'norm',
  InstanceNormalization: 'norm',
  GroupNormalization: 'norm',
  Dropout: 'dropout',
  Resize: 'upsample',
  Upsample: 'upsample',
  Flatten: 'flatten',
  Attention: 'attention',
  MultiHeadAttention: 'attention',
  LSTM: 'rnn',
  GRU: 'rnn',
  RNN: 'rnn',
};

/** Shape bookkeeping ops that carry no learning content — removed, with their data passed through. */
const PLUMBING = new Set([
  'Constant', 'ConstantOfShape', 'Shape', 'Size', 'Cast', 'Identity', 'Unsqueeze', 'Squeeze', 'Range', 'Equal',
  'Where', 'Expand', 'Slice', 'Split', 'NonZero', 'Less', 'Greater', 'Not', 'And', 'Or', 'Floor', 'Ceil', 'CastLike',
]);

export interface ImportResult {
  spec: GraphSpec;
  warnings: string[];
  stats: { onnxNodes: number; keptNodes: number; params: number; opset: number; producer: string };
}

const num = (v: unknown) => (v == null ? 0 : typeof v === 'number' ? v : Number(v as any));
const safeId = (s: string) => s.replace(/[^A-Za-z0-9_.:-]+/g, '_').replace(/^_+/, '') || 'n';

function dimsOf(t: onnx.ITypeProto | null | undefined): (number | string)[] | undefined {
  const dims = t?.tensorType?.shape?.dim;
  if (!dims) return undefined;
  return dims.map((d, i) => (d.dimValue != null && num(d.dimValue) > 0 ? num(d.dimValue) : d.dimParam ? safeId(d.dimParam) : `d${i}`));
}

/** Group path from a PyTorch-exported node name like "/layer1/layer1.0/conv1/Conv". */
function modulePath(name: string): string[] {
  const parts = name.split('/').filter(Boolean);
  parts.pop(); // the op itself
  return parts.slice(0, 2);
}

export function onnxToSpec(bytes: Uint8Array, fileName: string): ImportResult {
  const model = onnx.ModelProto.decode(bytes);
  const graph = model.graph;
  if (!graph) throw new Error('This file has no graph — is it really an ONNX model?');
  const warnings: string[] = [];

  // weights
  const initSize = new Map<string, number>();
  for (const t of graph.initializer ?? []) initSize.set(t.name ?? '', (t.dims ?? []).reduce((a: number, d) => a * num(d), 1));

  // known tensor shapes
  const shapes = new Map<string, (number | string)[]>();
  for (const v of [...(graph.input ?? []), ...(graph.output ?? []), ...(graph.valueInfo ?? [])]) {
    const d = dimsOf(v.type);
    if (v.name && d) shapes.set(v.name, d);
  }

  const config: Record<string, number> = {};
  const nodes: OpNode[] = [];
  const edges: GraphEdge[] = [];
  /** tensor name → node that produces it (after plumbing has been skipped) */
  const producer = new Map<string, string>();
  const usedIds = new Set<string>();
  const uniq = (base: string) => {
    let id = safeId(base);
    let k = 1;
    while (usedIds.has(id)) id = `${safeId(base)}_${k++}`;
    usedIds.add(id);
    return id;
  };
  const registerSymbols = (dims: (number | string)[]) =>
    dims.forEach((d) => {
      if (typeof d === 'string' && !(d in config)) config[d] = 1;
    });

  // graph inputs (skip ones that are really weights)
  for (const inp of graph.input ?? []) {
    if (!inp.name || initSize.has(inp.name)) continue;
    const dims = shapes.get(inp.name) ?? [1];
    registerSymbols(dims);
    const id = uniq(`in_${inp.name}`);
    nodes.push({ id, op: 'input', label: inp.name, params: { shape: dims } });
    producer.set(inp.name, id);
  }

  const groupMembers = new Map<string, number>();
  let totalParams = 0;

  (graph.node ?? []).forEach((n, i) => {
    const opType = n.opType ?? 'Unknown';
    const dataInputs = (n.input ?? []).filter((t) => t && !initSize.has(t));
    const weightInputs = (n.input ?? []).filter((t) => t && initSize.has(t));

    if (PLUMBING.has(opType)) {
      // pass the first real producer straight through
      const src = dataInputs.map((t) => producer.get(t)).find(Boolean);
      if (src) (n.output ?? []).forEach((o) => producer.set(o, src));
      return;
    }

    // a Gather whose table is a weight is an embedding lookup
    let op = OP_MAP[opType] ?? 'custom';
    if (opType === 'Gather' && weightInputs.length) op = 'embedding';

    const params = weightInputs.reduce((s, t) => s + (initSize.get(t) ?? 0), 0);
    totalParams += params;
    const outName = n.output?.[0] ?? '';
    const preds = [...new Set(dataInputs.map((t) => producer.get(t)).filter(Boolean) as string[])];
    let out = shapes.get(outName);
    if (!out) {
      // unknown: reuse the first input's shape so downstream visuals still have something to draw
      const firstIn = dataInputs.map((t) => shapes.get(t)).find(Boolean);
      out = firstIn ?? [1];
      if (outName) shapes.set(outName, out);
    }
    registerSymbols(out);

    const id = uniq(n.name || `${opType}_${i}`);
    const path = modulePath(n.name ?? '');
    const group = path.length ? safeId(path.join('/')) : undefined;
    // count membership at every depth: "features" and "features/conv"
    path.forEach((_, d) => {
      const g = safeId(path.slice(0, d + 1).join('/'));
      groupMembers.set(g, (groupMembers.get(g) ?? 0) + 1);
    });
    nodes.push({
      id,
      op,
      label: op === 'custom' ? opType : `${opType}${path.length ? ` · ${path[path.length - 1]}` : ''}`,
      params: { __out: out, __params: params, onnxOp: opType },
      group,
    });
    preds.forEach((p) => edges.push({ from: p, to: id }));
    (n.output ?? []).forEach((o) => producer.set(o, id));
  });

  // a module becomes a group when it holds at least two operations
  const groupIds = new Set([...groupMembers].filter(([, c]) => c >= 2).map(([g]) => g));
  const nearest = (path: string | undefined) => {
    let p = path;
    while (p) {
      if (groupIds.has(p)) return p;
      p = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : undefined;
    }
    return undefined;
  };
  const groups: GraphGroup[] = [...groupIds].map((gid) => ({
    id: gid,
    label: gid.split('/').pop()!,
    parent: gid.includes('/') ? nearest(gid.slice(0, gid.lastIndexOf('/'))) : undefined,
  }));
  for (const n of nodes) n.group = nearest(n.group);

  const big = nodes.length > 40;
  if (big) groups.forEach((g) => !g.parent && (g.collapsed = true));

  // graph outputs
  for (const o of graph.output ?? []) {
    const src = o.name ? producer.get(o.name) : undefined;
    if (!src) continue;
    const id = uniq(`out_${o.name}`);
    nodes.push({ id, op: 'output', label: o.name ?? 'output', params: { __out: shapes.get(o.name!) ?? [1] } });
    edges.push({ from: src, to: id });
  }

  if (nodes.length > 600) warnings.push(`Large model (${nodes.length} operations): blocks start collapsed — double-click a block to open it.`);
  const unknown = nodes.filter((n) => n.op === 'custom').map((n) => n.params?.onnxOp);
  if (unknown.length) warnings.push(`${unknown.length} operations have no dedicated 3D shape (${[...new Set(unknown)].slice(0, 6).join(', ')}) and are drawn as generic blocks.`);

  const opset = num(model.opsetImport?.[0]?.version);
  const name = fileName.replace(/\.onnx$/i, '');
  return {
    spec: {
      meta: {
        name,
        category: 'custom',
        badge: `Imported ONNX · opset ${opset || '?'}`,
        description: `Imported from ${fileName}${model.producerName ? ` (exported by ${model.producerName})` : ''}.`,
      },
      config,
      nodes,
      edges,
      groups,
    },
    warnings,
    stats: { onnxNodes: graph.node?.length ?? 0, keptNodes: nodes.length, params: totalParams, opset, producer: model.producerName ?? '' },
  };
}
