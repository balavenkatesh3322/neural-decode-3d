import type { GraphEdge, GraphSpec, OpNode } from '../../engine/spec/schema';
import { transformerLayer } from './blocks';

const attnLesson = (who: string): OpNode['lesson'] => ({
  title: `${who} self-attention`,
  description: 'Every token builds a query, compares it with every other token’s key, and mixes their values by those scores — across several heads at once.',
  eli5: 'Each word looks around the sentence for the words that help explain it.',
});
const ffnLesson: OpNode['lesson'] = {
  title: 'MLP block',
  description: 'Each token is expanded 4× wider, passed through GELU, and projected back. Most of the model’s factual knowledge is stored in these weights.',
  eli5: 'Each word visits the library and comes back knowing more.',
};

// ---------------------------------------------------------------------------
// GPT-2 small (124M)
// ---------------------------------------------------------------------------
const gptLayer = transformerLayer({ p: 'b', group: 'block', input: 'drop', heads: 'n_heads', ff: 'd_ff', causal: true, bias: true, lessons: { attn: attnLesson('Masked'), ffn: ffnLesson } });
export const gpt2Spec: GraphSpec = {
  meta: {
    name: 'GPT-2',
    subtitle: 'The decoder-only language model that started it all',
    category: 'llm',
    badge: 'GPT-2 small · 124M',
    description: 'A stack of masked self-attention blocks trained to predict the next token. Learned position embeddings, pre-LayerNorm, GELU MLPs, and an output head tied to the input embedding.',
    year: '2019 (Radford et al., OpenAI)',
    primaryUse: 'Text generation, the template for GPT-3/4, Llama, Mistral…',
    innovations: 'Pre-norm blocks, zero-shot task transfer from pure next-token prediction',
    paperTitle: 'Language Models are Unsupervised Multitask Learners',
    paperUrl: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf',
    sampleInput: '“The cat sat on the”',
  },
  config: { B: 1, T: 8, vocab: 50257, ctx: 1024, d_model: 768, n_heads: 12, d_ff: '4 * d_model', n_layers: 12 },
  controls: [
    { key: 'T', label: 'Sequence length', min: 2, max: 16, step: 1 },
    { key: 'd_model', label: 'Width d_model', min: 256, max: 1600, options: [256, 512, 768, 1024, 1280, 1600] },
    { key: 'n_heads', label: 'Heads', min: 4, max: 25, options: [4, 8, 12, 16, 20, 25] },
    { key: 'n_layers', label: 'Layers (small→XL: 12/24/36/48)', min: 1, max: 48, step: 1 },
  ],
  sampleTokens: ['The', 'cat', 'sat', 'on', 'the', 'mat', 'and', 'purred'],
  groups: [{ id: 'block', label: 'Transformer Block', repeat: 'n_layers', color: '#8B6BD6' }],
  nodes: [
    { id: 'tokens', op: 'input', label: 'BPE token IDs', params: { shape: ['B', 'T'] } },
    { id: 'wte', op: 'embedding', label: 'Token embedding (wte)', params: { vocab: 'vocab', dim: 'd_model' }, lesson: { title: 'Token embedding', description: 'Each of 50,257 byte-pair tokens has a learned 768-number vector.', eli5: 'Every word-piece gets its own coordinates.' } },
    { id: 'wpe', op: 'posenc', label: 'Position embedding (wpe)', params: { kind: 'learned', max: 'ctx' }, lesson: { title: 'Learned positions', description: 'A second table adds a learned vector for each position 0…1023, so the model knows word order.', eli5: 'Seat numbers for every word.' } },
    { id: 'drop', op: 'dropout', label: 'Dropout' },
    ...gptLayer.nodes,
    { id: 'ln_f', op: 'norm', label: 'Final LayerNorm' },
    { id: 'head', op: 'lm_head', label: 'LM head (tied to wte)', params: { vocab: 'vocab', tied: true }, lesson: { title: 'Next-token head', description: 'The final vector is multiplied by the (shared) embedding matrix to score all 50,257 tokens. Weight tying saves 38M parameters.', eli5: 'Which word-piece comes next?' } },
    { id: 'probs', op: 'softmax', label: 'Next-token probabilities' },
  ],
  edges: [
    { from: 'tokens', to: 'wte' },
    { from: 'wte', to: 'wpe' },
    { from: 'wpe', to: 'drop' },
    ...gptLayer.edges,
    { from: gptLayer.last, to: 'ln_f' },
    { from: 'ln_f', to: 'head' },
    { from: 'head', to: 'probs' },
  ],
};

