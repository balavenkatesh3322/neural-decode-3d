/**
 * Tiny, exact worked examples for each kind of layer. Every number here is actually
 * computed (not decorative), using 2–4 dimensional toy vectors so a learner can follow
 * the arithmetic by hand — the same arithmetic the real layer does with thousands of numbers.
 */
export interface WalkStep {
  title: string;
  text: string;
  table?: { cols: string[]; rows: (string | number)[][]; highlightRow?: number };
  formula?: string;
}

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const vec = (v: number[]) => `[${v.map((x) => r(x)).join(', ')}]`;
const softmax = (z: number[]) => {
  const m = Math.max(...z.filter(Number.isFinite));
  const e = z.map((v) => (Number.isFinite(v) ? Math.exp(v - m) : 0));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
};
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const matvec = (W: number[][], x: number[]) => W.map((row) => dot(row, x));
const gelu = (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));

function linearSteps(outName = 'y'): WalkStep[] {
  const x = [1, 2, -1];
  const W = [
    [0.5, -0.2, 0.1],
    [0.3, 0.8, -0.5],
  ];
  const b = [0.1, -0.3];
  const y = matvec(W, x).map((v, i) => v + b[i]);
  return [
    { title: 'Take one input vector', text: `Imagine one token (or one example) with just 3 features instead of thousands: x = ${vec(x)}.` },
    {
      title: 'Each output neuron weighs every input',
      text: 'Every output has its own row of learned weights. It multiplies each input by its weight and adds them up.',
      table: {
        cols: ['output', 'weights row', 'products', 'sum'],
        rows: W.map((row, i) => [`${outName}${i + 1}`, vec(row), row.map((w, j) => `${w}×${x[j]}`).join(' + '), r(dot(row, x))]),
      },
      formula: 'z_i = \\sum_j W_{ij}\\, x_j',
    },
    {
      title: 'Add the bias',
      text: `Each output gets its own learned offset b = ${vec(b)}.`,
      table: { cols: ['output', 'sum', '+ bias', 'result'], rows: y.map((v, i) => [`${outName}${i + 1}`, r(v - b[i]), b[i], r(v)]) },
      formula: 'y = Wx + b',
    },
    { title: 'Result', text: `3 numbers went in, 2 came out: ${outName} = ${vec(y)}. A real layer does exactly this, with e.g. 4,096 inputs and 4,096 outputs — about 16.8 million multiply-adds per token.` },
  ];
}

