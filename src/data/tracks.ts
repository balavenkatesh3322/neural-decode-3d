/** The curriculum as 5 tracks. Core architectures unlock the track certificate; deep dives are optional. */
export interface Track {
  id: number;
  name: string;
  short: string;
  color: string;
  blurb: string;
  core: string[];
  deep: string[];
}

export const TRACKS: Track[] = [
  { id: 1, name: 'Neural Network Foundations', short: 'Foundations', color: '#4E9F6B', blurb: 'Neurons, layers, convolutions and recurrence: the building blocks every model reuses.', core: ['mlp', 'cnn', 'lstm'], deep: ['gcn'] },
  { id: 2, name: 'Transformers & LLMs', short: 'Transformers', color: '#eb7c6b', blurb: 'Attention, from the original encoder–decoder to GPT, BERT and Llama.', core: ['transformer-full', 'transformer', 'gpt2', 'bert'], deep: [] },
  { id: 3, name: 'Vision & Multimodal', short: 'Vision', color: '#3FA7C9', blurb: 'Seeing and hearing: ViT, U-Net, CLIP and Whisper.', core: ['vit', 'unet', 'clip'], deep: ['whisper'] },
  { id: 4, name: 'Generative Models', short: 'Generative', color: '#8B6BD6', blurb: 'Models that create: autoencoders, GANs and diffusion.', core: ['vae', 'gan', 'diffusion'], deep: [] },
  { id: 5, name: 'Frontier & Efficient', short: 'Frontier', color: '#E3A23B', blurb: 'Scaling tricks behind today’s biggest models: experts, state spaces and MLA.', core: ['moe', 'mamba', 'deepseek'], deep: [] },
];

export const trackOfArch = (id: string) => TRACKS.find((t) => t.core.includes(id) || t.deep.includes(id));