// ---------------------------------------------------------------------------
// BERT-base (110M)
// ---------------------------------------------------------------------------
const bertLayer = transformerLayer({ p: 'e', group: 'enc', input: 'emb_ln', heads: 'n_heads', ff: 'd_ff', preNorm: false, bias: true, lessons: { attn: { title: 'Bidirectional self-attention', description: 'No causal mask: every token sees both its left and right context. That is why BERT is great at understanding, but cannot generate left-to-right.', eli5: 'Read the whole sentence at once, in both directions.' }, ffn: ffnLesson } });
export const bertSpec: GraphSpec = {
  meta: {
    name: 'BERT',
    subtitle: 'Bidirectional encoder for understanding text',
    category: 'llm',
    badge: 'BERT-base · 110M',
    description: 'An encoder-only transformer pre-trained by filling in masked words. Its [CLS] vector and token vectors power search, classification and question answering.',
    year: '2018 (Devlin et al., Google)',
    primaryUse: 'Search ranking, classification, NER, embeddings',
    innovations: 'Masked-language-model pre-training; bidirectional context',
    paperTitle: 'BERT: Pre-training of Deep Bidirectional Transformers',
    paperUrl: 'https://arxiv.org/abs/1810.04805',
    sampleInput: '“[CLS] the cat [MASK] on the mat [SEP]”',
  },
  config: { B: 1, T: 8, vocab: 30522, max_pos: 512, d_model: 768, n_heads: 12, d_ff: '4 * d_model', n_layers: 12 },
  controls: [
    { key: 'T', label: 'Sequence length', min: 2, max: 16, step: 1 },
    { key: 'd_model', label: 'Hidden size', min: 128, max: 1024, options: [128, 256, 512, 768, 1024] },
    { key: 'n_layers', label: 'Layers (base 12 / large 24)', min: 1, max: 24, step: 1 },
  ],
  sampleTokens: ['[CLS]', 'the', 'cat', '[MASK]', 'on', 'the', 'mat', '[SEP]'],
  groups: [{ id: 'enc', label: 'Encoder Layer', repeat: 'n_layers', color: '#3FA7C9' }],
  nodes: [
    { id: 'tokens', op: 'input', label: 'WordPiece IDs', params: { shape: ['B', 'T'] } },
    { id: 'tok', op: 'embedding', label: 'Token embedding', params: { vocab: 'vocab', dim: 'd_model' } },
    { id: 'pos', op: 'posenc', label: 'Position embedding', params: { kind: 'learned', max: 'max_pos' } },
    { id: 'seg', op: 'posenc', label: 'Segment (A/B) embedding', params: { kind: 'learned', max: 2 }, lesson: { title: 'Three embeddings summed', description: 'Token + position + segment (sentence A or B) embeddings are added together.', eli5: 'What word, where it sits, and which sentence it belongs to.' } },
    { id: 'emb_ln', op: 'norm', label: 'LayerNorm' },
    ...bertLayer.nodes,
    { id: 'cls', op: 'select_token', label: 'Take [CLS]', lesson: { title: '[CLS] summary', description: 'The first token’s final vector summarises the whole input for classification tasks.', eli5: 'The class representative speaks for everyone.' } },
    { id: 'pooler', op: 'linear', label: 'Pooler', params: { out: 'd_model', bias: true } },
    { id: 'tanh', op: 'activation', label: 'tanh' },
  ],
  edges: [
    { from: 'tokens', to: 'tok' },
    { from: 'tok', to: 'pos' },
    { from: 'pos', to: 'seg' },
    { from: 'seg', to: 'emb_ln' },
    ...bertLayer.edges,
    { from: bertLayer.last, to: 'cls' },
    { from: 'cls', to: 'pooler' },
    { from: 'pooler', to: 'tanh' },
  ],
};

