import { symDiv, symMul } from '../graph/shape';
import type { InferCtx, OpDef } from './types';

function spatial(ctx: InferCtx, outC: { sym: string; num: number }, stride: number, k: number, pad: number) {
  const [b, , h, w] = ctx.x.num;
  const hOut = Math.floor((h + 2 * pad - k) / stride) + 1;
  const wOut = Math.floor((w + 2 * pad - k) / stride) + 1;
  const sameSize = hOut === h;
  return {
    sym: [ctx.x.sym[0], outC.sym, sameSize ? ctx.x.sym[2] : symDiv(ctx.x.sym[2], stride), sameSize ? ctx.x.sym[3] : symDiv(ctx.x.sym[3], stride)],
    num: [b, outC.num, hOut, wOut],
  };
}

/** Bottleneck residual stage params (ResNet v1.5, BN gamma/beta counted). */
function bottleneckStageParams(inC: number, mid: number, out: number, blocks: number, stride: number) {
  let p = 0;
  for (let i = 0; i < blocks; i++) {
    const c = i === 0 ? inC : out;
    p += c * mid + 2 * mid; // 1x1 reduce + BN
    p += 9 * mid * mid + 2 * mid; // 3x3 + BN
    p += mid * out + 2 * out; // 1x1 expand + BN
    if (i === 0 && (c !== out || stride !== 1)) p += c * out + 2 * out; // projection shortcut
  }
  return p;
}

/** Ops for vision / spatial models (NCHW tensors). */
export const VISION_OPS: Record<string, OpDef> = {
  conv2d: {
    symbols: { in: ['X'], out: 'Y' },
    label: 'Conv2D',
    family: 'conv',
    visual: 'conv',
    color: '#6C9BD2',
    infer: (ctx) => {
      const k = ctx.n('k', 3);
      return spatial(ctx, ctx.d('out'), ctx.n('stride', 1), k, ctx.n('pad', Math.floor(k / 2)));
    },
    params: (ctx) => {
      const k = ctx.n('k', 3);
      const out = ctx.n('out');
      return ctx.channels * out * k * k + (ctx.params.bn ? 2 * out : ctx.params.bias ? out : 0);
    },
    formula: 'Y_{c} = \\sum_{c\'} W_{c,c\'} * X_{c\'} + b_c',
    describe: 'Slides small learned filters across the image. Each filter detects one pattern (edge, texture, eye…) everywhere it appears.',
    eli5: 'A magnifying glass that scans the picture looking for one kind of shape.',
  },
  pool: {
    symbols: { in: ['x'], out: 'y' },
    label: 'Pooling',
    family: 'conv',
    visual: 'pool',
    color: '#8FA9C9',
    infer: (ctx) => {
      if (ctx.params.kind === 'global') {
        return { sym: [ctx.x.sym[0], ctx.x.sym[1], '1', '1'], num: [ctx.x.num[0], ctx.x.num[1], 1, 1] };
      }
      const k = ctx.n('k', 2);
      return spatial(ctx, { sym: ctx.x.sym[1], num: ctx.x.num[1] }, ctx.n('stride', k), k, ctx.n('pad', 0));
    },
    formula: 'y = \\max_{(i,j) \\in \\text{window}} x_{ij}',
    describe: 'Shrinks the spatial grid by summarising each window (max or average), keeping the strongest signals.',
  },
  resnet_stage: {
    symbols: { in: ['x'], out: 'y' },
    label: 'Bottleneck Stage',
    family: 'conv',
    visual: 'conv',
    color: '#5C86C4',
    infer: (ctx) => {
      const s = ctx.n('stride', 1);
      return spatial(ctx, ctx.d('out'), s, 1, 0);
    },
    params: (ctx) => bottleneckStageParams(ctx.channels, ctx.n('mid'), ctx.n('out'), ctx.n('blocks'), ctx.n('stride', 1)),
    formula: 'y = x + F(x),\\; F = \\mathrm{Conv}_{1\\times1} \\circ \\mathrm{Conv}_{3\\times3} \\circ \\mathrm{Conv}_{1\\times1}',
    describe: 'A stack of bottleneck residual blocks (1×1 squeeze → 3×3 → 1×1 expand, plus a shortcut).',
  },
  double_conv: {
    symbols: { in: ['x'], out: 'y' },
    label: '2× Conv 3×3',
    family: 'conv',
    visual: 'conv',
    color: '#6C9BD2',
    infer: (ctx) => spatial(ctx, ctx.d('out'), 1, 3, 1),
    params: (ctx) => {
      const out = ctx.n('out');
      return 9 * ctx.channels * out + 9 * out * out + 4 * out;
    },
    formula: 'y = \\mathrm{ReLU}(\\mathrm{BN}(W_2 * \\mathrm{ReLU}(\\mathrm{BN}(W_1 * x))))',
    describe: 'Two 3×3 convolutions, each followed by batch-norm and ReLU: the basic building block of U-Net.',
  },
  up_conv: {
    symbols: { in: ['X'], out: 'Y' },
    label: 'Up-Conv 2×2',
    family: 'conv',
    visual: 'pool',
    color: '#8FA9C9',
    infer: (ctx) => {
      const out = ctx.d('out');
      const [b, , h, w] = ctx.x.num;
      return { sym: [ctx.x.sym[0], out.sym, symMul(ctx.x.sym[2], 2), symMul(ctx.x.sym[3], 2)], num: [b, out.num, h * 2, w * 2] };
    },
    params: (ctx) => ctx.channels * ctx.n('out') * 4 + ctx.n('out'),
    formula: 'Y = W^{\\top} \\star X \\quad(\\text{stride } 2)',
    describe: 'A transposed convolution that doubles the spatial size while halving channels — the “zoom back in” step of a decoder.',
  },
  upsample: {
    label: 'Upsample',
    family: 'conv',
    visual: 'pool',
    color: '#8FA9C9',
    infer: (ctx) => {
      const s = ctx.n('scale', 2);
      const [b, c, h, w] = ctx.x.num;
      return { sym: [ctx.x.sym[0], ctx.x.sym[1], symMul(ctx.x.sym[2], s), symMul(ctx.x.sym[3], s)], num: [b, c, h * s, w * s] };
    },
    describe: 'Enlarges the spatial grid (nearest-neighbour or learned).',
  },
};

export { bottleneckStageParams };
