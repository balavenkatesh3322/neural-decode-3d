import type { Dim } from '../spec/schema';
import type { Scope } from '../graph/expr';
import { dim, DimValue, Shape } from '../graph/shape';

/** Which 3D visual draws an op. Each kind has one component in engine/render/visuals. */
export type VisualKind =
  | 'io'
  | 'tensor'
  | 'embedding'
  | 'matrix'
  | 'qkv'
  | 'attention'
  | 'ffn'
  | 'norm'
  | 'merge'
  | 'conv'
  | 'pool'
  | 'router'
  | 'scan'
  | 'clock'
  | 'graph';

export type OpFamily =
  | 'io'
  | 'embedding'
  | 'attention'
  | 'mlp'
  | 'norm'
  | 'merge'
  | 'conv'
  | 'routing'
  | 'ssm'
  | 'generative'
  | 'misc';

export class InferCtx {
  constructor(
    public readonly inputs: Shape[],
    public readonly params: Record<string, any>,
    public readonly scope: Scope,
  ) {}

  /** First input, or throw a helpful error. */
  get x(): Shape {
    if (!this.inputs[0]) throw new Error('expects at least one input');
    return this.inputs[0];
  }

  /** Read a dimension-valued param (number or symbolic expression). */
  d(key: string, fallback?: Dim): DimValue {
    const v = this.params[key] ?? fallback;
    if (v === undefined) throw new Error(`missing param "${key}"`);
    return dim(v, this.scope);
  }

  /** Numeric value of a param. */
  n(key: string, fallback?: Dim): number {
    return this.d(key, fallback).num;
  }

  /** Last dimension of the first input (the "feature" dim for sequence tensors). */
  get lastDim(): number {
    return this.x.num[this.x.num.length - 1];
  }

  /** Channel dim (index 1) for NCHW tensors. */
  get channels(): number {
    return this.x.num[1];
  }
}

export interface OpDef {
  label: string;
  family: OpFamily;
  visual: VisualKind;
  color: string;
  infer: (ctx: InferCtx) => Shape;
  params?: (ctx: InferCtx) => number;
  /** Default KaTeX formula, shown when the node has no richer lesson content. */
  formula?: string;
  /** Default plain-language description. */
  describe: string;
  /** One-line "explain like I'm five". */
  eli5?: string;
  /** Formula symbols: one per data input (in edge order), and the output — links the maths to the 3D parts. */
  symbols?: { in: string[]; out: string };
}
