import React, { useState } from 'react';
import { Sliders, RefreshCw, Flame, CheckCircle2, HelpCircle } from 'lucide-react';

export const WeightBiasSandbox: React.FC = () => {
  const [trainingPhase, setTrainingPhase] = useState<'before' | 'while' | 'after'>('after');
  const [weight, setWeight] = useState<number>(1.5);
  const [bias, setBias] = useState<number>(0.5);
  const [inputX, setInputX] = useState<number>(2.0);

  // Set preset parameter states based on training phase
  const handlePhaseChange = (phase: 'before' | 'while' | 'after') => {
    setTrainingPhase(phase);
    if (phase === 'before') {
      setWeight(-2.4); // Untrained random initial noise
      setBias(-1.8);
    } else if (phase === 'while') {
      setWeight(0.6); // Mid-training gradient adjustment
      setBias(0.1);
    } else {
      setWeight(1.5); // Optimal trained weight
      setBias(0.5);
    }
  };

  const linearSum = weight * inputX + bias;
  const reluOutput = Math.max(0, linearSum);
  const sigmoidOutput = 1 / (1 + Math.exp(-linearSum));

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E0D9C8] space-y-4 text-xs font-sans shadow-sm select-none">
      {/* 3-Phase Training Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <span className="font-mono font-bold text-[#F59E0B] text-xs uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Weight & Bias Training Simulator
        </span>

        {/* Phase Switcher Buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-[10px] font-mono">
          <button
            onClick={() => handlePhaseChange('before')}
            className={`px-2 py-1 rounded-md transition-all ${
              trainingPhase === 'before' ? 'bg-slate-800 text-white font-bold' : 'text-stone-600'
            }`}
          >
            1. Untrained (Random)
          </button>
          <button
            onClick={() => handlePhaseChange('while')}
            className={`px-2 py-1 rounded-md transition-all ${
              trainingPhase === 'while' ? 'bg-rose-600 text-white font-bold' : 'text-stone-600'
            }`}
          >
            2. Training (Backprop Nudge)
          </button>
          <button
            onClick={() => handlePhaseChange('after')}
            className={`px-2 py-1 rounded-md transition-all ${
              trainingPhase === 'after' ? 'bg-amber-500 text-white font-bold' : 'text-stone-600'
            }`}
          >
            3. Learned (Optimal)
          </button>
        </div>
      </div>

      {/* 5-Year-Old Explanation Story Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
        <span className="font-mono font-bold text-[10px] text-amber-800 uppercase flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          5-YEAR-OLD STORY (WHAT IS HAPPENING RIGHT NOW?):
        </span>
        <p className="font-serif italic leading-relaxed">
          {trainingPhase === 'before' &&
            '👶 BEFORE TRAINING: Like a baby guessing animal sounds for the first time — calling a dog "moo"! The weight knob is set to a random bad guess (-2.4), so the output is completely wrong!'}
          {trainingPhase === 'while' &&
            '🔥 WHILE TRAINING: Playing a "hot & cold" game! The teacher points out mistakes, and glowing gradient nudges flow BACKWARD to turn the weight knob slightly right (+0.6) toward the target!'}
          {trainingPhase === 'after' &&
            '👑 AFTER TRAINING: Like a master chef who bakes the cake perfectly with their eyes closed! The weight knob is set to 1.5, giving accurate output predictions every single time!'}
        </p>
      </div>

      {/* Sliders Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1">
          <div className="flex justify-between font-mono">
            <span className="font-semibold text-amber-900">Weight (W)</span>
            <span className="font-bold text-amber-700">{weight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200/60 space-y-1">
          <div className="flex justify-between font-mono">
            <span className="font-semibold text-cyan-900">Bias (b)</span>
            <span className="font-bold text-cyan-700">{bias.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={bias}
            onChange={(e) => setBias(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-1">
          <div className="flex justify-between font-mono">
            <span className="font-semibold text-purple-900">Input (x)</span>
            <span className="font-bold text-purple-700">{inputX.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.2"
            value={inputX}
            onChange={(e) => setInputX(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative w-full h-36 bg-stone-900 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="-50 -50 100 100">
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#334155" strokeWidth="1" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#334155" strokeWidth="1" />

          <line
            x1="-50"
            y1={-(weight * -5 + bias) * 8}
            x2="50"
            y2={-(weight * 5 + bias) * 8}
            stroke={trainingPhase === 'while' ? '#F43F5E' : '#F59E0B'}
            strokeWidth="2.5"
          />

          <circle
            cx={inputX * 8}
            cy={-linearSum * 8}
            r="4"
            fill="#06B6D4"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute top-2 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 text-amber-300 font-mono text-[11px] border border-stone-800">
          y = ({weight.toFixed(1)} × {inputX.toFixed(1)}) + ({bias.toFixed(1)}) ={' '}
          <span className="font-bold text-white">{linearSum.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
