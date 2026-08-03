import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Flame, TrendingDown, Award, Zap } from 'lucide-react';

interface TrainingProgressWidgetProps {
  onTrainingUpdate?: (epoch: number, loss: number, accuracy: number) => void;
}

export const TrainingProgressWidget: React.FC<TrainingProgressWidgetProps> = ({ onTrainingUpdate }) => {
  const [isTrainingRunning, setIsTrainingRunning] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(1);
  const [loss, setLoss] = useState<number>(4.85);
  const [accuracy, setAccuracy] = useState<number>(12.4);

  // Live training progression simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isTrainingRunning) {
      interval = setInterval(() => {
        setEpoch((prevEpoch) => {
          if (prevEpoch >= 50) {
            setIsTrainingRunning(false);
            return 50;
          }
          const nextEpoch = prevEpoch + 1;
          const nextLoss = Math.max(0.02, 4.85 * Math.exp(-nextEpoch * 0.09) + (Math.random() - 0.5) * 0.05);
          const nextAcc = Math.min(98.8, 12.4 + (86.4 * (1 - Math.exp(-nextEpoch * 0.08))));

          setLoss(parseFloat(nextLoss.toFixed(2)));
          setAccuracy(parseFloat(nextAcc.toFixed(1)));
          if (onTrainingUpdate) onTrainingUpdate(nextEpoch, nextLoss, nextAcc);

          return nextEpoch;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isTrainingRunning, onTrainingUpdate]);

  const handleResetTraining = () => {
    setIsTrainingRunning(false);
    setEpoch(1);
    setLoss(4.85);
    setAccuracy(12.4);
  };

  return (
    <div className="absolute top-20 left-6 z-20 max-w-sm w-72 rounded-2xl bg-[#FBF9F5]/95 backdrop-blur-md border border-[#E0D9C8] p-4 shadow-2xl space-y-3 select-none text-xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-mono font-bold text-stone-900 text-xs uppercase tracking-wide">
            Live Training Simulator
          </span>
        </div>

        <button
          onClick={handleResetTraining}
          className="p-1 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-all"
          title="Reset Training Progress"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Epoch & Play Controls */}
      <div className="flex items-center justify-between bg-stone-900 text-white p-2.5 rounded-xl border border-stone-800 font-mono">
        <div>
          <span className="text-[9px] text-stone-400 block uppercase">Epoch Iteration</span>
          <span className="text-sm font-bold text-amber-400">{epoch} / 50</span>
        </div>

        <button
          onClick={() => setIsTrainingRunning(!isTrainingRunning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
            isTrainingRunning ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {isTrainingRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Train Step</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row: Loss & Accuracy */}
      <div className="grid grid-cols-2 gap-2">
        {/* Loss Card */}
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-rose-800 font-semibold">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-600" />
              Loss (MSE)
            </span>
          </div>
          <div className="text-base font-bold font-mono text-rose-950">
            {loss.toFixed(2)}
          </div>
          <div className="w-full bg-rose-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (loss / 4.85) * 100)}%` }}
            />
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 font-semibold">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-600" />
              Accuracy
            </span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-950">
            {accuracy.toFixed(1)}%
          </div>
          <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Status Story Banner */}
      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-950 font-serif italic leading-relaxed">
        {epoch === 1 && "👶 Epoch 1: High Loss (4.85). Random weight noise guessing dog sounds!"}
        {epoch > 1 && epoch < 25 && "🔥 Training in progress... Backprop gradients are tuning weight dials!"}
        {epoch >= 25 && epoch < 50 && "⚡ High Accuracy (85%+)! Deep feature maps detecting dog ears sharply!"}
        {epoch === 50 && "👑 Optimal Convergence! Loss minimized to 0.02 with 98.8% accuracy!"}
      </div>
    </div>
  );
};