function attentionSteps(causal: boolean, cross = false): WalkStep[] {
  const toks = cross ? ['El', 'conocimiento', '…'] : ['The', 'cat', 'sat'];
  const keysFrom = cross ? ['Knowledge', 'is', 'power'] : toks;
  const Q = [
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  const K = [
    [1, 0],
    [0.2, 1],
    [0.5, 0.5],
  ];
  const V = [
    [1, 0],
    [0, 1],
    [0.5, 0.5],
  ];
  const d = Math.sqrt(2);
  const scores = Q.map((q) => K.map((k) => dot(q, k)));
  const scaled = scores.map((row) => row.map((v) => v / d));
  const masked = scaled.map((row, i) => row.map((v, j) => (causal && j > i ? -Infinity : v)));
  const weights = masked.map(softmax);
  const out = weights.map((w) => [0, 1].map((c) => w.reduce((s, wj, j) => s + wj * V[j][c], 0)));
  const fmtRow = (row: number[]) => row.map((v) => (Number.isFinite(v) ? r(v) : '−∞'));
  return [
    {
      title: cross ? 'Queries from the decoder, keys & values from the encoder' : 'Every token makes a query, a key and a value',
      text: cross
        ? 'Each target word asks a question (Q). The source sentence offers keys (K) to match against, and values (V) to copy from.'
        : 'Q = what this token is looking for, K = what it offers, V = what it will pass on. (2 numbers each here; 128 per head in a real model.)',
      table: { cols: ['token', 'Q', 'K', 'V'], rows: toks.map((t, i) => [`${t}${cross ? ` / ${keysFrom[i]}` : ''}`, vec(Q[i]), vec(K[i]), vec(V[i])]) },
    },
    {
      title: 'Score every pair: Q · K',
      text: 'Dot products measure how well each query matches each key. Big = relevant.',
      table: { cols: ['query ↓ / key →', ...keysFrom], rows: toks.map((t, i) => [t, ...fmtRow(scores[i])]) },
      formula: 'S = QK^{\\top}',
    },
    {
      title: 'Scale by √d',
      text: `Divide by √d = ${r(d)} so the scores do not get too large (which would make softmax too “peaky” and gradients tiny).`,
      table: { cols: ['query ↓ / key →', ...keysFrom], rows: toks.map((t, i) => [t, ...fmtRow(scaled[i])]) },
      formula: 'S / \\sqrt{d_k}',
    },
    ...(causal
      ? [
          {
            title: 'Causal mask: no peeking ahead',
            text: 'Each token may only look at itself and earlier tokens, so future scores are set to −∞ (they become 0 after softmax).',
            table: { cols: ['query ↓ / key →', ...keysFrom], rows: toks.map((t, i) => [t, ...fmtRow(masked[i])]) },
            formula: 'S_{ij} = -\\infty \\;\\text{ if } j > i',
          },
        ]
      : []),
    {
      title: 'Softmax each row into attention weights',
      text: 'Each row now sums to 1: how much of each other token to listen to.',
      table: { cols: ['query ↓ / key →', ...keysFrom], rows: toks.map((t, i) => [t, ...weights[i].map((v) => `${r(v * 100, 0)}%`)]) },
      formula: 'A = \\mathrm{softmax}(S/\\sqrt{d_k})',
    },
    {
      title: 'Mix the values',
      text: 'Each output is the weighted average of the values, using that row’s weights.',
      table: { cols: ['token', 'output = Σ weight × V'], rows: toks.map((t, i) => [t, vec(out[i])]) },
      formula: '\\mathrm{out}_i = \\sum_j A_{ij} V_j',
    },
    { title: 'Result', text: `Same number of tokens in and out, but every token now carries information from the tokens it attended to. ${causal ? `“${toks[0]}” can only see itself; “${toks[2]}” blends all three.` : ''}` },
  ];
}

function ffnSteps(kind: string): WalkStep[] {
  const x = [1, -0.5];
  const W1 = [
    [0.8, 0.2],
    [-0.5, 0.9],
    [0.3, -0.7],
    [1.0, 0.4],
  ];
  const h = matvec(W1, x);
  const a = kind === 'swiglu' ? h.map((v) => v / (1 + Math.exp(-v))) : kind === 'relu' ? h.map((v) => Math.max(0, v)) : h.map(gelu);
  const W2 = [
    [0.5, -0.3, 0.2, 0.4],
    [-0.2, 0.6, 0.1, 0.3],
  ];
  const y = matvec(W2, a);
  const act = kind === 'swiglu' ? 'SiLU (× gate)' : kind === 'relu' ? 'ReLU' : 'GELU';
  return [
    { title: 'One token arrives', text: `Its vector (2 numbers here, 4,096 in a real model): x = ${vec(x)}.` },
    { title: 'Expand: project to a wider hidden layer', text: 'A linear layer makes many more features (here 2 → 4; real models 4,096 → 14,336). Each hidden neuron checks for one pattern.', table: { cols: ['hidden', 'W₁ row · x'], rows: h.map((v, i) => [`h${i + 1}`, r(v)]) }, formula: 'h = W_1 x' },
    { title: `Non-linearity: ${act}`, text: 'Weak or negative evidence is squashed, strong evidence passes. This is what lets the block store non-linear facts.', table: { cols: ['hidden', 'before', 'after'], rows: h.map((v, i) => [`h${i + 1}`, r(v), r(a[i])]) }, formula: kind === 'swiglu' ? '\\mathrm{SiLU}(W_g x) \\odot W_u x' : '\\sigma(h)' },
    { title: 'Shrink back to the model width', text: 'A second linear layer combines the active patterns back into the token’s original size.', table: { cols: ['output', 'W₂ row · a'], rows: y.map((v, i) => [`y${i + 1}`, r(v)]) }, formula: 'y = W_2\\, \\sigma(W_1 x)' },
    { title: 'Result', text: `Same size in and out (${vec(x)} → ${vec(y)}), but the token has “looked up” knowledge stored in W₁ and W₂. This happens to every token independently.` },
  ];
}

function normSteps(kind: string): WalkStep[] {
  const x = [2, 4, 6, 8];
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const rms = Math.sqrt(x.reduce((a, b) => a + b * b, 0) / x.length);
  const variance = x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
  const std = Math.sqrt(variance + 1e-5);
  const n = kind === 'rms' ? x.map((v) => v / rms) : x.map((v) => (v - mean) / std);
  const gamma = 1.5;
  return [
    { title: 'Take one token’s features', text: `x = ${vec(x)} — some are big, some small. After many layers these can drift wildly.` },
    kind === 'rms'
      ? { title: 'Measure the size (RMS)', text: `Root-mean-square: √((2²+4²+6²+8²)/4) = ${r(rms)}.`, formula: '\\mathrm{RMS}(x) = \\sqrt{\\tfrac1n \\sum x_i^2}' }
      : { title: 'Measure mean and spread', text: `mean μ = ${r(mean)}, standard deviation σ = ${r(std)}.`, formula: '\\mu = \\tfrac1n\\sum x_i,\\; \\sigma^2 = \\tfrac1n\\sum (x_i-\\mu)^2' },
    { title: 'Normalise', text: kind === 'rms' ? 'Divide by the RMS so the vector has unit size.' : 'Subtract the mean and divide by σ: now centred on 0 with spread 1.', table: { cols: ['feature', 'before', 'after'], rows: x.map((v, i) => [`x${i + 1}`, v, r(n[i])]) } },
    { title: 'Learned scale (and shift)', text: `Learned γ (and β for LayerNorm) let the network choose the best range. With γ = ${gamma}: ${vec(n.map((v) => v * gamma))}.`, formula: '\\hat x\\,\\gamma + \\beta' },
    { title: 'Result', text: 'Same shape, same direction of information — just a healthy, consistent scale for the next layer.' },
  ];
}

function convSteps(): WalkStep[] {
  const patch = [
    [0, 0, 9],
    [0, 0, 9],
    [0, 0, 9],
  ];
  const k = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
  const prod = patch.map((row, i) => row.map((v, j) => v * k[i][j]));
  const sum = prod.flat().reduce((a, b) => a + b, 0);
  return [
    { title: 'Look at a small window', text: 'A 3×3 window of the image (0 = dark, 9 = bright): a vertical edge on the right.', table: { cols: ['', 'c1', 'c2', 'c3'], rows: patch.map((row, i) => [`r${i + 1}`, ...row]) } },
    { title: 'A learned 3×3 filter', text: 'This kernel responds to “dark on the left, bright on the right” — a vertical edge detector.', table: { cols: ['', 'c1', 'c2', 'c3'], rows: k.map((row, i) => [`r${i + 1}`, ...row]) } },
    { title: 'Multiply and add', text: `Element-wise products, then sum them all: ${sum}. A big number = “edge found here”.`, table: { cols: ['', 'c1', 'c2', 'c3'], rows: prod.map((row, i) => [`r${i + 1}`, ...row]) }, formula: 'Y_{ij} = \\sum_{u,v} K_{uv} X_{i+u,j+v}' },
    { title: 'Slide everywhere', text: 'The same 9 weights slide over every position, producing one feature map. A layer has many kernels → many feature maps (channels).' },
    { title: 'Result', text: 'Width/height stay the same (or shrink with stride), and the number of channels becomes the number of kernels.' },
  ];
}

function poolSteps(global: boolean): WalkStep[] {
  const w = [
    [1, 3, 2, 0],
    [5, 8, 1, 4],
    [0, 2, 6, 7],
    [3, 1, 9, 2],
  ];
  const max = [
    [8, 4],
    [3, 9],
  ];
  const avg = w.flat().reduce((a, b) => a + b, 0) / 16;
  return global
    ? [
        { title: 'A whole feature map', text: 'One channel’s 4×4 map of detector strengths.', table: { cols: ['', 'c1', 'c2', 'c3', 'c4'], rows: w.map((row, i) => [`r${i + 1}`, ...row]) } },
        { title: 'Average everything', text: `Global average pooling replaces the whole map with one number: ${r(avg)} = “how much of this feature is in the image”.`, formula: 'y_c = \\tfrac{1}{HW}\\sum_{i,j} X_{c,i,j}' },
        { title: 'Result', text: 'Every channel becomes one number, so a (C, 7, 7) map becomes a C-length vector, ready for the classifier.' },
      ]
    : [
        { title: 'A feature map', text: 'Detector strengths on a 4×4 grid.', table: { cols: ['', 'c1', 'c2', 'c3', 'c4'], rows: w.map((row, i) => [`r${i + 1}`, ...row]) } },
        { title: 'Keep the strongest of each 2×2 window', text: 'Max pooling keeps only the biggest value in each window.', table: { cols: ['', 'c1', 'c2'], rows: max.map((row, i) => [`r${i + 1}`, ...row]) }, formula: 'y = \\max_{\\text{window}} x' },
        { title: 'Result', text: 'Half the width and height, same channels: later layers see a wider area for the same cost.' },
      ];
}

function recurrenceSteps(): WalkStep[] {
  const xs = [1, 0, 0, 2];
  const a = 0.6;
  const b = 1;
  const c = 0.5;
  let h = 0;
  const rows = xs.map((x, t) => {
    const prev = h;
    h = a * h + b * x;
    return [`t=${t + 1}`, x, r(prev), `${a}×${r(prev)} + ${x}`, r(h), r(c * h)];
  });
  return [
    { title: 'A memory that travels along the sequence', text: 'A hidden state h starts at 0. At each step it fades a little (×a) and absorbs the new input (×b).', formula: 'h_t = \\bar A\\, h_{t-1} + \\bar B\\, x_t,\\quad y_t = C\\, h_t' },
    { title: 'Run it step by step', text: `With a = ${a}, b = ${b}, c = ${c}. Notice how the input at t=1 is still felt at t=3.`, table: { cols: ['step', 'input x', 'h before', 'update', 'h after', 'output y'], rows } },
    { title: 'Selectivity (Mamba / LSTM gates)', text: 'In Mamba and LSTMs, a and b are not fixed: each input decides them. A word like “not” can choose to be remembered for a long time; filler words can be forgotten quickly.' },
    { title: 'Result', text: 'One output per input step, each depending on everything before it — with a fixed-size memory, so cost grows only linearly with length.' },
  ];
}

function embeddingSteps(tokens: string[]): WalkStep[] {
  const toks = tokens.slice(0, 3);
  const ids = toks.map((t) => (Array.from(t).reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) % 50000, 7) as number));
  const rows = ids.map((id) => [0, 1, 2, 3].map((k) => r(Math.sin(id * (k + 1) * 0.37), 2)));
  return [
    { title: 'Text becomes token ids', text: 'The tokenizer turns each word-piece into an integer from the vocabulary (ids below are illustrative).', table: { cols: ['token', 'id'], rows: toks.map((t, i) => [t, ids[i]]) } },
    { title: 'Each id selects one row of a big table', text: 'The embedding table has one learned row per vocabulary entry. Looking up an id = copying its row (4 numbers shown; 768–7,168 in real models).', table: { cols: ['token', 'id', 'row (first 4 numbers)'], rows: toks.map((t, i) => [t, ids[i], vec(rows[i])]) }, formula: 'x_t = E[\\text{id}_t]' },
    { title: 'Stack the rows', text: `The sentence becomes a matrix: ${toks.length} tokens × d numbers. That matrix is what every later layer works on.` },
    { title: 'Result', text: 'Integers in, dense vectors out. Training moves the rows so that tokens used in similar ways end up near each other.' },
  ];
}

