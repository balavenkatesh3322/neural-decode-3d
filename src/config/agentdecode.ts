/**
 * AgentDecode 3D, the sister site: generative-AI systems and agents (prompting, RAG, tool calling,
 * MCP, multi-agent workflows) shown running step by step in 3D. NeuralDecode shows what is *inside*
 * a model; AgentDecode shows how apps and agents *use* models. Links open a topic at /topic/<id>.
 */
export const AGENTDECODE_URL = 'https://agentdecode.vercel.app/';

export const adLink = (topic?: string) => (topic ? `${AGENTDECODE_URL}topic/${encodeURIComponent(topic)}` : AGENTDECODE_URL);

export interface AdRef {
  topic: string;
  name: string;
  why: string;
}

const NEXT_TOKEN: AdRef = { topic: 'next-token', name: 'Next-token prediction', why: 'Watch how a chat app turns this model’s probabilities into a full answer.' };
const KV: AdRef = { topic: 'kv-cache', name: 'KV cache', why: 'See how serving reuses the keys and values from attention to answer faster.' };
const GENAI: AdRef = { topic: 'what-is-genai', name: 'What is Generative AI?', why: 'Where generative models fit, from training data to brand-new content.' };
const EMBED: AdRef = { topic: 'embeddings', name: 'Embeddings', why: 'How encoder vectors power semantic search and RAG.' };
const VLM: AdRef = { topic: 'vision-language', name: 'Vision-language models', why: 'How an image encoder plugs into an LLM so it can “see”.' };
const ROUTING: AdRef = { topic: 'model-routing', name: 'Model routing', why: 'Routing between whole models in production, the app-level cousin of MoE.' };

/** NeuralDecode architecture → the AgentDecode topic that shows it in use. */
export const ARCH_TO_AD: Record<string, AdRef> = {
  transformer: KV,
  'transformer-full': NEXT_TOKEN,
  gpt2: { topic: 'sampling', name: 'Sampling & temperature', why: 'How the next-token probabilities become varied, creative text.' },
  bert: EMBED,
  moe: { topic: 'llm-serving', name: 'LLM serving', why: 'How sparse models like this one are served to millions of users.' },
  deepseek: ROUTING,
  mamba: { topic: 'tokens-context', name: 'Tokens & context windows', why: 'Why long contexts are expensive, and what an app does about it.' },
  cnn: VLM,
  vit: VLM,
  clip: { topic: 'multimodal-rag', name: 'Multimodal RAG', why: 'Search images and text together with CLIP-style embeddings.' },
  whisper: { topic: 'voice-agent', name: 'Voice agents', why: 'Speech-to-text, an LLM and text-to-speech wired into one live agent.' },
  gcn: { topic: 'graphrag', name: 'GraphRAG', why: 'Retrieval over a knowledge graph instead of plain text chunks.' },
  diffusion: GENAI,
  vae: GENAI,
  gan: GENAI,
  unet: GENAI,
  mlp: GENAI,
  lstm: NEXT_TOKEN,
};

/** Deep Learning Basics concept → AgentDecode topic. */
export const BASIC_TO_AD: Record<string, AdRef> = {
  tokenization: { topic: 'tokens-context', name: 'Tokens & context windows', why: 'How tokens limit and price every LLM call.' },
  embeddings: EMBED,
  attention: KV,
  sampling: { topic: 'sampling', name: 'Sampling & temperature', why: 'Temperature, top-p and why answers vary.' },
  'output-heads': NEXT_TOKEN,
  transfer: { topic: 'lora-finetuning', name: 'LoRA fine-tuning', why: 'Adapt a big pretrained model cheaply for your own task.' },
  metrics: { topic: 'llm-as-judge', name: 'LLM-as-judge evals', why: 'How LLM apps are measured when there is no single right answer.' },
  'encoder-decoder': NEXT_TOKEN,
};
