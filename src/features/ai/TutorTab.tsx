import React, { useMemo, useRef, useState } from 'react';
import { KeyRound, Send, Square, Trash2, Loader2 } from 'lucide-react';
import type { Architecture } from '../../types/architecture';
import { useAppStore } from '../../store/useAppStore';
import { AI_MODELS, DEFAULT_MODEL, aiErrorMessage, streamTutor, type ChatTurn } from './openai';
import { track } from '../../lib/track';

/** API key + model, shared by the tutor and live runs. Stored only in this browser. */
const AiSettings: React.FC = () => {
  const apiKey = useAppStore((s) => s.prefs.apiKey ?? '');
  const model = useAppStore((s) => s.prefs.aiModel ?? DEFAULT_MODEL);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const [draft, setDraft] = useState('');
  if (!apiKey)
    return (
      <div className="space-y-2">
        <p className="text-[11px] text-[#534a43] leading-relaxed">
          Uses <b>ChatGPT</b> with <b>your own OpenAI API key</b>. It stays in this browser and is sent only to api.openai.com. You pay OpenAI for your usage.
        </p>
        <div className="flex gap-1.5">
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value.trim())}
            placeholder="sk-…"
            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-[rgba(117,91,70,0.2)] text-xs font-mono outline-none focus:border-[#eb7c6b]"
            aria-label="OpenAI API key"
          />
          <button onClick={() => draft && setPrefs({ apiKey: draft })} disabled={!draft} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2f2a27] text-white text-[11px] font-semibold disabled:opacity-40">
            <KeyRound className="w-3.5 h-3.5" /> Save
          </button>
        </div>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#eb7c6b] underline">
          Get an API key →
        </a>
      </div>
    );
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-[#8d847c]">
      <select value={model} onChange={(e) => setPrefs({ aiModel: e.target.value })} className="flex-1 min-w-0 px-1.5 py-1 rounded-lg border border-[rgba(117,91,70,0.2)] bg-white text-[10px] text-[#2f2a27]" aria-label="ChatGPT model">
        {AI_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <button onClick={() => setPrefs({ apiKey: undefined })} className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-rose-50 hover:text-rose-600" title="Forget the API key in this browser">
        <Trash2 className="w-3 h-3" /> key
      </button>
    </div>
  );
};

/** Architecture grounding for the tutor: its layers, tour, shapes and key facts. */
function tutorSystem(a: Architecture): string {
  const parts = a.components.map((c, i) => `${i + 1}. ${c.name}: ${c.description} (in ${c.inputTensor.numericalExample} → out ${c.outputTensor.numericalExample})`).join('\n');
  const tour = a.dataFlowSteps.map((s) => `${s.stepIndex}. ${s.title}: ${s.description}`).join('\n');
  const facts = `${a.keyFacts.paramCount} parameters · ${a.keyFacts.primaryUse} · ${a.keyFacts.inventedYear} · ${a.keyFacts.keyInnovations}`;
  return [
    'You are the friendly tutor inside NeuralDecode 3D, an interactive 3D course that opens up neural-network architectures layer by layer.',
    `The learner is looking at “${a.name}” (${a.categoryName}).`,
    `Summary: ${a.description}`,
    `Key facts: ${facts}`,
    `Layers in the 3D model, with tensor shapes:\n${parts}`,
    tour ? `The guided tour they can play, step by step:\n${tour}` : '',
    'Answer clearly and concisely for a learner (short paragraphs or bullets, ≤150 words unless they ask for more). Refer to the layers and tour steps by name when useful, and use the real tensor shapes. If the question is outside this architecture, answer briefly and suggest what to explore next.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** “Ask” tab: a streaming ChatGPT tutor grounded in the current topic. */
export const TutorTab: React.FC<{ architecture: Architecture }> = ({ architecture }) => {
  const apiKey = useAppStore((s) => s.prefs.apiKey);
  const aiModel = useAppStore((s) => s.prefs.aiModel ?? DEFAULT_MODEL);
  const [chats, setChats] = useState<Record<string, ChatTurn[]>>({});
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const id = architecture.id;
  const history = chats[id] ?? [];
  const system = useMemo(() => tutorSystem(architecture), [architecture]);
  const suggestions = [`Explain ${architecture.name} in simple words`, 'Why does the tensor shape change here?', 'What breaks if a layer is missing?'];

  const ask = async (q: string) => {
    if (!apiKey || !q.trim() || busy) return;
    setError(null);
    setInput('');
    const next: ChatTurn[] = [...history, { role: 'user', content: q.trim() }, { role: 'assistant', content: '' }];
    setChats((c) => ({ ...c, [id]: next }));
    setBusy(true);
    track('tutor_asked', { arch: id });
    abort.current = new AbortController();
    try {
      await streamTutor({
        apiKey,
        model: aiModel,
        system,
        history: next.slice(0, -1),
        signal: abort.current.signal,
        onDelta: (d) =>
          setChats((c) => {
            const h = [...(c[id] ?? [])];
            h[h.length - 1] = { role: 'assistant', content: h[h.length - 1].content + d };
            return { ...c, [id]: h };
          }),
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError(aiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <AiSettings />
      {apiKey && (
        <>
          <div className="max-h-[30vh] overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {history.length === 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="px-2 py-1 rounded-full text-[10px] bg-white border border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b] text-left">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {history.map((t, i) => (
              <div key={i} className={`rounded-xl px-2.5 py-1.5 text-[11.5px] leading-relaxed whitespace-pre-wrap select-text ${t.role === 'user' ? 'bg-[#3FA7C9]/10 text-[#2f2a27] ml-6' : 'bg-white border border-[rgba(117,91,70,0.12)] text-[#2f2a27] mr-2'}`}>
                {t.content || (busy && i === history.length - 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8d847c]" /> : '')}
              </div>
            ))}
            {error && <p className="text-[11px] text-rose-600">{error}</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-1.5"
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask about ${architecture.name}…`} className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl border border-[rgba(117,91,70,0.2)] text-xs outline-none focus:border-[#eb7c6b]" />
            {busy ? (
              <button type="button" onClick={() => abort.current?.abort()} className="p-2 rounded-xl bg-rose-500 text-white" title="Stop">
                <Square className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="p-2 rounded-xl bg-[#eb7c6b] text-white disabled:opacity-40" title="Ask">
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
};