function posSteps(): WalkStep[] {
  const pe = [0, 1, 2].map((pos) => [Math.sin(pos), Math.cos(pos), Math.sin(pos / 100), Math.cos(pos / 100)]);
  return [
    { title: 'Attention alone is order-blind', text: '“dog bites man” and “man bites dog” would look identical without position information.' },
    { title: 'A signature for every position', text: 'Each position gets a distinctive pattern of numbers (here: sine/cosine waves of different speeds).', table: { cols: ['position', 'signature (4 numbers)'], rows: pe.map((v, i) => [i, vec(v)]) }, formula: 'PE_{pos,2i} = \\sin(pos / 10000^{2i/d})' },
    { title: 'Combine with the token vectors', text: 'Added to (or, with RoPE, used to rotate) each token’s vector, so the same word at a different position looks different.' },
    { title: 'Result', text: 'Same shape; every vector now also encodes where it sits in the sequence.' },
  ];
}

function softmaxSteps(): WalkStep[] {
  const z = [3.1, 2.2, 0.4, -1];
  const names = ['“on”', '“under”', '“near”', '“purple”'];
  const p = softmax(z);
  return [
    { title: 'Raw scores (logits)', text: 'The previous layer gives one score per option. They can be any size or sign.', table: { cols: ['option', 'logit'], rows: names.map((n, i) => [n, z[i]]) } },
    { title: 'Exponentiate and normalise', text: 'e^z makes everything positive; dividing by the sum makes them add up to 1.', table: { cols: ['option', 'e^z', 'probability'], rows: names.map((n, i) => [n, r(Math.exp(z[i])), `${r(p[i] * 100, 1)}%`]) }, formula: 'p_i = e^{z_i} / \\sum_j e^{z_j}' },
    { title: 'Result', text: `The model is ${r(p[0] * 100, 0)}% confident in ${names[0]}. During training, cross-entropy = −log(probability of the right answer).` },
  ];
}