// ---------------------------------------------------------------------------
// ViT-B/16 (86M)
// ---------------------------------------------------------------------------
const vitLayer = transformerLayer({ p: 'v', group: 'enc', input: 'pos', heads: 'n_heads', ff: 'd_ff', bias: true, lessons: { attn: { title: 'Patch self-attention', description: 'Every patch attends to every other patch — even ones far apart — from the very first layer. CNNs need many layers to see that far.', eli5: 'Every puzzle piece can look at every other piece at once.' }, ffn: ffnLesson } });
export const vitSpec: GraphSpec = {
  meta: {
    name: 'Vision Transformer',
    subtitle: 'An image is worth 16×16 words',
    category: 'vision',
    badge: 'ViT-B/16 · 86M',
    description: 'Cuts an image into 16×16 patches, treats each patch as a token, and runs a standard transformer encoder. A [CLS] token gathers the answer.',
    year: '2020 (Dosovitskiy et al., Google)',
    primaryUse: 'Image classification, the vision tower of CLIP and multimodal LLMs',
    innovations: 'Pure transformer on image patches, no convolutions after the stem',
    paperTitle: 'An Image is Worth 16x16 Words',
    paperUrl: 'https://arxiv.org/abs/2010.11929',
  },
  config: { B: 1, H: 224, W: 224, patch: 16, N: '(H / patch) * (W / patch)', d_model: 768, n_heads: 12, d_ff: '4 * d_model', n_layers: 12, classes: 1000 },
  controls: [
    { key: 'patch', label: 'Patch size', min: 8, max: 32, options: [8, 14, 16, 32] },
    { key: 'H', label: 'Image size', min: 112, max: 448, options: [112, 224, 336, 448] },
    { key: 'd_model', label: 'Width (S 384 / B 768 / L 1024)', min: 192, max: 1280, options: [192, 384, 768, 1024, 1280] },
    { key: 'n_layers', label: 'Layers', min: 1, max: 32, step: 1 },
  ],
  groups: [{ id: 'enc', label: 'Encoder Block', repeat: 'n_layers', color: '#3FA7C9' }],
  nodes: [
    { id: 'img', op: 'input', label: 'Image', params: { shape: ['B', 3, 'H', 'W'] } },
    { id: 'patchify', op: 'conv2d', label: 'Patch embed (16×16 conv, stride 16)', params: { out: 'd_model', k: 'patch', stride: 'patch', pad: 0, bias: true }, lesson: { title: 'Patchify', description: 'A convolution with kernel = stride = 16 cuts the 224×224 image into a 14×14 grid of patches and projects each to a 768-d vector.', eli5: 'Chop the photo into 196 little stamps.' } },
    { id: 'tokens', op: 'patch_tokens', label: 'Grid → sequence', lesson: { title: 'Patches become tokens', description: 'The 14×14 grid is flattened into a sequence of 196 tokens — from here on it is just a transformer.', eli5: 'Line the stamps up like words in a sentence.' } },
    { id: 'cls', op: 'cls_token', label: 'Prepend [CLS]' },
    { id: 'pos', op: 'posenc', label: 'Learned position embedding', params: { kind: 'learned', max: 'N + 1' } },
    ...vitLayer.nodes,
    { id: 'ln', op: 'norm', label: 'LayerNorm' },
    { id: 'take', op: 'select_token', label: 'Take [CLS]' },
    { id: 'head', op: 'linear', label: 'Classifier head', params: { out: 'classes', bias: true }, lesson: { title: 'Classification', description: 'The [CLS] vector is mapped to 1,000 ImageNet class scores.', eli5: 'Is it a cat, a dog, or a teapot?' } },
  ],
  edges: [
    { from: 'img', to: 'patchify' },
    { from: 'patchify', to: 'tokens' },
    { from: 'tokens', to: 'cls' },
    { from: 'cls', to: 'pos' },
    ...vitLayer.edges,
    { from: vitLayer.last, to: 'ln' },
    { from: 'ln', to: 'take' },
    { from: 'take', to: 'head' },
  ],
};

