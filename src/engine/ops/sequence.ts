import { withLast } from '../graph/shape';
import type { OpDef } from './types';

/** Ops for language / sequence models: embeddings, attention, routing, state-space. */
export const SEQUENCE_OPS: Record<string, OpDef> = {
  embedding: {
    symbols: { in: ['token_ids'], out: 'X' },
    label: 'Embedding',
    family: 'embedding',
    visual: 'embedding',
    color: '#E3A23B',
    infer: (ctx) => {
      const d = ctx.d('dim');
      return { sym: [...ctx.x.sym, d.sym], num: [...ctx.x.num, d.num] };
    },
    params: (ctx) => ctx.n('vocab') * ctx.n('dim'),
    formula: 'X = E[\\text{token\\_ids}], \\quad E \\in \\mathbb{R}^{V \\times d}',
    describe: 'Looks up a learned vector for every token id. Similar words end up with similar vectors.',
    eli5: 'Every word gets its own secret list of numbers, like map coordinates.',
  },
  posenc: {
    symbols: { in: ['x_m'], out: 'RoPE(x_m)' },
    label: 'Positional Encoding',
    family: 'embedding',
    visual: 'norm',
    color: '#D9A441',
    infer: (ctx) => ctx.x,
    params: (ctx) => (ctx.params.kind === 'learned' ? ctx.n('max') * ctx.lastDim : 0),
    formula: '\\mathrm{RoPE}(x_m) = R_{\\Theta, m}\\, x_m',
    describe: 'Injects word-order information. Attention by itself is order-blind, so position must be added explicitly.',
    eli5: 'Gives each word a seat number so the model knows who came first.',
  },
  qkv: {
    symbols: { in: ['X'], out: 'Q, K, V' },
    label: 'Q · K · V Projections',
    family: 'attention',
    visual: 'qkv',
    color: '#3FA7C9',
    infer: (ctx) => {
      const h = ctx.d('heads');
      const dk = ctx.d('headDim');
      const [b, t] = [0, 1].map((i) => ({ sym: ctx.x.sym[i], num: ctx.x.num[i] }));
      return { sym: [b.sym, h.sym, t.sym, dk.sym], num: [b.num, h.num, t.num, dk.num] };
    },
    params: (ctx) => {
      const d = ctx.lastDim;
      const h = ctx.n('heads');
      const kv = ctx.n('kvHeads', ctx.params.heads);
      const dk = ctx.n('headDim');
      return d * h * dk + 2 * d * kv * dk;
    },
    formula: 'Q = XW_Q,\\; K = XW_K,\\; V = XW_V',
    describe: 'Projects each token into a Query (what am I looking for?), a Key (what do I contain?) and a Value (what do I pass on?).',
  },
  sdpa: {
    symbols: { in: ['Q, K, V'], out: 'Attn' },
    label: 'Scaled Dot-Product Attention',
    family: 'attention',
    visual: 'attention',
    color: '#8B6BD6',
    infer: (ctx) => {
      const out = ctx.d('out');
      return { sym: [ctx.x.sym[0], ctx.x.sym[2], out.sym], num: [ctx.x.num[0], ctx.x.num[2], out.num] };
    },
    // output projection W_O lives here
    params: (ctx) => ctx.x.num[1] * ctx.x.num[3] * ctx.n('out'),
    formula: '\\mathrm{Attn}(Q,K,V) = \\mathrm{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}} + M\\right)V',
    describe: 'Every token scores every other token, softmaxes the scores, and takes a weighted average of their values.',
  },
  attention: {
    symbols: { in: ['X', 'memory'], out: 'MHA(X)' },
    label: 'Multi-Head Attention',
    family: 'attention',
    visual: 'attention',
    color: '#8B6BD6',
    infer: (ctx) => ctx.x,
    params: (ctx) => {
      const d = ctx.lastDim;
      const h = ctx.n('heads');
      const kv = ctx.n('kvHeads', ctx.params.heads);
      const dk = d / h;
      const kvIn = ctx.params.kind === 'cross' && ctx.inputs[1] ? ctx.inputs[1].num[ctx.inputs[1].num.length - 1] : d;
      // bias: true → q,k,v,o biases; 'no-k' → Whisper-style (no key bias)
      const bias = ctx.params.bias === 'no-k' ? h * dk + kv * dk + d : ctx.params.bias ? h * dk + 2 * kv * dk + d : 0;
      return d * h * dk + 2 * kvIn * kv * dk + h * dk * d + bias;
    },
    formula: '\\mathrm{MHA}(X) = \\mathrm{Concat}(\\mathrm{head}_1..\\mathrm{head}_h)W_O',
    describe: 'Q/K/V projections, scaled dot-product attention across several heads, then an output projection — fused into one block.',
  },
  lm_head: {
    symbols: { in: ['h_t'], out: 'P(w_{t+1})' },
    label: 'LM Head',
    family: 'mlp',
    visual: 'matrix',
    color: '#4E9F6B',
    infer: (ctx) => withLast(ctx.x, ctx.d('vocab')),
    params: (ctx) => (ctx.params.tied ? 0 : ctx.lastDim * ctx.n('vocab')),
    formula: 'P(w_{t+1}) = \\mathrm{softmax}(h_t W_{\\text{vocab}}^{\\top} / T)',
    describe: 'Projects the final hidden state onto the whole vocabulary to score every possible next token.',
  },
  router: {
    symbols: { in: ['x'], out: 'g' },
    label: 'Top-k Router',
    family: 'routing',
    visual: 'router',
    color: '#C9704E',
    infer: (ctx) => withLast(ctx.x, ctx.d('topK')),
    params: (ctx) => ctx.lastDim * ctx.n('experts'),
    formula: 'g = \\mathrm{TopK}(\\mathrm{softmax}(xW_g), k)',
    describe: 'A tiny learned classifier that picks which k experts each token should visit.',
    eli5: 'A receptionist who sends each visitor to the two best doctors.',
  },
  expert: {
    symbols: { in: ['x'], out: 'E_i(x)' },
    label: 'Expert FFN',
    family: 'routing',
    visual: 'ffn',
    color: '#E0876A',
    infer: (ctx) => {
      const d = ctx.lastDim;
      if (ctx.params.tokens !== undefined) {
        const t = ctx.d('tokens');
        return { sym: [t.sym, ctx.x.sym[ctx.x.sym.length - 1]], num: [t.num, d] };
      }
      return ctx.x;
    },
    // `copies` lets one node stand for a whole bank of experts (e.g. 256 routed experts)
    params: (ctx) => 3 * ctx.lastDim * ctx.n('hidden') * ctx.n('copies', 1),
    formula: 'E_i(x) = W_2^{(i)}\\,(\\mathrm{SiLU}(W_1^{(i)} x) \\odot W_3^{(i)} x)',
    describe: 'One of many parallel feed-forward networks. Only the experts chosen by the router run for a given token.',
  },
  moe_combine: {
    symbols: { in: ['E_shared(x)', 'E_i(x)'], out: 'y' },
    label: 'Weighted Combine',
    family: 'routing',
    visual: 'merge',
    color: '#7A9E7E',
    infer: (ctx) => ctx.inputs.find((s) => s.num.length >= 3) ?? ctx.x,
    formula: 'y = \\sum_{i \\in \\mathrm{TopK}} g_i\\,E_i(x) + E_{\\text{shared}}(x)',
    describe: 'Blends the chosen experts’ outputs using the router’s gate weights.',
  },
  rnn: {
    symbols: { in: ['x_t'], out: 'h_t' },
    label: 'Recurrent Layer',
    family: 'ssm',
    visual: 'scan',
    color: '#C46FA0',
    infer: (ctx) => {
      const h = ctx.d('hidden');
      if (ctx.params.returnLast) return { sym: [ctx.x.sym[0], h.sym], num: [ctx.x.num[0], h.num] };
      return withLast(ctx.x, h);
    },
    params: (ctx) => {
      const gates = ctx.params.kind === 'lstm' ? 4 : ctx.params.kind === 'gru' ? 3 : 1;
      const h = ctx.n('hidden');
      return gates * (ctx.lastDim * h + h * h + 2 * h);
    },
    formula: '\\begin{aligned} f_t &= \\sigma(W_f[h_{t-1}, x_t]),\\; i_t = \\sigma(W_i[h_{t-1}, x_t]) \\\\ c_t &= f_t \\odot c_{t-1} + i_t \\odot \\tanh(W_c[h_{t-1}, x_t]) \\\\ h_t &= o_t \\odot \\tanh(c_t) \\end{aligned}',
    describe: 'Reads the sequence one step at a time, carrying a hidden state forward. LSTM/GRU gates decide what to keep, forget and output at each step.',
    eli5: 'Reading a story word by word while keeping notes in a notebook — and erasing what no longer matters.',
  },
  patch_tokens: {
    symbols: { in: ['patches'], out: 'tokens' },
    label: 'Patches → Tokens',
    family: 'embedding',
    visual: 'embedding',
    color: '#E3A23B',
    infer: (ctx) => {
      const [b, c, h, w] = ctx.x.num;
      return { sym: [ctx.x.sym[0], `${ctx.x.sym[2]}·${ctx.x.sym[3]}`, ctx.x.sym[1]], num: [b, h * w, c] };
    },
    formula: '(B, D, H_p, W_p) \\to (B, H_p W_p, D)',
    describe: 'Flattens the grid of patch embeddings into a sequence of tokens, so a transformer can treat an image like a sentence.',
    eli5: 'Cut the photo into stamps and line them up like words in a sentence.',
  },
  cls_token: {
    symbols: { in: ['x_1…x_N'], out: 'X' },
    label: '[CLS] Token',
    family: 'embedding',
    visual: 'embedding',
    color: '#D9A441',
    infer: (ctx) => {
      const s = ctx.x;
      return { sym: [s.sym[0], `${s.sym[1]}+1`, s.sym[2]], num: [s.num[0], s.num[1] + 1, s.num[2]] };
    },
    params: (ctx) => ctx.lastDim,
    formula: 'X = [x_{\\text{cls}};\\, x_1;\\, \\dots;\\, x_N]',
    describe: 'Prepends one extra learned token whose final state summarises the whole input — it becomes the input to the classifier.',
  },
  select_token: {
    label: 'Take [CLS]',
    family: 'misc',
    visual: 'tensor',
    color: '#A8A29E',
    infer: (ctx) => ({ sym: [ctx.x.sym[0], ctx.x.sym[2]], num: [ctx.x.num[0], ctx.x.num[2]] }),
    describe: 'Keeps only one token (the first, [CLS]) as a summary vector for the whole sequence.',
  },
  similarity: {
    symbols: { in: ['û', 'v̂'], out: 'S' },
    label: 'Similarity Matrix',
    family: 'attention',
    visual: 'attention',
    color: '#8B6BD6',
    infer: (ctx) => {
      const b = ctx.inputs[1] ?? ctx.x;
      return { sym: [ctx.x.sym[0], `${b.sym[0]}'`], num: [ctx.x.num[0], b.num[0]] };
    },
    params: () => 1,
    formula: 'S_{ij} = \\frac{\\langle \\hat{u}_i, \\hat{v}_j \\rangle}{\\tau}',
    describe: 'Compares every item from one side with every item from the other (cosine similarity scaled by a learned temperature). Matching pairs should light up on the diagonal.',
    eli5: 'A matching game: every photo is compared with every caption to find its partner.',
  },
  gcn_conv: {
    symbols: { in: ['H^{(l)}'], out: 'H^{(l+1)}' },
    label: 'Graph Convolution',
    family: 'mlp',
    visual: 'graph',
    color: '#4E9F6B',
    infer: (ctx) => withLast(ctx.x, ctx.d('out')),
    params: (ctx) => ctx.lastDim * ctx.n('out') + ctx.n('out'),
    formula: 'H^{(l+1)} = \\sigma\\!\\left(\\tilde{D}^{-\\frac12} \\tilde{A} \\tilde{D}^{-\\frac12} H^{(l)} W^{(l)}\\right)',
    describe: 'Each node averages its neighbours’ features (using the adjacency matrix), then applies a shared linear layer — information flows along the graph’s edges.',
    eli5: 'Everyone asks their friends what they think, then forms their own opinion.',
  },
  conv1d: {
    symbols: { in: ['x'], out: 'y' },
    label: 'Depthwise Conv1D',
    family: 'conv',
    visual: 'conv',
    color: '#6C9BD2',
    infer: (ctx) => ctx.x,
    params: (ctx) => ctx.lastDim * (ctx.n('k') + 1),
    formula: 'y_t = \\sum_{i=0}^{k-1} w_i\\, x_{t-i}',
    describe: 'A short causal convolution along time that mixes each token with its few predecessors.',
  },
  ssm_params: {
    symbols: { in: ['x'], out: 'Δ, B, C' },
    label: 'Selective Δ, B, C',
    family: 'ssm',
    visual: 'matrix',
    color: '#C46FA0',
    infer: (ctx) => ctx.x,
    params: (ctx) => {
      const di = ctx.lastDim;
      const n = ctx.n('dState');
      const r = ctx.n('dtRank');
      return di * (r + 2 * n) + r * di + di;
    },
    formula: 'B_t = xW_B,\\; C_t = xW_C,\\; \\Delta_t = \\mathrm{softplus}(xW_\\Delta)',
    describe: 'Computes the state-space parameters from the input itself — this “selectivity” lets Mamba decide what to remember per token.',
  },
  ssm_discretize: {
    symbols: { in: ['Δ, B, C'], out: 'Ā, B̄' },
    label: 'Discretize',
    family: 'ssm',
    visual: 'norm',
    color: '#A36FC4',
    infer: (ctx) => ctx.x,
    params: (ctx) => ctx.lastDim * ctx.n('dState'),
    formula: '\\bar{A} = e^{\\Delta A},\\quad \\bar{B} = \\Delta B',
    describe: 'Converts the continuous-time system (A, B) into a discrete per-token update using the step size Δ.',
  },
  ssm_scan: {
    symbols: { in: ['Ā, B̄', 'x_t'], out: 'y_t' },
    label: 'Selective Scan',
    family: 'ssm',
    visual: 'scan',
    color: '#7D5FC2',
    infer: (ctx) => ctx.x,
    params: (ctx) => ctx.lastDim,
    formula: 'h_t = \\bar{A}_t h_{t-1} + \\bar{B}_t x_t,\\quad y_t = C_t h_t + D x_t',
    describe: 'Runs the recurrence across the sequence with a parallel associative scan — linear time in sequence length.',
    eli5: 'A conveyor belt carrying a little notebook that each word can write into or erase.',
  },
};