function residualSteps(): WalkStep[] {
  const x = [1, 2, 3];
  const f = [0.2, -0.5, 0.1];
  return [
    { title: 'Two inputs: the original and the update', text: `x (the stream so far) = ${vec(x)}; F(x) (what the block computed) = ${vec(f)}.` },
    { title: 'Add them', text: `y = x + F(x) = ${vec(x.map((v, i) => v + f[i]))}. The block only has to learn a small correction.`, formula: 'y = x + F(x)' },
    { title: 'Why it matters', text: 'Gradients flow straight through the “+”, so very deep stacks still train. If the block is useless, F ≈ 0 and nothing is harmed.' },
  ];
}

function routerSteps(): WalkStep[] {
  const scores = [2.1, 1.4, -0.3, 0.2];
  const p = softmax(scores);
  const top = [...p.keys()].sort((a, b) => p[b] - p[a]).slice(0, 2);
  const tot = top.reduce((s, i) => s + p[i], 0);
  return [
    { title: 'Score every expert', text: 'A tiny linear layer gives the token one score per expert.', table: { cols: ['expert', 'score', 'softmax'], rows: scores.map((s, i) => [`E${i + 1}`, s, `${r(p[i] * 100, 0)}%`]) } },
    { title: 'Keep the top-k', text: `Only the best ${top.length} run: ${top.map((i) => `E${i + 1}`).join(' and ')}. Their weights are renormalised to sum to 1.`, table: { cols: ['expert', 'gate weight'], rows: top.map((i) => [`E${i + 1}`, r(p[i] / tot)]) }, formula: 'g = \\mathrm{TopK}(\\mathrm{softmax}(xW_g))' },
    { title: 'Result', text: 'The token is processed by just 2 of the experts; the others stay idle (shown grey in 3D). Big capacity, small cost.' },
  ];
}