// ---------------------------------------------------------------------------
// CLIP ViT-B/32 (151M)
// ---------------------------------------------------------------------------
const clipImg = transformerLayer({ p: 'iv', group: 'vis', input: 'ln_pre', heads: 'v_heads', ff: 'v_ff', bias: true });
const clipTxt = transformerLayer({ p: 'tx', group: 'txt', input: 't_pos', heads: 't_heads', ff: 't_ff', causal: true, bias: true });
export const clipSpec: GraphSpec = {
  meta: {
    name: 'CLIP',
    subtitle: 'Matching images with captions',
    category: 'multimodal',
    badge: 'CLIP ViT-B/32 · 151M',
    description: 'Two towers — an image transformer and a text transformer — map photos and captions into the same space. Training pulls matching pairs together and pushes others apart.',
    year: '2021 (Radford et al., OpenAI)',
    primaryUse: 'Zero-shot classification, image search, the text encoder of diffusion models',
    innovations: 'Contrastive pre-training on 400M image–text pairs',
    paperTitle: 'Learning Transferable Visual Models From Natural Language Supervision',
    paperUrl: 'https://arxiv.org/abs/2103.00020',
  },
  config: { B: 4, H: 224, W: 224, patch: 32, N: '(H / patch) * (W / patch)', v_width: 768, v_heads: 12, v_ff: '4 * v_width', v_layers: 12, T: 77, vocab: 49408, t_width: 512, t_heads: 8, t_ff: '4 * t_width', t_layers: 12, embed: 512 },
  controls: [
    { key: 'B', label: 'Batch (pairs)', min: 2, max: 12, step: 1 },
    { key: 'embed', label: 'Shared embedding size', min: 128, max: 1024, options: [128, 256, 512, 768, 1024] },
    { key: 'v_layers', label: 'Image layers', min: 1, max: 24, step: 1 },
    { key: 't_layers', label: 'Text layers', min: 1, max: 24, step: 1 },
  ],
  groups: [
    { id: 'vis', label: 'Image transformer', repeat: 'v_layers', color: '#3FA7C9' },
    { id: 'txt', label: 'Text transformer', repeat: 't_layers', color: '#E0876A' },
  ],
  nodes: [
    { id: 'img', op: 'input', label: 'Images', params: { shape: ['B', 3, 'H', 'W'] } },
    { id: 'patchify', op: 'conv2d', label: 'Patch embed 32×32', params: { out: 'v_width', k: 'patch', stride: 'patch', pad: 0 } },
    { id: 'i_tokens', op: 'patch_tokens', label: 'Grid → sequence' },
    { id: 'i_cls', op: 'cls_token', label: 'Prepend [CLS]' },
    { id: 'i_pos', op: 'posenc', label: 'Position embedding', params: { kind: 'learned', max: 'N + 1' } },
    { id: 'ln_pre', op: 'norm', label: 'LayerNorm (pre)' },
    ...clipImg.nodes,
    { id: 'ln_post', op: 'norm', label: 'LayerNorm (post)' },
    { id: 'i_take', op: 'select_token', label: 'Take [CLS]' },
    { id: 'i_proj', op: 'linear', label: 'Image projection', params: { out: 'embed' }, lesson: { title: 'Image embedding', description: 'The image tower’s summary is projected into the shared 512-d space and L2-normalised.', eli5: 'Each photo becomes a point on a shared map.' } },
    { id: 'text', op: 'input', label: 'Caption tokens', params: { shape: ['B', 'T'] } },
    { id: 't_emb', op: 'embedding', label: 'Token embedding', params: { vocab: 'vocab', dim: 't_width' } },
    { id: 't_pos', op: 'posenc', label: 'Position embedding', params: { kind: 'learned', max: 'T' } },
    ...clipTxt.nodes,
    { id: 'ln_final', op: 'norm', label: 'LayerNorm' },
    { id: 't_take', op: 'select_token', label: 'Take [EOS] token' },
    { id: 't_proj', op: 'linear', label: 'Text projection', params: { out: 'embed' }, lesson: { title: 'Text embedding', description: 'The caption’s end-of-text vector is projected into the same 512-d space.', eli5: 'Each caption becomes a point on the same map.' } },
    { id: 'sim', op: 'similarity', label: 'Image × Text similarity', lesson: { title: 'Contrastive matching', description: 'Every image is compared with every caption in the batch. Training maximises the diagonal (true pairs) with a symmetric cross-entropy loss; at test time you can classify an image by comparing it with captions like “a photo of a dog”.', eli5: 'Draw a line from each photo to its own caption.' } },
  ],
  edges: [
    { from: 'img', to: 'patchify' },
    { from: 'patchify', to: 'i_tokens' },
    { from: 'i_tokens', to: 'i_cls' },
    { from: 'i_cls', to: 'i_pos' },
    { from: 'i_pos', to: 'ln_pre' },
    ...clipImg.edges,
    { from: clipImg.last, to: 'ln_post' },
    { from: 'ln_post', to: 'i_take' },
    { from: 'i_take', to: 'i_proj' },
    { from: 'text', to: 't_emb' },
    { from: 't_emb', to: 't_pos' },
    ...clipTxt.edges,
    { from: clipTxt.last, to: 'ln_final' },
    { from: 'ln_final', to: 't_take' },
    { from: 't_take', to: 't_proj' },
    { from: 'i_proj', to: 'sim' },
    { from: 't_proj', to: 'sim' },
  ],
};

