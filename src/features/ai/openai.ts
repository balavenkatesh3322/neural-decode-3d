import OpenAI from 'openai';

/**
 * ChatGPT (OpenAI) tutor, browser-side with the visitor’s own API key.
 * The key lives only in this browser (localStorage) and is sent only to api.openai.com.
 */

export const AI_MODELS = [
  { id: 'gpt-5.4-mini', label: 'GPT-5.4 mini (fast, low cost)' },
  { id: 'gpt-5.4-nano', label: 'GPT-5.4 nano (cheapest)' },
  { id: 'gpt-5.5', label: 'GPT-5.5 (most capable)' },
];
export const DEFAULT_MODEL = AI_MODELS[0].id;

export const makeClient = (apiKey: string) => new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

/** Human-readable message for API failures (typed SDK errors, no string matching). */
export function aiErrorMessage(err: unknown): string {
  if (err instanceof OpenAI.AuthenticationError) return 'That API key was rejected. Check it in your OpenAI dashboard.';
  if (err instanceof OpenAI.RateLimitError) return 'Rate limited or out of credits. Wait a moment or check your OpenAI billing.';
  if (err instanceof OpenAI.NotFoundError) return 'That model is not available to your API key. Pick another model.';
  if (err instanceof OpenAI.APIConnectionError) return 'Could not reach OpenAI. Check your connection.';
  if (err instanceof OpenAI.APIError) return `OpenAI error ${err.status ?? ''}: ${err.message}`;
  return (err as Error)?.message ?? 'Something went wrong.';
}

// ─────────────────────────────── tutor ───────────────────────────────

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** Stream a tutor answer grounded in the current topic. */
export async function streamTutor(opts: {
  apiKey: string;
  model: string;
  system: string;
  history: ChatTurn[];
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const client = makeClient(opts.apiKey);
  const stream = await client.chat.completions.create(
    {
      model: opts.model,
      stream: true,
      max_completion_tokens: 4000,
      messages: [{ role: 'system', content: opts.system }, ...opts.history],
    },
    { signal: opts.signal },
  );
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) opts.onDelta(delta);
  }
}
