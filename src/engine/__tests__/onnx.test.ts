import { describe, expect, it } from 'vitest';
import { onnx } from 'onnx-proto';
import { onnxToSpec } from '../../features/import/onnx';
import { inferGraph } from '../graph/infer';
import { buildScene } from '../scene';
import { architectureFromSpec } from '../autoContent';

const tensor = (name: string, dims: number[]) => onnx.TensorProto.create({ name, dims, dataType: 1 });
const vi = (name: string, dims: (number | string)[]) =>
  onnx.ValueInfoProto.create({
    name,
    type: { tensorType: { elemType: 1, shape: { dim: dims.map((d) => (typeof d === 'number' ? { dimValue: d } : { dimParam: d })) } } },
  });

/** A tiny CNN as PyTorch would export it: conv → relu → (shape plumbing) → pool → flatten → gemm. */
function tinyCnn(): Uint8Array {
  const graph = onnx.GraphProto.create({
    name: 'tiny',
    input: [vi('input', ['batch', 3, 32, 32])],
    output: [vi('logits', ['batch', 10])],
    initializer: [tensor('conv.weight', [16, 3, 3, 3]), tensor('conv.bias', [16]), tensor('fc.weight', [10, 16]), tensor('fc.bias', [10])],
    valueInfo: [vi('c', ['batch', 16, 32, 32]), vi('r', ['batch', 16, 32, 32]), vi('p', ['batch', 16, 1, 1]), vi('f', ['batch', 16])],
    node: [
      { name: '/features/conv/Conv', opType: 'Conv', input: ['input', 'conv.weight', 'conv.bias'], output: ['c'] },
      { name: '/features/relu/Relu', opType: 'Relu', input: ['c'], output: ['r'] },
      { name: '/features/Shape', opType: 'Shape', input: ['r'], output: ['s'] },
      { name: '/pool/GlobalAveragePool', opType: 'GlobalAveragePool', input: ['r'], output: ['p'] },
      { name: '/Flatten', opType: 'Flatten', input: ['p'], output: ['f'] },
      { name: '/fc/Gemm', opType: 'Gemm', input: ['f', 'fc.weight', 'fc.bias'], output: ['logits'] },
    ],
  });
  const model = onnx.ModelProto.create({ irVersion: 8, producerName: 'pytorch', opsetImport: [{ version: 17 }], graph });
  return onnx.ModelProto.encode(model).finish();
}

describe('ONNX import', () => {
  it('maps ops, counts real weights, keeps shapes, drops plumbing, groups by module', async () => {
    const { spec, stats } = onnxToSpec(tinyCnn(), 'tiny.onnx');
    expect(stats.params).toBe(16 * 27 + 16 + 160 + 10);
    expect(spec.nodes.some((n) => n.params?.onnxOp === 'Shape')).toBe(false);
    expect(spec.nodes.find((n) => n.params?.onnxOp === 'Conv')?.op).toBe('conv2d');
    expect(spec.nodes.find((n) => n.params?.onnxOp === 'Gemm')?.op).toBe('linear');
    expect(spec.groups?.map((g) => g.id)).toContain('features');

    const infer = inferGraph(spec);
    expect(infer.errors).toEqual([]);
    expect(infer.totalParams).toBe(stats.params);
    const conv = spec.nodes.find((n) => n.params?.onnxOp === 'Conv')!;
    expect(infer.nodes.get(conv.id)!.out.sym).toEqual(['batch', '16', '32', '32']);

    // and it is immediately teachable + renderable
    const arch = architectureFromSpec('tiny', spec);
    expect(arch.dataFlowSteps.length).toBeGreaterThan(2);
    const { layout } = await buildScene(spec, infer, new Set());
    expect(layout.nodes.size).toBeGreaterThan(4);
  });

  it('rejects garbage with a readable error', () => {
    expect(() => onnxToSpec(new Uint8Array([1, 2, 3, 4, 5]), 'x.onnx')).toThrow();
  });
});