function reshapeSteps(op: string): WalkStep[] {
  return [
    { title: 'Same numbers, new arrangement', text: op === 'patch_tokens' ? 'A 14×14 grid of patch vectors is read row by row into a list of 196 tokens.' : op === 'cls_token' ? 'One extra learned vector is put in front of the sequence; it will collect a summary of everything.' : op === 'select_token' ? 'Only the first token’s vector is kept — the summary of the whole input.' : 'A (C, 1, 1) map is flattened into a plain C-length vector.' },
    { title: 'Result', text: 'No arithmetic on the values (except adding the [CLS] vector) — this step only changes the shape so the next layer can use it.' },
  ];
}

function activationSteps(): WalkStep[] {
  const x = [-2, -0.5, 0, 0.8, 3];
  const sig = (v: number) => 1 / (1 + Math.exp(-v));
  return [
    { title: 'Values arrive from the layer before', text: `Some negative, some positive: ${vec(x)}.` },
    {
      title: 'Apply the same simple curve to every number',
      text: 'Each value is reshaped on its own. ReLU zeroes negatives; sigmoid squashes into (0, 1); GELU is a smooth ReLU.',
      table: { cols: ['input', 'ReLU', 'sigmoid', 'GELU'], rows: x.map((v) => [v, r(Math.max(0, v)), r(sig(v)), r(gelu(v))]) },
      formula: '\\mathrm{ReLU}(x)=\\max(0,x)',
    },
    { title: 'Why this matters', text: 'Without this bend, stacking layers would still be one straight-line (linear) function. The non-linearity is what lets depth learn curves, edges and concepts.' },
    { title: 'Result', text: 'Same shape in and out; weak or negative evidence is silenced, strong evidence passes on.' },
  ];
}