// ---------------------------------------------------------------------------
// Whisper base (≈73M)
// ---------------------------------------------------------------------------
const whEnc = transformerLayer({ p: 'we', group: 'enc', input: 'a_pos', heads: 'n_heads', ff: 'd_ff', bias: 'no-k', lessons: { attn: { title: 'Audio self-attention', description: 'Each 20 ms audio frame attends to every other frame of the 30-second window.', eli5: 'Every slice of sound listens to every other slice.' } } });
const whDec = transformerLayer({ p: 'wd', group: 'dec', input: 't_pos', heads: 'n_heads', ff: 'd_ff', causal: true, bias: 'no-k', cross: { from: 'ln_enc' }, lessons: { cross: { title: 'Cross-attention to audio', description: 'While writing each word, the decoder looks back at the encoded audio to find the sound it is transcribing.', eli5: 'The writer keeps glancing at the recording.' } } });
export const whisperSpec: GraphSpec = {
  meta: {
    name: 'Whisper',
    subtitle: 'Speech → text with an encoder–decoder',
    category: 'multimodal',
    badge: 'Whisper base · 74M',
    description: 'A log-mel spectrogram is downsampled by two 1-D convolutions, encoded by a transformer, and transcribed token-by-token by a decoder that cross-attends to the audio.',
    year: '2022 (Radford et al., OpenAI)',
    primaryUse: 'Speech recognition, translation, subtitles',
    innovations: 'Weakly-supervised training on 680k hours of multilingual audio',
    paperTitle: 'Robust Speech Recognition via Large-Scale Weak Supervision',
    paperUrl: 'https://arxiv.org/abs/2212.04356',
  },
  config: { B: 1, mels: 80, frames: 3000, d_model: 512, n_heads: 8, d_ff: '4 * d_model', n_layers: 6, vocab: 51865, T: 6, ctx: 448 },
  controls: [
    { key: 'd_model', label: 'Width (tiny 384 / base 512 / small 768)', min: 384, max: 1280, options: [384, 512, 768, 1024, 1280] },
    { key: 'n_layers', label: 'Layers per stack', min: 1, max: 32, step: 1 },
    { key: 'T', label: 'Tokens written so far', min: 1, max: 16, step: 1 },
  ],
  sampleTokens: ['<|en|>', 'Hello', 'world', ',', 'how', 'are'],
  groups: [
    { id: 'enc', label: 'Audio encoder block', repeat: 'n_layers', color: '#3FA7C9' },
    { id: 'dec', label: 'Text decoder block', repeat: 'n_layers', color: '#8B6BD6' },
  ],
  nodes: [
    { id: 'mel', op: 'input', label: 'Log-mel spectrogram (30 s)', params: { shape: ['B', 'mels', 'frames'] }, lesson: { title: 'Spectrogram', description: '30 seconds of audio as 80 frequency bands × 3,000 time frames (10 ms each).', eli5: 'A picture of sound: pitch going up, time going right.' } },
    { id: 'conv1', op: 'custom', label: 'Conv1D k3 + GELU', params: { out: ['B', 'd_model', 'frames'], paramCount: 80 * 512 * 3 + 512 } },
    { id: 'conv2', op: 'custom', label: 'Conv1D k3 stride 2 + GELU', params: { out: ['B', 'd_model', 'frames / 2'], paramCount: 512 * 512 * 3 + 512 }, lesson: { title: 'Downsample', description: 'A stride-2 convolution halves the time axis to 1,500 frames.', eli5: 'Squash the recording to half as many slices.' } },
    { id: 'transpose', op: 'custom', label: 'Frames → tokens', params: { out: ['B', 'frames / 2', 'd_model'] } },
    { id: 'a_pos', op: 'posenc', label: 'Sinusoidal positions (frozen table)', params: { kind: 'learned', max: 'frames / 2' } },
    ...whEnc.nodes,
    { id: 'ln_enc', op: 'norm', label: 'LayerNorm' },
    { id: 'text', op: 'input', label: 'Tokens so far', params: { shape: ['B', 'T'] } },
    { id: 't_emb', op: 'embedding', label: 'Token embedding', params: { vocab: 'vocab', dim: 'd_model' } },
    { id: 't_pos', op: 'posenc', label: 'Learned positions', params: { kind: 'learned', max: 'ctx' } },
    ...whDec.nodes,
    { id: 'ln_dec', op: 'norm', label: 'LayerNorm' },
    { id: 'head', op: 'lm_head', label: 'Next token (tied)', params: { vocab: 'vocab', tied: true }, lesson: { title: 'Transcription', description: 'Scores every token in the 51,865-token multilingual vocabulary; the best one is appended and the decoder runs again.', eli5: 'Write the next word you heard.' } },
  ],
  edges: [
    { from: 'mel', to: 'conv1' },
    { from: 'conv1', to: 'conv2' },
    { from: 'conv2', to: 'transpose' },
    { from: 'transpose', to: 'a_pos' },
    ...whEnc.edges,
    { from: whEnc.last, to: 'ln_enc' },
    { from: 'text', to: 't_emb' },
    { from: 't_emb', to: 't_pos' },
    ...whDec.edges,
    { from: whDec.last, to: 'ln_dec' },
    { from: 'ln_dec', to: 'head' },
  ] as GraphEdge[],
};
