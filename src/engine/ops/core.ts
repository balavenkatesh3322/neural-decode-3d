import { shapeOf, withLast } from '../graph/shape';
import type { OpDef } from './types';

const same = (ctx: { x: any }) => ctx.x;

/** Ops shared by every architecture family: I/O, linear algebra, norms, merges. */
export const CORE_OPS: Record<string, OpDef> = {
  input: {
    label: 'Input',
    family: 'io',
    visual: 'io',
    color: '#D9A441',
    infer: (ctx) => shapeOf(ctx.params.shape ?? [], ctx.scope),
    describe: 'The raw data entering the network.',
    eli5: 'This is what we feed the robot brain!',
  },
  output: {
    label: 'Output',
    family: 'io',
    visual: 'io',
    color: '#4E9F6B',
    infer: same,
    describe: 'The final result the network produces.',
    eli5: 'This is the robot brain’s answer!',
  },
  linear: {
    symbols: { in: ['x'], out: 'y' },
    label: 'Linear',
    family: 'mlp',
    visual: 'matrix',
    color: '#5B8DEF',
    infer: (ctx) => withLast(ctx.x, ctx.d('out')),
    params: (ctx) => ctx.lastDim * ctx.n('out') + (ctx.params.bias ? ctx.n('out') : 0),
    formula: 'y = xW^{\\top} + b',
    describe: 'A fully-connected layer: every output feature is a weighted sum of every input feature.',
    eli5: 'A big mixing board — every output knob listens to every input a little bit.',
  },
  flatten: {
    symbols: { in: ['X'], out: 'x' },
    label: 'Flatten',
    family: 'misc',
    visual: 'tensor',
    color: '#A8A29E',
    infer: (ctx) => {
      const [b, ...rest] = ctx.x.num;
      const symRest = ctx.x.sym.slice(1).filter((s) => s !== '1');
      return { sym: [ctx.x.sym[0], symRest.join('·') || '1'], num: [b, rest.reduce((a, c) => a * c, 1)] };
    },
    formula: '(B, C, 1, 1) \\to (B, C)',
    describe: 'Reshapes a tensor into a flat vector per example. No numbers change, only their arrangement.',
  },
  activation: {
    symbols: { in: ['x'], out: 'σ(x)' },
    label: 'Activation',
    family: 'mlp',
    visual: 'norm',
    color: '#F2A65A',
    infer: same,
    formula: '\\mathrm{ReLU}(x) = \\max(0, x)',
    describe: 'A non-linear function applied element-wise, letting the network model curves instead of only straight lines.',
  },
  softmax: {
    symbols: { in: ['z'], out: 'p' },
    label: 'Softmax',
    family: 'mlp',
    visual: 'norm',
    color: '#E58BA8',
    infer: same,
    formula: '\\mathrm{softmax}(z)_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}',
    describe: 'Turns raw scores into probabilities that are positive and sum to 1.',
  },
  ffn: {
    symbols: { in: ['x'], out: 'FFN(x)' },
    label: 'Feed-Forward',
    family: 'mlp',
    visual: 'ffn',
    color: '#E0876A',
    infer: same,
    params: (ctx) => {
      const d = ctx.lastDim;
      const h = ctx.n('hidden');
      return ctx.params.kind === 'swiglu' ? 3 * d * h : 2 * d * h + (ctx.params.bias ? h + d : 0);
    },
    formula: '\\mathrm{FFN}(x) = W_2\\,\\sigma(W_1 x)',
    describe: 'Expands each token to a wider hidden size, applies a non-linearity, then projects back. This is where most “knowledge” lives.',
    eli5: 'Each word visits a giant library, looks up facts, and comes back smarter.',
  },
  norm: {
    symbols: { in: ['x'], out: 'x̂' },
    label: 'Norm',
    family: 'norm',
    visual: 'norm',
    color: '#58B4AE',
    infer: same,
    params: (ctx) => {
      const kind = ctx.params.kind ?? 'layer';
      if (kind === 'rms') return ctx.lastDim;
      if (kind === 'batch' || kind === 'group') return 2 * ctx.channels;
      return 2 * ctx.lastDim;
    },
    formula: '\\hat{x} = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}\\,\\gamma + \\beta',
    describe: 'Rescales activations to a stable range so deep stacks of layers can train.',
    eli5: 'Keeps the volume even so nobody shouts and nobody whispers.',
  },
  add: {
    symbols: { in: ['F(x)', 'x'], out: 'y' },
    label: 'Add (Residual)',
    family: 'merge',
    visual: 'merge',
    color: '#7A9E7E',
    infer: same,
    formula: 'y = x + F(x)',
    describe: 'Adds a layer’s output back onto its input (a residual / skip connection), so information and gradients can bypass the layer.',
    eli5: 'Keep your original notes and just add the new ideas on top.',
  },
  multiply: {
    symbols: { in: ['x', 'z'], out: 'y' },
    label: 'Multiply (Gate)',
    family: 'merge',
    visual: 'merge',
    color: '#B07CC6',
    infer: same,
    formula: 'y = x \\odot \\sigma(z)',
    describe: 'Element-wise multiplication — one branch acts as a gate deciding how much of the other passes through.',
  },
  concat: {
    symbols: { in: ['a', 'b'], out: '[a; b]' },
    label: 'Concatenate',
    family: 'merge',
    visual: 'merge',
    color: '#8C9EC8',
    infer: (ctx) => {
      const axis = ctx.params.axis ?? 1;
      const base = ctx.x;
      const total = ctx.inputs.reduce((s, i) => s + i.num[axis], 0);
      const sym = [...base.sym];
      sym[axis] = ctx.inputs.map((i) => i.sym[axis]).join('+');
      const num = [...base.num];
      num[axis] = total;
      return { sym, num };
    },
    describe: 'Stacks tensors side by side along one axis.',
  },
  dropout: {
    symbols: { in: ['x'], out: 'y' },
    label: 'Dropout',
    family: 'misc',
    visual: 'norm',
    color: '#B9AEA3',
    infer: same,
    formula: 'y = \\frac{m \\odot x}{1-p},\\; m_i \\sim \\mathrm{Bernoulli}(1-p)',
    describe: 'During training, randomly zeroes a fraction p of activations so the network cannot rely on any single neuron. Does nothing at inference.',
    eli5: 'Practising with some teammates sitting out, so everyone learns to play every position.',
  },
  custom: {
    label: 'Block',
    family: 'misc',
    visual: 'tensor',
    color: '#9C8F84',
    infer: (ctx) => (ctx.params.out ? shapeOf(ctx.params.out, ctx.scope) : ctx.x),
    params: (ctx) => ctx.params.paramCount ?? 0,
    describe: 'A black-box module.',
  },
};
