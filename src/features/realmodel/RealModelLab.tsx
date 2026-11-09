import React, { useState } from 'react';
import { Cpu, Download, Sparkles, Boxes, AlertTriangle } from 'lucide-react';
import { useRealLM } from './useRealLM';
import { useAppStore } from '../../store/useAppStore';

const TOKEN_COLORS = ['#fde2d8', '#e3ecfb', '#e7f4e4', '#f3e3f7', '#fff1c9', '#dff3f1'];

/**
 * Real numbers, not a script: GPT-2's own tokenizer splits your text, and (opt-in)
 * DistilGPT-2 runs in your browser to score every possible next token.
 */
export const RealModelLab: React.FC<{ onShowIn3D?: () => void }> = ({ onShowIn3D }) => {
  const [text, setText] = useState('The cat sat on the');
  const { tokens, tokError, predictions, predict, status, progress, error } = useRealLM(text);
  const setLiveTokens = useAppStore((s) => s.setLiveTokens);
  const setArch = useAppStore((s) => s.setArch);
  const setOverride = useAppStore((s) => s.setOverride);

  const sendTo3D = () => {
    if (!tokens) return;
    setArch('gpt2');
    // the 3D model now uses your real token count for every shape
    setTimeout(() => {
      setOverride('T', Math.max(2, Math.min(16, tokens.ids.length)));
      setLiveTokens('gpt2', tokens.pieces.slice(0, 16));
    }, 0);
    onShowIn3D?.();
  };

  const busy = status === 'downloading' || status === 'running';

  return (
    <div className="space-y-4 font-sans">
      <div className="p-3 rounded-2xl bg-[#2f2a27] text-white text-xs flex gap-2 items-start">
        <Cpu className="w-4 h-4 text-[#f5b3a8] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-white/85">
          This tab runs a <b>real</b> model in your browser — nothing is sent to a server. Tokenization uses GPT-2’s actual byte-pair vocabulary (50,257 pieces) and works instantly, even offline. Prediction downloads DistilGPT-2 once (~85 MB) and computes real probabilities.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d847c]">Your prompt</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-sm text-[#2f2a27] outline-none focus:border-[#eb7c6b]"
          placeholder="Type anything…"
        />
      </label>

      {/* 1. tokenization */}
      <div className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2f2a27]">1 · Tokenization (real GPT-2 BPE)</span>
          <span className="text-[10px] font-mono text-[#8d847c]">{tokens ? `${tokens.ids.length} tokens` : tokError ? 'tokenizer error' : text.trim() ? 'tokenizing…' : 'type something'}</span>
        </div>
        {tokError && (
          <p className="text-[11px] text-rose-700 flex gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Tokenizer failed: {tokError}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {tokens?.pieces.map((p, i) => (
            <span key={i} className="inline-flex flex-col items-center px-1.5 py-1 rounded-lg border border-[rgba(117,91,70,0.12)]" style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}>
              <span className="font-mono text-[12px] text-[#2f2a27] whitespace-pre">{p.replace(/ /g, '·')}</span>
              <span className="font-mono text-[9px] text-[#8d847c]">{tokens.ids[i]}</span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#534a43]">
          A “·” marks a leading space — GPT-2 treats “ cat” and “cat” as different tokens. Common words are one token; rare words split into pieces.
        </p>
        {tokens && (
          <button onClick={sendTo3D} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold">
            <Boxes className="w-3.5 h-3.5" /> Show these {tokens.ids.length} tokens flowing through GPT-2 in 3D
          </button>
        )}
      </div>

      {/* 2. prediction */}
      <div className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#2f2a27]">2 · Next-token probabilities (DistilGPT-2)</span>
          <button
            onClick={predict}
            disabled={busy || !tokens}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eb7c6b] text-white text-xs font-semibold disabled:opacity-50"
          >
            {predictions || progress >= 1 ? <Sparkles className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {status === 'downloading' ? `Downloading ${Math.round(progress * 100)}%` : status === 'running' ? 'Thinking…' : predictions || progress >= 1 ? 'Predict' : 'Download & predict (85 MB)'}
          </button>
        </div>
        {status === 'downloading' && (
          <div className="h-1.5 rounded-full bg-[#f3eee5] overflow-hidden">
            <div className="h-full bg-[#eb7c6b] transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
        {error && <p className="text-[11px] text-rose-700">Model failed to run: {error}</p>}
        {predictions && (
          <div className="space-y-1">
            {predictions.map((p, i) => (
              <div key={p.id} className="grid grid-cols-[minmax(0,110px)_1fr_52px] items-center gap-2 text-xs">
                <span className="font-mono truncate text-[#2f2a27]" title={`token id ${p.id}, logit ${p.logit.toFixed(2)}`}>
                  {i === 0 ? '→ ' : ''}
                  {JSON.stringify(p.token)}
                </span>
                <div className="h-2.5 rounded-full bg-[#f3eee5] overflow-hidden">
                  <div className="h-full rounded-full bg-[#8B6BD6]" style={{ width: `${Math.max(2, p.p * 100)}%` }} />
                </div>
                <span className="font-mono text-right text-[#534a43]">{(p.p * 100).toFixed(1)}%</span>
              </div>
            ))}
            <button onClick={() => setText((t) => t + predictions[0].token)} className="mt-1 text-[11px] font-semibold text-[#eb7c6b] underline">
              Append the top token and predict again →
            </button>
          </div>
        )}
        <p className="text-[11px] text-[#534a43]">
          These are the real softmax outputs of the LM head over all 50,257 tokens — the same step shown as the last block of the 3D model.
        </p>
      </div>
    </div>
  );
};
