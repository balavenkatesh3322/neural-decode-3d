import React, { useMemo, useState } from 'react';
import { Brain, Globe2, FileText, Layers3, ArrowDown, Download, RotateCcw, Check, Repeat } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { storyFor } from '../../engine/story';
import { fmtCount } from '../../engine/graph/shape';
import { useAppStore } from '../../store/useAppStore';
import { playSfx } from '../audio/audio';

interface Card {
  id: string;
  front: string;
  back: string;
  component?: string;
}

function buildCards(model: ArchitectureModel): Card[] {
  const { architecture: a } = model;
  const s = storyFor(model);
  const cards: Card[] = [
    { id: 'one-liner', front: `${a.name} in one sentence?`, back: s.remember.oneLiner },
    { id: 'mnemonic', front: `Memory hook for ${a.name}?`, back: s.remember.mnemonic },
    { id: 'problems', front: `Name real problems ${a.name} solves.`, back: s.problems.map((p) => `${p.title} — ${p.example}`).join('\n') },
    { id: 'io', front: `What goes into ${a.name}, and what comes out of its last layer?`, back: `In: ${s.input.value}\nOut: ${s.output.value}\n${s.output.meaning}` },
    { id: 'size', front: `How many parameters does ${a.name} have?`, back: `${fmtCount(model.infer.totalParams)} (as configured here).` },
    ...s.remember.keyIdeas.map((k, i) => ({ id: `idea-${i}`, front: `Key idea #${i + 1} of ${a.name}?`, back: k })),
    ...a.components.map((c) => ({ id: `c-${c.id}`, front: `What does “${c.name}” do?`, back: `${c.fiveYearOldWhy}\nOutput shape: ${c.outputTensor.expression}`, component: c.id })),
    ...a.quizQuestions.map((q) => ({ id: `q-${q.id}`, front: q.question, back: `${q.options[q.correctOptionIndex]}\n${q.explanation}`, component: q.targetNodeId })),
  ];
  return cards;
}

function cheatSheetMarkdown(model: ArchitectureModel): string {
  const a = model.architecture;
  const s = storyFor(model);
  return [
    `# ${a.name} — cheat sheet`,
    '',
    `**In one sentence:** ${s.remember.oneLiner}`,
    `**Remember:** ${s.remember.mnemonic}`,
    '',
    '## Real problems it solves',
    ...s.problems.map((p) => `- **${p.title}** — ${p.example}`),
    '',
    '## Input → output',
    `- **In:** ${s.input.value}`,
    ...s.journey.map((j, i) => `${i + 1}. ${j}`),
    `- **Out:** ${s.output.value} — ${s.output.meaning}`,
    '',
    '## Key ideas',
    ...s.remember.keyIdeas.map((k) => `- ${k}`),
    '',
    '## Parts',
    ...a.components.map((c, i) => `${i + 1}. **${c.name}** \`${c.outputTensor.expression}\` — ${c.fiveYearOldWhy}`),
    '',
    `Total parameters: ${fmtCount(model.infer.totalParams)}. Introduced: ${a.keyFacts.inventedYear}.`,
  ].join('\n');
}

