import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass, GraduationCap, Sparkles, X, ChevronLeft, PlayCircle, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ALL_ARCHITECTURES, ARCHITECTURES_BY_ID } from '../../data/architectures';
import { BASICS } from '../../data/basics';
import { TRACKS } from '../../data/tracks';
import { GOALS, LEVELS, MINUTES, recommend, daysFor, type Level } from './paths';
import { track } from '../../lib/track';
import { AGENTDECODE_URL } from '../../config/agentdecode';

const DEMO = 'transformer';
type View = 'hero' | 'level' | 'goal' | 'time' | 'result';

/**
 * Landing hero shown on a first visit (and from the logo). The real 3D Llama-3 transformer
 * plays its guided tour behind it as the demo; a 3-question path finder recommends where to start.
 */
export const HomeOverlay: React.FC = () => {
  const setHome = useAppStore((s) => s.setHome);
  const setArch = useAppStore((s) => s.setArch);
  const setTour = useAppStore((s) => s.setTour);
  const openModal = useAppStore((s) => s.openModal);
  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const progress = useAppStore((s) => s.progress);
  const [view, setView] = useState<View>('hero');
  const [level, setLevel] = useState<Level | null>(onboarding.level ?? null);
  const [goal, setGoal] = useState<string | null>(onboarding.goal ?? null);
  const [minutes, setMinutes] = useState<number>(onboarding.minutes ?? 20);
  const prevArch = useRef(useAppStore.getState().archId);

  // play the demo tour behind the hero
  useEffect(() => {
    track('home_viewed');
    // after the deep-link hook has applied the URL (parent effects run after this one)
    const t = window.setTimeout(() => {
      setArch(DEMO);
      setTour({ step: 1, playing: true, narrate: false });
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visitedCount = Object.keys(progress.visited).length;
  const continueTo = prevArch.current !== DEMO && ARCHITECTURES_BY_ID[prevArch.current] && visitedCount > 0 ? ARCHITECTURES_BY_ID[prevArch.current] : null;
  const nextOnPath = onboarding.path?.find((id) => !progress.toursCompleted.includes(id));

  const leave = (archId: string | null, opts: { basics?: boolean } = {}) => {
    // switch topic first (ignored by the URL while the landing page is up), then leave → one history entry
    if (archId) setArch(archId);
    setHome(false);
    setTour({ playing: false, step: 1 });
    if (archId && useAppStore.getState().prefs.autoplay && !opts.basics) setTimeout(() => useAppStore.getState().setTour({ playing: true, step: 1 }), 600);
    if (opts.basics) openModal('blocks');
  };

  const finish = () => {
    if (!level || !goal) return;
    const { path, startBasics } = recommend(level, goal);
    setOnboarding({ level, goal, minutes, path, startBasics });
    track('onboarding_done', { level, goal, minutes });
    setView('result');
  };
  const rec = level && goal ? recommend(level, goal) : null;

  const option = (selected: boolean, onClick: () => void, title: string, hint: string, icon?: string) => (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selected ? 'border-[#eb7c6b] bg-[#eb7c6b]/8 shadow-sm' : 'border-[rgba(117,91,70,0.14)] bg-white/80 hover:border-[#eb7c6b]/50'}`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#2f2a27]">{title}</span>
        <span className="block text-[11px] text-[#8d847c]">{hint}</span>
      </span>
    </button>
  );

  const steps: View[] = ['level', 'goal', 'time'];
  const stepIdx = steps.indexOf(view);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* soft wash so text reads over the live scene */}
      <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-[#FBF9F5] via-[#FBF9F5]/90 to-transparent" />
      <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(90deg, #FBF9F5 0%, #FBF9F5 40%, rgba(251,249,245,0.75) 50%, rgba(251,249,245,0) 64%)' }} />

      <div className="relative h-full flex items-end lg:items-center px-4 sm:px-8 lg:px-16 pb-28 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto w-full max-w-[560px]"
          >
            {view === 'hero' && (
              <div className="space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[rgba(117,91,70,0.16)] text-[11px] font-semibold text-[#8d6bcc]">
                  <Sparkles className="w-3.5 h-3.5 text-[#eb7c6b]" /> Free · interactive · no sign-up
                </span>
                <h1 className="font-serif text-[40px] sm:text-[54px] leading-[1.02] text-[#2f2a27] tracking-tight">
                  See inside AI models, <em className="text-[#eb7c6b] not-italic">layer by layer.</em>
                </h1>
                <p className="text-[15px] sm:text-base text-[#534a43] leading-relaxed max-w-[480px]">
                  Watch tensors flow through GPT, BERT, CLIP, Diffusion and more in 3D, one step at a time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => (track('home_cta', { cta: 'path' }), setView('level'))} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#2f2a27] text-white text-sm font-semibold shadow-lg hover:bg-black">
                    <Compass className="w-4 h-4 text-[#eb7c6b]" /> Find my path <span className="text-white/50 font-normal">· 30 sec</span>
                  </button>
                  <button onClick={() => (track('home_cta', { cta: 'basics' }), track('basics_opened', { from: 'home' }), leave(null, { basics: true }))} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.2)] text-[#2f2a27] text-sm font-semibold hover:border-[#eb7c6b]">
                    <GraduationCap className="w-4 h-4 text-[#8d6bcc]" /> Start from zero
                  </button>
                </div>
                {(continueTo || nextOnPath) && (
                  <button
                    onClick={() => (track('home_cta', { cta: 'continue' }), leave(nextOnPath ?? continueTo!.id))}
                    className="flex items-center gap-2 text-sm font-semibold text-[#eb7c6b] hover:underline"
                  >
                    <PlayCircle className="w-4 h-4" /> Continue: {ARCHITECTURES_BY_ID[nextOnPath ?? continueTo!.id]?.name}
                  </button>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[12px] text-[#8d847c]">
                  <span>
                    <b className="text-[#2f2a27]">{TRACKS.length}</b> tracks
                  </span>
                  <span>
                    <b className="text-[#2f2a27]">{ALL_ARCHITECTURES.length}</b> 3D architectures
                  </span>
                  <span>
                    <b className="text-[#2f2a27]">{BASICS.length}</b> basics with sandboxes
                  </span>
                  <span>
                    real parameter counts
                  </span>
                </div>
                <a
                  href={AGENTDECODE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('agentdecode_clicked', { from: 'home' })}
                  className="flex items-center gap-2 w-fit px-3 py-2 rounded-xl bg-white/80 border border-[#8d6bcc]/25 hover:border-[#8d6bcc]/60 text-[12px] text-[#534a43]"
                >
                  🤖 <span>
                    Learn how apps &amp; agents use these models: <b className="text-[#8d6bcc]">AgentDecode 3D ↗</b>
                  </span>
                </a>
                <button onClick={() => (track('home_cta', { cta: 'explore' }), leave(DEMO))} className="text-[12px] text-[#8d847c] hover:text-[#2f2a27] underline-offset-2 hover:underline">
                  or explore the model on the right →
                </button>
              </div>
            )}

            {stepIdx >= 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#fffbf4]/95 backdrop-blur-md border border-[rgba(117,91,70,0.16)] shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setView(stepIdx === 0 ? 'hero' : steps[stepIdx - 1])} className="flex items-center gap-1 text-xs text-[#8d847c] hover:text-[#2f2a27]">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <div className="flex gap-1">
                    {steps.map((s, i) => (
                      <span key={s} className={`h-1.5 rounded-full transition-all ${i <= stepIdx ? 'w-6 bg-[#eb7c6b]' : 'w-3 bg-[#e2d9ce]'}`} />
                    ))}
                  </div>
                </div>
                {view === 'level' && (
                  <>
                    <h2 className="font-serif text-2xl text-[#2f2a27]">How familiar are you with neural networks?</h2>
                    <div className="space-y-2">{LEVELS.map((l) => option(level === l.id, () => (setLevel(l.id), setView('goal')), l.label, l.hint))}</div>
                  </>
                )}
                {view === 'goal' && (
                  <>
                    <h2 className="font-serif text-2xl text-[#2f2a27]">What do you want to understand?</h2>
                    <div className="grid sm:grid-cols-2 gap-2">{GOALS.map((g) => option(goal === g.id, () => (setGoal(g.id), setView('time')), g.label, g.hint, g.emoji))}</div>
                  </>
                )}
                {view === 'time' && (
                  <>
                    <h2 className="font-serif text-2xl text-[#2f2a27]">How much time per day?</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {MINUTES.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMinutes(m)}
                          className={`p-3 rounded-2xl border-2 text-center ${minutes === m ? 'border-[#eb7c6b] bg-[#eb7c6b]/8' : 'border-[rgba(117,91,70,0.14)] bg-white/80 hover:border-[#eb7c6b]/50'}`}
                        >
                          <span className="block font-serif text-2xl text-[#2f2a27]">{m}</span>
                          <span className="text-[11px] text-[#8d847c]">min / day</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={finish} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#2f2a27] text-white text-sm font-semibold hover:bg-black">
                      Build my path <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            {view === 'result' && rec && (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#fffbf4]/95 backdrop-blur-md border border-[rgba(117,91,70,0.16)] shadow-2xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#eb7c6b]">Your path</div>
                    <h2 className="font-serif text-2xl text-[#2f2a27] leading-tight">{GOALS.find((g) => g.id === goal)?.label}</h2>
                    <p className="text-xs text-[#8d847c] mt-0.5">
                      {rec.path.length} architectures · about {daysFor(rec.path.length, minutes)} days at {minutes} min/day
                    </p>
                  </div>
                  <button onClick={() => setView('level')} title="Start over" className="p-1.5 rounded-lg text-[#8d847c] hover:bg-stone-100">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <ol className="space-y-1 max-h-[38vh] overflow-y-auto custom-scrollbar pr-1">
                  {rec.startBasics && (
                    <li className="flex items-center gap-2 p-2 rounded-xl bg-[#f6f1fb] text-sm text-[#5b3fb3]">
                      <GraduationCap className="w-4 h-4" /> First: Deep Learning Basics (units 1–2, ~20 min)
                    </li>
                  )}
                  {rec.path.map((id, i) => {
                    const a = ARCHITECTURES_BY_ID[id];
                    return (
                      <li key={id} className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-[rgba(117,91,70,0.1)]">
                        <span className="w-5 h-5 rounded-full bg-[#eb7c6b] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-sm text-[#2f2a27] truncate">{a?.name}</span>
                      </li>
                    );
                  })}
                </ol>
                <button
                  onClick={() => (rec.startBasics ? leave(rec.path[0], { basics: true }) : leave(rec.path[0]))}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#eb7c6b] text-white text-sm font-semibold shadow-lg hover:bg-[#e06a58]"
                >
                  {rec.startBasics ? 'Start with the Basics' : `Start: ${ARCHITECTURES_BY_ID[rec.path[0]]?.name}`} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={() => leave(continueTo?.id ?? DEMO)} className="pointer-events-auto absolute top-3 right-3 p-2 rounded-full bg-white/80 border border-[rgba(117,91,70,0.16)] text-[#8d847c] hover:text-[#2f2a27]" title="Skip to the app" aria-label="Close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
