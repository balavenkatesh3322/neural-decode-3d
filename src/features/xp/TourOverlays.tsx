import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Wrench, RotateCcw, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { track } from '../../lib/track';
import { playSfx } from '../audio/audio';

/** Floating “+20 XP” toast after every award. */
export const XpToast: React.FC = () => {
  const toast = useAppStore((s) => s.xpToast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const t = window.setTimeout(() => setShown(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.n}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed z-[60] bottom-24 right-4 lg:right-8 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2f2a27] text-white shadow-2xl pointer-events-none"
        >
          <Zap className="w-4 h-4 text-[#E3A23B] fill-[#E3A23B]" />
          <span className="font-mono font-bold text-[#E3A23B]">+{shown.amount} XP</span>
          <span className="text-xs text-white/80">{shown.reason}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** “What happens next?” card shown while the tour is paused in predict mode. */
export const PredictCard: React.FC = () => {
  const predict = useAppStore((s) => s.predict);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [predict]);
  if (!predict) return null;
  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === predict.answer;
    playSfx(ok ? 'correct' : 'wrong');
    useAppStore.getState().answerPredict(ok);
    track('predict_answered', { correct: ok });
    window.setTimeout(() => {
      const st = useAppStore.getState();
      st.setPredict(null);
      st.setTour({ step: predict.step, playing: true });
    }, ok ? 900 : 1700);
  };
  return (
    <div className="absolute z-30 left-2 right-2 bottom-24 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[min(560px,calc(100%-40px))]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-[#fffbf4] border-2 border-[#8B6BD6]/40 shadow-2xl space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8B6BD6]">
          <Brain className="w-4 h-4" /> Predict · step {predict.step}
        </div>
        <div className="font-serif text-xl text-[#2f2a27]">{predict.question}</div>
        <div className="space-y-1.5">
          {predict.options.map((o, i) => {
            const state = picked === null ? 'idle' : i === predict.answer ? 'right' : i === picked ? 'wrong' : 'dim';
            return (
              <button
                key={o}
                onClick={() => choose(i)}
                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] border transition-colors ${
                  state === 'idle'
                    ? 'bg-white border-[rgba(117,91,70,0.18)] hover:border-[#8B6BD6]'
                    : state === 'right'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : state === 'wrong'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-transparent opacity-50'
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && <p className={`text-xs font-semibold ${picked === predict.answer ? 'text-emerald-700' : 'text-rose-700'}`}>{picked === predict.answer ? '✓ Correct! +5 XP' : '✗ Not quite. Watch what really happens…'}</p>}
      </motion.div>
    </div>
  );
};

/** Break-it mode: the forward pass stopped because a part is switched off. */
export const FailureCard: React.FC = () => {
  const failure = useAppStore((s) => s.failure);
  const broken = useAppStore((s) => s.broken);
  if (!failure || !broken) return null;
  const st = useAppStore.getState;
  return (
    <div className="absolute z-30 left-2 right-2 bottom-24 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[min(560px,calc(100%-40px))]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-2xl space-y-2">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700">💥 The forward pass broke at step {failure.step}</div>
        <p className="text-sm text-rose-900 leading-relaxed">{failure.text}</p>
        <div className="flex gap-2 pt-1">
          <button onClick={() => (st().setBroken(null), setTimeout(() => st().setTour({ step: 1, playing: true }), 50))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" /> Fix it and replay
          </button>
          <button onClick={() => (st().setFailure(null), st().setTour({ step: 1, playing: true }))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 text-xs font-semibold">
            <RotateCcw className="w-3.5 h-3.5" /> Replay broken
          </button>
        </div>
      </motion.div>
    </div>
  );
};
