import { useCallback, useEffect, useRef, useState } from 'react';

export interface Prediction {
  token: string;
  p: number;
  logit: number;
  id: number;
}

let worker: Worker | null = null;
let seq = 0;
const getWorker = () => (worker ??= new Worker(new URL('./lm.worker.ts', import.meta.url), { type: 'module' }));

/**
 * GPT-2's byte-pair tokenizer (r50k_base) runs locally from a bundled vocabulary — no network,
 * no model runtime — so tokens appear instantly. Loaded on first use (~1 MB chunk).
 * It produces exactly the same ids as GPT-2 / DistilGPT-2 (e.g. "Hello world" → [15496, 995]).
 */
let bpe: Promise<typeof import('gpt-tokenizer/encoding/r50k_base')> | null = null;
export async function tokenizeGPT2(text: string): Promise<{ ids: number[]; pieces: string[] }> {
  const m = await (bpe ??= import('gpt-tokenizer/encoding/r50k_base'));
  const ids = m.encode(text);
  return { ids, pieces: ids.map((i) => m.decode([i])) };
}

function call<T>(type: 'predict', text: string, onProgress?: (f: number) => void): Promise<T> {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d.type === 'progress') {
        onProgress?.(d.total ? d.loaded / d.total : 0);
        return;
      }
      if (d.id !== id) return;
      w.removeEventListener('message', onMsg);
      if (d.type === 'error') reject(new Error(d.message));
      else resolve(d as T);
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ id, type, text });
  });
}

/** Real GPT-2 tokenization (instant after a 1 MB download) and opt-in DistilGPT-2 predictions. */
export function useRealLM(text: string) {
  const [tokens, setTokens] = useState<{ ids: number[]; pieces: string[] } | null>(null);
  const [tokError, setTokError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'running' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(text);
  latest.current = text;

  useEffect(() => {
    if (!text.trim()) {
      setTokens(null);
      return;
    }
    const t = setTimeout(() => {
      tokenizeGPT2(text)
        .then((r) => latest.current === text && (setTokens(r), setTokError(null)))
        .catch((e) => setTokError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [text]);

  const predict = useCallback(async () => {
    setError(null);
    setStatus(progress >= 1 ? 'running' : 'downloading');
    try {
      const r = await call<{ top: Prediction[] }>('predict', latest.current, (f) => {
        setProgress(f);
        if (f >= 1) setStatus('running');
      });
      setPredictions(r.top);
      setProgress(1);
      setStatus('idle');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  }, [progress]);

  return { tokens, tokError, predictions, predict, status, progress, error };
}
