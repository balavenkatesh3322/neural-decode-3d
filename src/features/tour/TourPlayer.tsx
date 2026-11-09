import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowUp, ArrowDown, CircleOff } from 'lucide-react';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { useAppStore, FlowMode } from '../../store/useAppStore';

const SPEEDS = [0.5, 1, 1.5, 2];
const FLOWS: { mode: FlowMode; label: string; icon: React.ReactNode; title: string }[] = [
  { mode: 'forward', label: 'Forward', icon: <ArrowUp className="w-3 h-3" />, title: 'Forward pass: tensors flow from input to output' },
  { mode: 'backward', label: 'Backprop', icon: <ArrowDown className="w-3 h-3" />, title: 'Backward pass: gradients flow from the loss back to the input' },
  { mode: 'off', label: 'Off', icon: <CircleOff className="w-3 h-3" />, title: 'Only animate the inputs of the selected part' },
];

/** Guided-tour transport: step through the forward pass with captions, narration and flow modes. */
export const TourPlayer: React.FC<{ model: ArchitectureModel }> = ({ model }) => {
  const tour = useAppStore((s) => s.tour);
  const setTour = useAppStore((s) => s.setTour);
  const flow = useAppStore((s) => s.flow);
  const setFlow = useAppStore((s) => s.setFlow);
  const steps = model.architecture.dataFlowSteps;
  const step = steps.find((s) => s.stepIndex === tour.step) ?? steps[0];
  const go = (n: number) => setTour({ step: Math.min(steps.length, Math.max(1, n)) });

  return (
    <div className="absolute bottom-2 lg:bottom-4 left-2 right-2 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 z-20 flex flex-col items-center gap-2 select-none lg:w-[min(720px,calc(100%-170px))]">
      <AnimatePresence mode="wait">
        {step && (tour.playing || tour.step > 1) && (
          <motion.div
            key={`${model.architecture.id}-${tour.step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="hidden sm:block w-full px-4 py-2.5 rounded-2xl bg-[rgba(47,42,39,0.92)] text-white shadow-xl backdrop-blur-md"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#f5b3a8]">
              Step {tour.step}/{steps.length} · {step.title}
            </div>
            <p className="text-xs text-white/90 leading-relaxed mt-0.5">{step.description}</p>
            <p className="text-[11px] text-[#ffe7a8] mt-1">{step.whyItHappened5yo}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 max-w-full overflow-x-auto rounded-full bg-[rgba(255,252,247,0.95)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_12px_32px_rgba(87,62,43,0.12)]">
        <button onClick={() => go(tour.step - 1)} disabled={tour.step <= 1} className="p-1.5 rounded-full text-[#8d847c] hover:text-[#2f2a27] hover:bg-stone-100 disabled:opacity-30" title="Previous step">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (!tour.playing && tour.step >= steps.length) setTour({ playing: true, step: 1 });
            else setTour({ playing: !tour.playing });
          }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#2f2a27] text-[#f5b3a8] text-xs font-semibold hover:bg-black"
        >
          {tour.playing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span className="sm:hidden">{tour.playing ? 'Pause' : `Step ${tour.step}/${steps.length}`}</span>
          <span className="hidden sm:inline">{tour.playing ? 'Pause tour' : tour.step > 1 ? 'Resume tour' : 'Start guided tour'}</span>
        </button>
        <button onClick={() => go(tour.step + 1)} disabled={tour.step >= steps.length} className="p-1.5 rounded-full text-[#8d847c] hover:text-[#2f2a27] hover:bg-stone-100 disabled:opacity-30" title="Next step">
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="hidden md:flex items-center gap-1 px-2 border-l border-[rgba(117,91,70,0.15)]">
          {steps.map((s) => (
            <button
              key={s.stepIndex}
              onClick={() => go(s.stepIndex)}
              title={`Step ${s.stepIndex}: ${s.title}`}
              className={`h-2 rounded-full transition-all ${s.stepIndex === tour.step ? 'w-5 bg-[#eb7c6b]' : s.stepIndex < tour.step ? 'w-2 bg-[#eb7c6b]/50' : 'w-2 bg-stone-300 hover:bg-stone-400'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setTour({ speed: SPEEDS[(SPEEDS.indexOf(tour.speed) + 1) % SPEEDS.length] })}
          className="px-2 py-1 rounded-full font-mono text-[10px] font-bold text-[#2f2a27] bg-[#f3eee5] hover:bg-[#ebe3d6] w-10"
          title="Playback speed"
        >
          {tour.speed}×
        </button>
        <button
          onClick={() => setTour({ narrate: !tour.narrate })}
          className={`p-1.5 rounded-full ${tour.narrate ? 'text-[#eb7c6b] bg-[#eb7c6b]/10' : 'text-[#8d847c] hover:bg-stone-100'}`}
          title={tour.narrate ? 'Narration on' : 'Narration off'}
        >
          {tour.narrate ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="flex-shrink-0 flex items-center gap-0.5 p-0.5 rounded-full bg-[#f3eee5] border-l border-[rgba(117,91,70,0.1)]">
          {FLOWS.map((f) => (
            <button
              key={f.mode}
              onClick={() => setFlow(f.mode)}
              title={f.title}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                flow === f.mode ? (f.mode === 'backward' ? 'bg-rose-500 text-white' : 'bg-white text-[#2f2a27] shadow-sm') : 'text-[#8d847c] hover:text-[#2f2a27]'
              }`}
            >
              {f.icon}
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
