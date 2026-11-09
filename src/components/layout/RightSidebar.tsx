import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
  Github,
  FileText,
  ExternalLink,
  Bookmark,
} from 'lucide-react';
import { STORIES } from '../../data/stories';
import { useAppStore } from '../../store/useAppStore';

interface RightSidebarProps {
  architecture: Architecture;
  selectedNode: NodeComponent | null;
  currentStepIndex: number;
  isPlayingAnimation: boolean;
  onTogglePlayAnimation: () => void;
  onSelectNode: (component: NodeComponent) => void;
  variant?: 'panel' | 'sheet';
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  architecture,
  selectedNode,
  currentStepIndex,
  isPlayingAnimation,
  onTogglePlayAnimation,
  onSelectNode,
  variant = 'panel',
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


  return (
    <aside className={`${variant === 'panel' ? 'w-full bg-[rgba(255,251,244,0.82)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] rounded-[26px] shadow-[0_18px_48px_rgba(87,62,43,0.06)]' : 'w-full rounded-2xl'} h-full flex flex-col z-20 overflow-hidden select-none font-sans`}>
      {/* 1. Organ Header & Artwork Stamp */}
      <div className="p-4 border-b border-[rgba(117,91,70,0.14)] bg-white/40 space-y-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          {/* Circular Stamp Thumbnail */}
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-radial from-white to-[rgba(237,142,120,0.15)] border border-[rgba(117,91,70,0.18)] shadow-sm p-1">
            {architecture.thumbnail ? (
              <img
                src={architecture.thumbnail}
                alt={architecture.name}
                className="w-full h-full object-cover rounded-full mix-blend-multiply"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-[#eb7c6b]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c] block mb-0.5">
              SYSTEM SPECIMEN
            </span>
            <h1 className="font-serif font-medium text-2xl text-[#2f2a27] leading-tight truncate">
              {architecture.name}
            </h1>
            <em className="text-xs font-cursive italic text-[#8d6bcc] block mt-0.5">
              {architecture.badge}
            </em>
          </div>
        </div>

        {/* Research Paper Citation Link */}
        {architecture.paperUrl && (
          <a
            href={architecture.paperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-xl bg-[#f3eee5] border border-[rgba(117,91,70,0.14)] hover:bg-[#e8e3d8] text-[10px] font-mono text-[#2f2a27] transition-all"
            title={`Read research paper: ${architecture.paperTitle}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 text-[#eb7c6b] flex-shrink-0" />
              <span className="truncate font-semibold">{architecture.paperTitle}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-[#8d847c] flex-shrink-0" />
          </a>
        )}

        {/* Live Training Simulator Bar */}
        <div className="flex items-center justify-between bg-[#2f2a27] text-white p-2.5 rounded-xl font-mono shadow-inner">
          <div>
            <span className="text-[9px] text-[#8d847c] block uppercase">Epoch Iteration</span>
            <span className="text-xs font-bold text-[#eb7c6b]">{epoch} / 50</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTraining}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white transition-all"
              title="Reset Training"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleTraining}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                isTrainingRunning || isPlayingAnimation
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-gradient-to-r from-[#ed8a72] to-[#e87868] text-white hover:shadow-lg'
              }`}
            >
              {isTrainingRunning || isPlayingAnimation ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Train Pass</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {/* Active Component Calculation Card */}
        <AnimatePresence mode="wait">
          {activeStep && activeNode && (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="p-3.5 bg-[#eb7c6b] text-white rounded-[18px] space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-white/90 font-bold uppercase">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-white animate-pulse" />
                  STEP {currentStepIndex}/{steps.length}: {activeStep.title}
                </span>
              </div>

              {/* Math Equation */}
              <div className="p-2 bg-[#2f2a27] text-[#eb7c6b] rounded-xl font-mono text-xs border border-[#eb7c6b]/40 shadow-inner">
                <span className="text-[8px] text-[#8d847c] uppercase block font-sans font-bold">Executing Math Equation:</span>
                <code>{activeStep.realWorldCalculation}</code>
              </div>

              {/* Output Tensor */}
              <div className="flex items-center justify-between text-xs font-mono bg-white/20 p-2 rounded-xl border border-white/30 backdrop-blur-sm">
                <span className="text-white/90 font-sans font-medium">Output Tensor:</span>
                <span className="font-bold text-white">{activeNode.outputTensor.expression}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-world story: what it solves, what goes in, what comes out */}
        {STORIES[architecture.id] && (
          <div className="p-3.5 rounded-[18px] bg-white/80 border border-[rgba(117,91,70,0.14)] space-y-2 text-xs">
            <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c] block">Solves real problems</span>
            <ul className="space-y-1">
              {STORIES[architecture.id].problems.map((p) => (
                <li key={p.title} className="text-[#2f2a27]">
                  <b>{p.title}</b> <span className="text-[#8d847c]">— {p.example}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 pt-1 border-t border-[rgba(117,91,70,0.1)]">
              <span className="font-mono text-[9px] font-bold text-[#8d847c] pt-0.5">IN</span>
              <span className="font-serif italic text-[#2f2a27]">{STORIES[architecture.id].input.value}</span>
              <span className="font-mono text-[9px] font-bold text-emerald-700 pt-0.5">OUT</span>
              <span className="font-semibold text-emerald-800">{STORIES[architecture.id].output.value}</span>
            </div>
            <button onClick={() => useAppStore.getState().openModal('study')} className="w-full py-1.5 rounded-xl bg-[#2f2a27] text-white text-[11px] font-semibold">
              Study & remember →
            </button>
          </div>
        )}

        {/* Yellow Tip Sticky Note */}
        <div className="p-3.5 rounded-[18px] bg-[#fff2c9] text-[#534a43] space-y-1 shadow-[0_7px_13px_rgba(93,69,43,0.11)] border border-[#f0e2b0]">
          <div className="flex items-center justify-between font-cursive italic text-xs font-bold text-[#8d6bcc]">
            <span>💡 Quick Learning Tip</span>
            <Bookmark className="w-3.5 h-3.5 text-[#eb7c6b]" />
          </div>
          <p className="text-xs font-sans leading-relaxed text-[#534a43]">
            "{activeNode?.fiveYearOldWhy || activeNode?.description || architecture.description}"
          </p>
        </div>

        {/* Key Points Bullet List */}
        <div className="p-3.5 rounded-[18px] bg-white/70 border border-[rgba(117,91,70,0.14)] space-y-2 font-sans text-xs">
          <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c] block">
            KEY ARCHITECTURE SPECIFICATIONS
          </span>
          <ul className="space-y-2 text-[#2f2a27]">
            <li className="flex items-start gap-2">
              <span className="text-[#eb7c6b] font-bold">◇</span>
              <span><strong>Primary Field:</strong> {architecture.keyFacts.primaryUse}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#eb7c6b] font-bold">♙</span>
              <span><strong>Key Innovation:</strong> {architecture.keyFacts.keyInnovations}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#eb7c6b] font-bold">⌁</span>
              <span><strong>First Invented:</strong> {architecture.keyFacts.inventedYear}</span>
            </li>
          </ul>
        </div>

        {/* End-to-End Component Sequence */}
        <div className="space-y-2 pt-1">
          <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c] block px-1">
            SEQUENCE PATHWAY ({architecture.components.length} NODES)
          </span>

          {architecture.components.map((comp, index) => {
            const isSelected = selectedNode?.id === comp.id;
            const stepNumber = index + 1;

            return (
              <button
                key={comp.id}
                onClick={() => onSelectNode(comp)}
                className={`w-full text-left p-3 rounded-[15px] border transition-all duration-300 space-y-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[rgba(253,234,226,0.85)] border-[#eb7c6b]/60 shadow-sm'
                    : 'bg-white/60 border-[rgba(117,91,70,0.14)] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#eb7c6b] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {stepNumber}
                    </span>
                    <h4 className="font-serif font-medium text-sm text-[#2f2a27]">
                      {comp.name}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-[#8d847c] uppercase">
                    {comp.category}
                  </span>
                </div>
                <p className="text-[10px] text-[#8d847c] font-sans truncate">
                  Out: {comp.outputTensor.expression}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Footer Creator & GitHub Links */}
      <div className="p-3 bg-[#2f2a27] text-white border-t border-stone-800 space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c46854] to-[#efb59c] text-white font-bold text-[10px] flex items-center justify-center font-sans">
              BV
            </div>
            <span className="font-serif font-medium text-xs text-[#eb7c6b]">
              Bala Venkatesh
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/balavenkatesh3322/neural-decode-3d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-stone-300 hover:text-white flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-md border border-stone-700 hover:border-[#eb7c6b] transition-all"
              title="GitHub Repository"
            >
              <Github className="w-3 h-3 text-[#eb7c6b]" />
              <span>GitHub</span>
            </a>

            <a
              href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[#eb7c6b] hover:text-white flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-md border border-stone-700 hover:border-[#eb7c6b] transition-all"
              title="Portfolio Website"
            >
              <span>Portfolio</span>
              <Globe className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
