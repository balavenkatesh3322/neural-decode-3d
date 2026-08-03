import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Architecture, NodeComponent } from '../../types/architecture';
import {
  Play,
  Pause,
  RefreshCw,
  Flame,
  TrendingDown,
  Award,
  Layers,
  HelpCircle,
  ArrowDown,
  Activity,
  Calculator,
  CheckCircle2,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  PanelRightOpen,
} from 'lucide-react';

interface RightSidebarProps {
  architecture: Architecture;
  selectedNode: NodeComponent | null;
  currentStepIndex: number;
  isPlayingAnimation: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onTogglePlayAnimation: () => void;
  onSelectNode: (component: NodeComponent) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  architecture,
  selectedNode,
  currentStepIndex,
  isPlayingAnimation,
  isCollapsed = false,
  onToggleCollapse,
  onTogglePlayAnimation,
  onSelectNode,
}) => {
  // Live Training Simulator State
  const [isTrainingRunning, setIsTrainingRunning] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(1);
  const [loss, setLoss] = useState<number>(4.85);
  const [accuracy, setAccuracy] = useState<number>(12.4);

  // Synchronize training button click with 3D animation play state
  const handleToggleTraining = () => {
    setIsTrainingRunning(!isTrainingRunning);
    onTogglePlayAnimation();
  };

  // Live training progression simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isTrainingRunning || isPlayingAnimation) {
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
          return nextEpoch;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isTrainingRunning, isPlayingAnimation]);

  const handleResetTraining = () => {
    setIsTrainingRunning(false);
    if (isPlayingAnimation) onTogglePlayAnimation();
    setEpoch(1);
    setLoss(4.85);
    setAccuracy(12.4);
  };

  const steps = architecture.dataFlowSteps;
  const activeStep = steps.find((s) => s.stepIndex === currentStepIndex) || steps[0];
  const activeNode = selectedNode || architecture.components.find((c) => c.id === activeStep?.activeNodeId) || architecture.components[0];
  const isFinalStep = currentStepIndex === steps.length;

  // Trigger canvas confetti celebration on final step reach!
  useEffect(() => {
    if (isFinalStep && (isPlayingAnimation || isTrainingRunning)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    }
  }, [isFinalStep, isPlayingAnimation, isTrainingRunning]);

  // Collapsed View (Failsafe Re-Open Mechanics)
  if (isCollapsed) {
    return (
      <aside
        onClick={() => onToggleCollapse && onToggleCollapse()}
        className="w-14 flex-shrink-0 h-full bg-[#FBF9F5]/95 backdrop-blur-md border-l border-[#E8E3D8] flex flex-col items-center py-4 z-20 shadow-xl transition-all duration-300 select-none cursor-pointer group hover:bg-amber-100/60"
        title="Click to Open Training Inspector"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleCollapse) onToggleCollapse();
          }}
          className="p-2.5 rounded-xl bg-amber-500 text-white shadow-lg transition-all mb-6 group-hover:scale-110 group-hover:bg-amber-600 ring-2 ring-amber-300"
          title="Open Training Inspector"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>

        <div className="writing-mode-vertical font-mono text-xs uppercase font-bold text-stone-700 group-hover:text-amber-900 tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-600 rotate-90 animate-pulse" />
          <span>OPEN INSPECTOR</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 flex-shrink-0 bg-[#FBF9F5]/95 backdrop-blur-md border-l border-[#E8E3D8] h-full flex flex-col z-20 shadow-xl overflow-hidden transition-all duration-300 select-none">
      {/* 1. Live Training Simulator Header Block (Right Side Placement) */}
      <div className="p-4 border-b border-[#E8E3D8] bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <span className="font-mono font-bold text-stone-900 text-xs uppercase tracking-wide">
              Live Training Simulator
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetTraining}
              className="p-1 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
              title="Reset Training Progress"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCollapse();
                }}
                className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-700 transition-all font-bold"
                title="Close / Minimize Inspector"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Epoch & Start Training Button Row */}
        <div className="flex items-center justify-between bg-stone-900 text-white p-2.5 rounded-xl font-mono shadow-inner">
          <div>
            <span className="text-[9px] text-stone-400 block uppercase">Epoch Iteration</span>
            <span className="text-sm font-bold text-amber-400">{epoch} / 50</span>
          </div>

          <button
            onClick={handleToggleTraining}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow ${
              isTrainingRunning || isPlayingAnimation
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isTrainingRunning || isPlayingAnimation ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Pass</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Training</span>
              </>
            )}
          </button>
        </div>

        {/* Metrics Row: Loss & Accuracy */}
        <div className="grid grid-cols-2 gap-2">
          {/* Loss Metric */}
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

          {/* Accuracy Metric */}
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
      </div>

      {/* 2. Active Component Framer Motion Live Calculation Console Box */}
      <AnimatePresence mode="wait">
        {activeStep && activeNode && (
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="p-4 bg-amber-500 text-white space-y-2.5 border-b border-amber-600 shadow-md"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-100 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                LIVE STEP {currentStepIndex}/{steps.length}: {activeStep.title}
              </span>
            </div>

            {/* Executing Calculation Math */}
            <div className="p-2 bg-stone-900 text-amber-300 rounded-xl font-mono text-xs border border-amber-400/40 shadow-inner">
              <span className="text-[8px] text-stone-400 uppercase block font-sans font-bold">Executing Math Equation:</span>
              <code>{activeStep.realWorldCalculation}</code>
            </div>

            {/* Intermediate Output Tensor Produced */}
            <div className="flex items-center justify-between text-xs font-mono bg-amber-600/90 p-2 rounded-xl border border-amber-400/50">
              <span className="text-amber-100 font-sans font-medium">Output Tensor:</span>
              <span className="font-bold text-white">{activeNode.outputTensor.expression}</span>
            </div>

            {/* 5-Year-Old Explanation */}
            <div className="text-xs font-serif italic text-amber-50 leading-relaxed pt-0.5">
              "{activeStep.whyItHappened5yo}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Final Target Achieved Banner (When Reaching Output Step) */}
      <AnimatePresence>
        {isFinalStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white space-y-2 border-b border-emerald-800 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-200 uppercase">
              <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>FINAL GOAL ACHIEVED!</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-emerald-50">
              Successful Real-World Prediction!
            </h4>
            <p className="text-xs font-sans leading-relaxed text-emerald-100">
              Why it worked: The network combined {architecture.components.length} layers of feature extraction to map raw inputs cleanly into high-confidence predictions!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. End-to-End Component Sequence Header */}
      <div className="p-3.5 bg-stone-100/70 border-b border-[#E8E3D8] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span className="font-mono font-bold text-xs uppercase text-stone-900">
            End-to-End Sequence (1 → {architecture.components.length})
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-stone-500 px-2 py-0.5 bg-white rounded border border-stone-200">
          {architecture.components.length} Steps
        </span>
      </div>

      {/* Component Pathway Scroll List with Explicit 1, 2, 3 Sequence Badges */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
        {architecture.components.map((comp, index) => {
          const isSelected = selectedNode?.id === comp.id;
          const isActiveStepNode = activeStep?.activeNodeId === comp.id;
          const stepNumber = index + 1;

          return (
            <React.Fragment key={comp.id}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectNode(comp)}
                className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer space-y-2.5 font-sans ${
                  isSelected || isActiveStepNode
                    ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-[#FBF9F5] border-[#E8E3D8] hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                {/* Sequence Step Number Badge [ 1 ], [ 2 ], [ 3 ] */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-mono text-xs font-extrabold flex items-center justify-center shadow">
                      {stepNumber}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      STEP {stepNumber} • {comp.category}
                    </span>
                  </div>

                  {isActiveStepNode && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                      <Activity className="w-3 h-3" /> EXECUTING
                    </span>
                  )}
                </div>

                {/* Name */}
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {comp.name}
                </h4>

                {/* 5-Year-Old Explanation Card */}
                <div className="p-2.5 rounded-xl bg-amber-500 text-white text-xs font-serif italic leading-relaxed shadow-sm">
                  <span className="font-mono text-[9px] font-bold uppercase text-amber-100 block not-italic mb-0.5">
                    5-YEAR-OLD EXPLANATION:
                  </span>
                  "{comp.fiveYearOldWhy || comp.description}"
                </div>

                {/* Dedicated Input & Output Transformation Cards */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  {/* Input Card */}
                  <div className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 space-y-0.5">
                    <span className="text-[8px] text-stone-400 font-bold block uppercase">INPUT DATA IN</span>
                    <span className="font-bold text-stone-900 truncate block">{comp.inputTensor.name}</span>
                    <span className="text-[9px] text-stone-500 block">{comp.inputTensor.expression}</span>
                  </div>

                  {/* Output Card */}
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-0.5">
                    <span className="text-[8px] text-emerald-600 font-bold block uppercase">OUTPUT PRODUCED</span>
                    <span className="font-bold text-emerald-950 truncate block">{comp.outputTensor.name}</span>
                    <span className="text-[9px] text-emerald-700 block">{comp.outputTensor.expression}</span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Down Arrow between sequential components */}
              {index < architecture.components.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className="w-4 h-4 text-amber-500/60 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 5. Creator Profile Footer Card (Bala Venkatesh) */}
      <div className="p-3.5 bg-stone-900 text-white border-t border-stone-800 space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center font-mono">
              BV
            </div>
            <span className="font-serif font-bold text-xs text-amber-300">
              Created by Bala Venkatesh
            </span>
          </div>

          <a
            href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-amber-400 hover:text-white flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-md border border-stone-700 hover:border-amber-400 transition-all"
          >
            <span>Portfolio</span>
            <Globe className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
