/// <reference lib="webworker" />
import { AutoTokenizer, AutoModelForCausalLM, env, type PreTrainedTokenizer, type PreTrainedModel } from '@huggingface/transformers';

/**
 * Runs a real language model off the main thread.
 * - predict:  DistilGPT-2 (~85 MB quantized, downloaded once on request) → next-token probabilities
 */
env.allowLocalModels = false;

const MODEL = 'Xenova/distilgpt2';
let tokenizer: Promise<PreTrainedTokenizer> | null = null;
let model: Promise<PreTrainedModel> | null = null;

const post = (msg: unknown) => (self as unknown as Worker).postMessage(msg);

const getTokenizer = () => (tokenizer ??= AutoTokenizer.from_pretrained(MODEL));
const getModel = () =>
  (model ??= AutoModelForCausalLM.from_pretrained(MODEL, {
    dtype: 'q8',
    progress_callback: (p: any) => {
      if (p.status === 'progress' && p.file?.endsWith('.onnx')) post({ type: 'progress', loaded: p.loaded, total: p.total });
    },
  }));

function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (const v of logits) if (v > max) max = v;
  const out = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) sum += out[i] = Math.exp(logits[i] - max);
  for (let i = 0; i < out.length; i++) out[i] /= sum;
  return out;
}

self.onmessage = async (e: MessageEvent) => {
  const { id, text } = e.data as { id: number; type: 'predict'; text: string };
  try {
    const tok = await getTokenizer();
    const ids: number[] = Array.from(tok.encode(text));
    const pieces = ids.map((i) => tok.decode([i]));

    const lm = await getModel();
    const inputs = tok(text);
    const out: any = await lm(inputs);
    const [, seq, vocab] = out.logits.dims as number[];
    const last = (out.logits.data as Float32Array).slice((seq - 1) * vocab, seq * vocab);
    const probs = softmax(last);
    const top = Array.from(probs.keys())
      .sort((a, b) => probs[b] - probs[a])
      .slice(0, 8)
      .map((i) => ({ id: i, token: tok.decode([i]), p: probs[i], logit: last[i] }));
    post({ id, type: 'prediction', ids, pieces, top, vocab });
  } catch (err) {
    post({ id, type: 'error', message: (err as Error).message ?? String(err) });
  }
};
