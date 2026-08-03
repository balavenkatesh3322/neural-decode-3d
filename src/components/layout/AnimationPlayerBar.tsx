import React from 'react';
import { Architecture } from '../../types/architecture';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AnimationPlayerBarProps {
  architecture: Architecture;
  currentStepIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onSelectStep: (stepIndex: number) => void;
}

export const AnimationPlayerBar: React.FC<AnimationPlayerBarProps> = ({
  architecture,
  currentStepIndex,
  isPlaying,
  onTogglePlay,
  onStepPrev,
  onStepNext,
  onSelectStep,
}) => {
  const steps = architecture.dataFlowSteps;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 select-none">
      {/* Pristine Floating Animation Control Bar */}
      <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/90 backdrop-blur-md border border-[#E0D9C8] shadow-editorial">
        <button
          onClick={onStepPrev}
          disabled={currentStepIndex <= 1}
          className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Previous Step"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="flex items-center gap-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-medium text-xs rounded-full shadow-md transition-all"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-amber-400" />
              <span>Pause Pass</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-amber-400" />
              <span>Animate 3D Calculation Pass</span>
            </>
          )}
        </button>

        <button
          onClick={onStepNext}
          disabled={currentStepIndex >= steps.length}
          className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Next Step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-4">
          {steps.map((step) => {
            const isCurrent = step.stepIndex === currentStepIndex;
            return (
              <button
                key={step.stepIndex}
                onClick={() => onSelectStep(step.stepIndex)}
                className={`h-2.5 rounded-full transition-all ${
                  isCurrent ? 'w-6 bg-amber-500' : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                }`}
                title={`Step ${step.stepIndex}: ${step.title}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