/** Everything needed to understand and remember one architecture. */
export const StudyModal: React.FC<{ model: ArchitectureModel; onClose: () => void; onShowNode: (componentId: string) => void }> = ({ model, onClose, onShowNode }) => {
  const [tab, setTab] = useState<'story' | 'sheet' | 'cards'>('story');
  const story = useMemo(() => storyFor(model), [model]);
  const cards = useMemo(() => buildCards(model), [model]);
  const a = model.architecture;
  const known = useAppStore((s) => s.progress.flashKnown?.[a.id] ?? []);
  const setKnown = useAppStore((s) => s.setFlashKnown);
  const [flipped, setFlipped] = useState(false);
  const [i, setI] = useState(0);
  // unknown cards first: a tiny spaced-repetition queue
  const queue = useMemo(() => [...cards.filter((c) => !known.includes(c.id)), ...cards.filter((c) => known.includes(c.id))], [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = queue[i % queue.length];

  const answer = (ok: boolean) => {
    setKnown(a.id, card.id, ok);
    playSfx(ok ? 'correct' : 'pop');
    setFlipped(false);
    setI(i + 1);
  };

  const download = () => {
    const blob = new Blob([cheatSheetMarkdown(model)], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${a.id}-cheat-sheet.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const tabs = [
    { id: 'story', label: 'Real-world story', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: 'sheet', label: 'Cheat sheet', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'cards', label: `Flashcards ${known.length}/${cards.length}`, icon: <Layers3 className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <Modal title={a.name} kicker="Study & remember" icon={<Brain className="w-4 h-4" />} onClose={onClose} size="lg">
      <div className="p-3 sm:p-5 space-y-4">
        <div className="flex gap-1 p-1 rounded-full bg-[#f3eee5] overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tab === t.id ? 'bg-white shadow-sm text-[#2f2a27]' : 'text-[#8d847c]'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'story' && (
          <div className="space-y-4">
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8d847c] mb-2">Real problems it solves</h4>
              <div className="grid sm:grid-cols-3 gap-2">
                {story.problems.map((p) => (
                  <div key={p.title} className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]">
                    <div className="text-sm font-semibold text-[#2f2a27]">{p.title}</div>
                    <div className="text-xs text-[#534a43] mt-0.5">{p.example}</div>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8d847c]">How a real input becomes the output</h4>
              <div className="p-3 rounded-2xl bg-[#2f2a27] text-white">
                <div className="text-[9px] font-mono font-bold uppercase text-[#f5d9a8]">Input · {story.input.label}</div>
                <div className="font-serif italic">{story.input.value}</div>
              </div>
              {story.journey.map((j, k) => {
                const comp = a.components[Math.min(k + (a.components.length > story.journey.length ? 1 : 0), a.components.length - 1)];
                return (
                  <React.Fragment key={k}>
                    <ArrowDown className="w-4 h-4 mx-auto text-[#eb7c6b]" />
                    <button onClick={() => comp && onShowNode(comp.id)} className="w-full text-left p-2.5 rounded-xl bg-white border border-[rgba(117,91,70,0.14)] hover:border-[#eb7c6b] text-sm text-[#2f2a27] flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#eb7c6b] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{k + 1}</span>
                      <span>{j}</span>
                    </button>
                  </React.Fragment>
                );
              })}
              <ArrowDown className="w-4 h-4 mx-auto text-[#eb7c6b]" />
              <div className="p-3 rounded-2xl bg-[#4E9F6B] text-white">
                <div className="text-[9px] font-mono font-bold uppercase text-white/80">Output of the last layer · {story.output.label}</div>
                <div className="font-semibold">{story.output.value}</div>
                <div className="text-xs text-white/85 mt-0.5">{story.output.meaning}</div>
              </div>
            </section>
          </div>
        )}

        {tab === 'sheet' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#eb7c6b] text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">In one sentence</div>
              <p className="font-serif text-lg leading-snug">{story.remember.oneLiner}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fff2c9] border border-[#f0e2b0]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8d6bcc]">Memory hook</div>
              <p className="text-sm font-semibold text-[#2f2a27]">{story.remember.mnemonic}</p>
            </div>
            <ul className="space-y-1.5">
              {story.remember.keyIdeas.map((k) => (
                <li key={k} className="flex gap-2 text-sm text-[#2f2a27]">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {k}
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] divide-y divide-[rgba(117,91,70,0.1)]">
              {a.components.map((c, k) => (
                <button key={c.id} onClick={() => onShowNode(c.id)} className="w-full text-left px-3 py-2 hover:bg-[#fbf6ee] grid grid-cols-[22px_minmax(0,1fr)] sm:grid-cols-[22px_minmax(0,180px)_minmax(0,1fr)] gap-x-2 text-xs">
                  <span className="font-mono font-bold text-[#eb7c6b]">{k + 1}</span>
                  <span className="font-semibold text-[#2f2a27]">
                    {c.name} <span className="font-mono font-normal text-[#8d847c]">{c.outputTensor.expression}</span>
                  </span>
                  <span className="col-start-2 sm:col-start-auto text-[#534a43]">{c.fiveYearOldWhy}</span>
                </button>
              ))}
            </div>
            <button onClick={download} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold">
              <Download className="w-3.5 h-3.5" /> Download cheat sheet (.md)
            </button>
          </div>
        )}

        {tab === 'cards' && card && (
          <div className="space-y-3">
            <div className="h-1.5 rounded-full bg-[#ece4d8] overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(known.length / cards.length) * 100}%` }} />
            </div>
            <button
              onClick={() => setFlipped(!flipped)}
              className={`w-full min-h-[220px] p-6 rounded-3xl border text-center flex flex-col items-center justify-center gap-2 transition-colors ${flipped ? 'bg-[#2f2a27] text-white border-[#2f2a27]' : 'bg-white border-[rgba(117,91,70,0.18)] text-[#2f2a27]'}`}
              aria-label={flipped ? 'Answer — tap to see the question' : 'Question — tap to reveal the answer'}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${flipped ? 'text-[#f5b3a8]' : 'text-[#8d847c]'}`}>
                {flipped ? 'Answer' : `Card ${(i % queue.length) + 1} of ${queue.length}${known.includes(card.id) ? ' · known' : ''}`}
              </span>
              <span className={`whitespace-pre-line ${flipped ? 'text-sm leading-relaxed' : 'font-serif text-xl'}`}>{flipped ? card.back : card.front}</span>
              {!flipped && <span className="text-[11px] text-[#8d847c]">Tap to reveal</span>}
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => answer(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-xs font-semibold text-[#2f2a27]">
                <Repeat className="w-3.5 h-3.5" /> Again
              </button>
              <button onClick={() => answer(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
                <Check className="w-3.5 h-3.5" /> Got it
              </button>
              {card.component && (
                <button onClick={() => onShowNode(card.component!)} className="px-3 py-2 rounded-xl text-xs font-semibold text-[#eb7c6b] underline">
                  Show in 3D
                </button>
              )}
              {known.length > 0 && (
                <button onClick={() => cards.forEach((c) => setKnown(a.id, c.id, false))} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-[#8d847c]">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
