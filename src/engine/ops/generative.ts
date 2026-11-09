import { symDiv, symMul } from '../graph/shape';
import type { OpDef } from './types';

/** Ops for diffusion / generative models. */
export const GENERATIVE_OPS: Record<string, OpDef> = {
  timestep_embed: {
    symbols: { in: ['t'], out: 'emb(t)' },
    label: 'Timestep Embedding',
    family: 'generative',
    visual: 'clock',
    color: '#D9A441',
    infer: (ctx) => {
      const d = ctx.d('dim');
      return { sym: [ctx.x.sym[0], d.sym], num: [ctx.x.num[0], d.num] };
    },
    params: (ctx) => {
      const base = ctx.n('base');
      const d = ctx.n('dim');
      return base * d + d + d * d + d;
    },
    formula: '\\mathrm{emb}(t) = \\mathrm{MLP}([\\sin(\\omega_i t), \\cos(\\omega_i t)])',
    describe: 'Encodes the current noise level t as a vector, so the network knows how noisy its input is.',
    eli5: 'A clock telling the artist how blurry the picture still is.',
  },
  unet_block: {
    symbols: { in: ['x', 'skip'], out: 'h' },
    label: 'U-Net Block',
    family: 'generative',
    visual: 'conv',
    color: '#5C86C4',
    infer: (ctx) => {
      const out = ctx.d('out');
      const scale = ctx.n('scale', 1);
      const [b, , h, w] = ctx.x.num;
      const sh = scale >= 1 ? symMul(ctx.x.sym[2], scale) : symDiv(ctx.x.sym[2], 1 / scale);
      const sw = scale >= 1 ? symMul(ctx.x.sym[3], scale) : symDiv(ctx.x.sym[3], 1 / scale);
      return { sym: [ctx.x.sym[0], out.sym, sh, sw], num: [b, out.num, h * scale, w * scale] };
    },
    // ≈ ResNet blocks + (optional) spatial transformer; rough but within ~15% of SD-1.5
    params: (ctx) => {
      const inC = ctx.inputs.reduce((s, i) => s + i.num[1], 0);
      const out = ctx.n('out');
      const tdim = ctx.n('tdim', 1280);
      const ctxDim = ctx.n('ctxDim', 768);
      const nRes = ctx.n('layers', 2);
      let p = 0;
      for (let i = 0; i < nRes; i++) {
        const c = i === 0 ? inC : out;
        p += 9 * c * out + 9 * out * out + tdim * out + (c !== out ? c * out : 0);
        if (ctx.params.attn) p += 4 * out * out + 2 * out * ctxDim + 2 * out * out + 12 * out * out;
      }
      if (ctx.params.scale && ctx.params.scale !== 1) p += 9 * out * out;
      return p;
    },
    formula: 'h = \\mathrm{CrossAttn}(\\mathrm{ResBlock}(x, t_{emb}),\\, c_{text})',
    describe: 'Residual conv blocks conditioned on the timestep, optionally followed by self- and cross-attention to the text prompt.',
  },
  reparam: {
    symbols: { in: ['μ', 'log σ²'], out: 'z' },
    label: 'Reparameterize',
    family: 'generative',
    visual: 'merge',
    color: '#C46FA0',
    infer: (ctx) => ctx.x,
    formula: 'z = \\mu + \\sigma \\odot \\epsilon,\\quad \\epsilon \\sim \\mathcal{N}(0, I)',
    describe: 'Samples a latent code from the predicted mean and variance in a way gradients can flow through (the “reparameterization trick”).',
    eli5: 'Pick a random spot near the target, so the model learns a whole neighbourhood rather than one point.',
  },
  denoise: {
    symbols: { in: ['z_t', 'ε_θ'], out: 'z_{t−1}' },
    label: 'Scheduler Step',
    family: 'generative',
    visual: 'merge',
    color: '#4E9F6B',
    infer: (ctx) => ctx.x,
    formula: 'z_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}}\\left(z_t - \\frac{1-\\alpha_t}{\\sqrt{1-\\bar\\alpha_t}}\\,\\epsilon_\\theta\\right) + \\sigma_t \\xi',
    describe: 'Subtracts a fraction of the predicted noise from the latent, moving one step from noise toward a clean image.',
  },
};
