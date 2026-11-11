import { ALL_ARCHITECTURES } from '../../data/architectures';

export type Level = 'new' | 'user' | 'builder';

export const GOALS: { id: string; label: string; hint: string; emoji: string; archs: string[] }[] = [
  { id: 'llm', label: 'How ChatGPT-style LLMs work', hint: 'Attention, GPT, BERT, Llama, MoE', emoji: '💬', archs: ['transformer-full', 'transformer', 'gpt2', 'bert', 'moe', 'deepseek'] },
  { id: 'scratch', label: 'Deep learning from scratch', hint: 'Neurons, CNNs, RNNs, then Transformers', emoji: '🧱', archs: ['mlp', 'cnn', 'lstm', 'transformer-full', 'gpt2'] },
  { id: 'vision', label: 'Computer vision', hint: 'CNNs, ViT, U-Net, CLIP', emoji: '👁️', archs: ['mlp', 'cnn', 'vit', 'unet', 'clip'] },
  { id: 'genai', label: 'Image generation', hint: 'VAE, GAN, U-Net, Stable Diffusion', emoji: '🎨', archs: ['vae', 'gan', 'unet', 'diffusion', 'clip'] },
  { id: 'frontier', label: 'Frontier & efficient models', hint: 'Llama, MoE, Mamba, DeepSeek-V3', emoji: '🚀', archs: ['transformer', 'moe', 'mamba', 'deepseek'] },
  { id: 'multimodal', label: 'Speech, images & graphs', hint: 'CLIP, Whisper, ViT, GNNs', emoji: '🎙️', archs: ['vit', 'clip', 'whisper', 'gcn'] },
];

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'new', label: 'Brand new', hint: 'I’ve never looked inside a neural network' },
  { id: 'user', label: 'I know the basics', hint: 'Layers, training, maybe a little PyTorch' },
  { id: 'builder', label: 'I train models', hint: 'I’ve built or fine-tuned networks' },
];

export const MINUTES = [10, 20, 45];
const MIN_PER_ARCH = 12;
const INTRO = new Set(['mlp', 'cnn', 'lstm']);

/** Recommended architecture order for a level + goal. */
export function recommend(level: Level, goal: string): { path: string[]; startBasics: boolean } {
  const g = GOALS.find((x) => x.id === goal) ?? GOALS[0];
  let path = [...g.archs];
  if (level === 'new' && !path.includes('mlp')) path = ['mlp', ...path];
  if (level === 'builder') {
    const advanced = path.filter((id) => !INTRO.has(id));
    path = advanced.length >= 3 ? advanced : path;
  }
  return { path: path.filter((id) => ALL_ARCHITECTURES.some((a) => a.id === id)), startBasics: level === 'new' };
}

export const daysFor = (archs: number, minutesPerDay: number) => Math.max(1, Math.ceil((archs * MIN_PER_ARCH) / minutesPerDay));