function dropoutSteps(): WalkStep[] {
  const x = [2, 4, 6, 8];
  const keep = [true, false, true, false];
  return [
    { title: 'During training, randomly switch some values off', text: `With p = 0.5, about half are zeroed. Input: ${vec(x)}.` },
    { title: 'Scale the survivors up', text: 'Kept values are divided by (1 − p) = 0.5, so the expected total stays the same.', table: { cols: ['value', 'kept?', 'output'], rows: x.map((v, i) => [v, keep[i] ? 'yes' : 'dropped', keep[i] ? v * 2 : 0]) }, formula: 'y = m \\odot x / (1-p)' },
    { title: 'At inference: nothing happens', text: 'When the model is used for real, dropout is switched off and values pass through unchanged.' },
  ];
}

/** Pick the right worked example for a graph op. */
export function walkthroughFor(op: string, params: Record<string, any>, tokens: string[]): WalkStep[] {
  switch (op) {
    case 'linear':
    case 'qkv':
    case 'ssm_params':
    case 'gcn_conv':
      return linearSteps(op === 'qkv' ? 'q' : 'y');
    case 'lm_head':
      return [...linearSteps('logit').slice(0, 3), ...softmaxSteps().slice(1)];
    case 'attention':
    case 'sdpa':
    case 'similarity':
      return attentionSteps(!!params.causal, params.kind === 'cross');
    case 'ffn':
    case 'expert':
      return ffnSteps(params.kind ?? 'swiglu');
    case 'norm':
      return normSteps(params.kind ?? 'layer');
    case 'conv2d':
    case 'double_conv':
    case 'resnet_stage':
    case 'conv1d':
    case 'unet_block':
      return convSteps();
    case 'pool':
    case 'upsample':
    case 'up_conv':
      return poolSteps(params.kind === 'global');
    case 'ssm_scan':
    case 'rnn':
    case 'ssm_discretize':
      return recurrenceSteps();
    case 'embedding':
      return embeddingSteps(tokens.length ? tokens : ['The', 'cat', 'sat']);
    case 'posenc':
    case 'timestep_embed':
      return posSteps();
    case 'softmax':
      return softmaxSteps();
    case 'activation':
      return activationSteps();
    case 'dropout':
      return dropoutSteps();
    case 'add':
    case 'moe_combine':
    case 'multiply':
    case 'reparam':
    case 'denoise':
    case 'concat':
      return residualSteps();
    case 'router':
      return routerSteps();
    case 'patch_tokens':
    case 'cls_token':
    case 'select_token':
    case 'flatten':
      return reshapeSteps(op);
    default:
      return [];
  }
}

/** Plain-language meaning of a tensor dimension symbol. */
export function dimMeaning(sym: string, index: number, rank: number): string {
  const s = sym.toLowerCase();
  if (s === 'b') return 'examples processed together (batch)';
  if (['t', 's', 'm', 'ctx_len', 'n_tokens'].includes(s) || s.includes('seq')) return 'tokens in the sequence';
  if (s.includes('vocab')) return 'possible next tokens (vocabulary)';
  if (s.includes('head') && s.includes('dim')) return 'numbers per attention head';
  if (s.includes('heads')) return 'attention heads working in parallel';
  if (s.includes('d_ff') || s.includes('hidden') || s.includes('expert')) return 'hidden features inside the block';
  if (s.includes('d_model') || s.includes('width') || s === 'd' || s.includes('embed') || s.includes('d_inner')) return 'numbers describing each token (features)';
  if (s === 'h' || s.startsWith('h/') || s.includes('·h')) return 'pixels tall';
  if (s === 'w' || s.startsWith('w/')) return 'pixels wide';
  if (s.includes('topk') || s.includes('top_k')) return 'experts chosen per token';
  if (s.includes('class')) return 'possible classes';
  if (s === 'n') return 'nodes in the graph';
  if (s.includes('mels')) return 'frequency bands';
  if (s.includes('frames')) return 'audio time steps';
  if (s.includes('·')) return 'positions (flattened grid of patches)';
  if (rank === 4 && index === 1) return 'channels (feature maps)';
  if (rank === 4 && index === 2) return 'height';
  if (rank === 4 && index === 3) return 'width';
  if (index === rank - 1) return 'features per position';
  return 'size of this axis';
}
