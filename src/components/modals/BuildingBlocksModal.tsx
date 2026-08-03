import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEURAL_COMPONENTS_DATA } from '../../data/neuralComponentsData';
import { NeuralComponentDetail, ComponentCategory } from '../../types/components';
import { WeightBiasSandbox } from '../sandboxes/WeightBiasSandbox';
import { ActivationSandbox } from '../sandboxes/ActivationSandbox';
import {
  BookMarked,
  X,
  Search,
  Sliders,
  PlusCircle,
  Zap,
  Cpu,
  Target,
  TrendingDown,
  Shuffle,
  Compass,
  Code,
  Calculator,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Activity,
} from 'lucide-react';

interface BuildingBlocksModalProps {
  onClose: () => void;
}

export const BuildingBlocksModal: React.FC<BuildingBlocksModalProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeComponentId, setActiveComponentId] = useState<string>(NEURAL_COMPONENTS_DATA[0].id);
  const [selectedPhase, setSelectedPhase] = useState<'before' | 'while' | 'after'>('while');

  const filteredComponents = useMemo(() => {
    return NEURAL_COMPONENTS_DATA.filter((comp) => {
      const catMatch = selectedCategory === 'all' || comp.category === selectedCategory;
      const searchMatch =
        searchQuery.trim() === '' ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.fiveYearOldSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.realWorldAnalogy.title.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  const activeComp = useMemo(
    () => NEURAL_COMPONENTS_DATA.find((c) => c.id === activeComponentId) || NEURAL_COMPONENTS_DATA[0],
    [activeComponentId]
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 14 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-[#FBF9F5] border border-[#E8E3D8] rounded-3xl max-w-6xl w-full h-[90vh] shadow-2xl overflow-hidden flex flex-col z-10 font-sans"
        >
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#eb7c6b] uppercase">
                Neural Core Components Encyclopedia
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                Atomic Component Inspector & Training Mechanics
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components, 5yo analogies..."
                className="w-60 pl-9 pr-3 py-1.5 text-xs bg-[#F3EEE3] border border-[#E0D9C8] rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-stone-800"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2.5 bg-[#F3EEE3]/80 border-b border-[#E8E3D8] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Components (10)' },
            { id: 'fundamentals', label: 'Math Fundamentals' },
            { id: 'activations', label: 'Activation Functions' },
            { id: 'optimization', label: 'Loss & Backprop' },
            { id: 'regularization', label: 'Norm & Dropout' },
            { id: 'representation', label: 'Embeddings & QKV' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Component Navigation List */}
          <div className="w-80 h-full border-r border-[#E8E3D8] overflow-y-auto p-3 space-y-2 bg-[#FBF9F5] custom-scrollbar">
            {filteredComponents.map((comp) => {
              const isActive = comp.id === activeComp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setActiveComponentId(comp.id)}
                  className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-amber-100/80 border-amber-300 shadow-sm ring-1 ring-amber-400/40'
                      : 'bg-white border-[#E8E3D8] hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {comp.badge}
                    </span>
                    {isActive && <ChevronRight className="w-4 h-4 text-amber-600" />}
                  </div>

                  <h3 className="font-serif font-bold text-sm text-stone-900 mt-1">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 font-sans">
                    {comp.fiveYearOldSummary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Component Deep Detail Inspector */}
          <div className="flex-1 h-full overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
            {/* Title & 5-Year-Old Explanation Summary */}
            <div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {activeComp.categoryName}
              </span>
              <h2 className="font-serif font-bold text-3xl text-stone-900 mt-2">
                {activeComp.name}
              </h2>
            </div>

            {/* 5-Year-Old Simple Story Card (Highlight) */}
            <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md space-y-1">
              <div className="flex items-center gap-1.5 text-amber-100 font-mono text-[10px] font-bold uppercase">
                <HelpCircle className="w-3.5 h-3.5 text-amber-200" />
                <span>EXPLAIN LIKE I'M 5 YEARS OLD:</span>
              </div>
              <p className="font-serif font-bold text-base text-amber-50 leading-relaxed">
                "{activeComp.fiveYearOldSummary}"
              </p>
            </div>

            {/* 3-Phase Training Lifecycle Breakdown Card */}
            <div className="p-5 rounded-2xl bg-stone-900 text-stone-100 space-y-4 border border-stone-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                  <Activity className="w-4 h-4" />
                  <span>3-Phase Training Lifecycle Mechanics</span>
                </div>

                {/* Phase Selection Tabs */}
                <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl text-[10px] font-mono border border-stone-800">
                  <button
                    onClick={() => setSelectedPhase('before')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPhase === 'before' ? 'bg-slate-700 text-white font-bold' : 'text-stone-400'
                    }`}
                  >
                    1. Before Training
                  </button>
                  <button
                    onClick={() => setSelectedPhase('while')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPhase === 'while' ? 'bg-rose-600 text-white font-bold' : 'text-stone-400'
                    }`}
                  >
                    2. While Training (Backprop)
                  </button>
                  <button
                    onClick={() => setSelectedPhase('after')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPhase === 'after' ? 'bg-amber-500 text-white font-bold' : 'text-stone-400'
                    }`}
                  >
                    3. After Training (Learned)
                  </button>
                </div>
              </div>

              {/* Active Phase Content */}
              {selectedPhase === 'before' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">
                    STATUS: {activeComp.trainingPhases.beforeTraining.status}
                  </span>
                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    {activeComp.trainingPhases.beforeTraining.whatHappens}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs italic font-serif text-slate-200">
                    "{activeComp.trainingPhases.beforeTraining.explanation5yo}"
                  </div>
                </div>
              )}

              {selectedPhase === 'while' && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-900 space-y-2">
                  <span className="text-xs font-mono font-bold text-rose-300 block flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                    STATUS: {activeComp.trainingPhases.whileTraining.status}
                  </span>
                  <p className="text-xs text-stone-200 font-sans leading-relaxed">
                    {activeComp.trainingPhases.whileTraining.whatHappens}
                  </p>
                  <div className="p-2.5 rounded-lg bg-rose-900/40 border border-rose-800 text-xs italic font-serif text-rose-100">
                    "{activeComp.trainingPhases.whileTraining.explanation5yo}"
                  </div>
                </div>
              )}

              {selectedPhase === 'after' && (
                <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-300 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    STATUS: {activeComp.trainingPhases.afterTraining.status}
                  </span>
                  <p className="text-xs text-stone-200 font-sans leading-relaxed">
                    {activeComp.trainingPhases.afterTraining.whatHappens}
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-900/40 border border-amber-800 text-xs italic font-serif text-amber-100">
                    "{activeComp.trainingPhases.afterTraining.explanation5yo}"
                  </div>
                </div>
              )}
            </div>

            {/* WHAT IS IT? & WHY IS IT NEEDED? Dual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F3EEE3]/70 border border-[#E0D9C8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-700 uppercase">
                  <Info className="w-4 h-4 text-amber-600" />
                  WHAT IS IT?
                </div>
                <p className="text-xs text-stone-800 leading-relaxed font-sans">
                  {activeComp.whatIsIt}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 uppercase">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  WHY IS IT NEEDED?
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-sans font-medium">
                  {activeComp.whyIsItNeeded}
                </p>
              </div>
            </div>

            {/* Real World Intuitive Analogy Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-850 text-white shadow-md border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold uppercase">
                <span>Real-World Everyday Analogy</span>
                <span className="text-[10px] text-stone-400">Mental Model</span>
              </div>
              <h4 className="font-serif font-bold text-lg text-amber-300">
                {activeComp.realWorldAnalogy.title}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {activeComp.realWorldAnalogy.description}
              </p>
            </div>

            {/* Interactive Sandbox */}
            {activeComp.sandboxType === 'weight-bias' && <WeightBiasSandbox />}
            {activeComp.sandboxType === 'activation' && <ActivationSandbox />}

            {/* Math Formula & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-2 border border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                  <Calculator className="w-4 h-4" />
                  Mathematical Equation
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-sm text-amber-200">
                  <code>{activeComp.mathFormula}</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-2 border border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Code className="w-4 h-4" />
                  PyTorch Implementation
                </div>
                <pre className="p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto">
                  <code>{activeComp.codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);
};
