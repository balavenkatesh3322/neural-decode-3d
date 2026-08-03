import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeComponent, Architecture } from '../../types/architecture';
import {
  X,
  Sparkles,
  Activity,
  Grid,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  Database,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

interface ComponentDetailModalProps {
  component: NodeComponent;
  architecture: Architecture;
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  architecture,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'flow' | 'analogy'>('matrix');

  // Synthetic Matrix Data Generator for Interactive 2D Weight Matrix Visualization
  const matrixData = Array.from({ length: 36 }, (_, i) => {
    const val = (Math.sin(i * 0.7 + 12) * 0.5 + 0.5).toFixed(2);
    return parseFloat(val);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2f2a27]/70 backdrop-blur-md"
        />

        {/* Modal Container (Matching Anatomy Atelier Styling) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] rounded-[28px] max-w-4xl w-full h-[85vh] shadow-[0_24px_60px_rgba(87,62,43,0.15)] overflow-hidden flex flex-col z-10"
        >
          {/* Header Bar */}
          <div className="p-5 border-b border-[rgba(117,91,70,0.14)] flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eb7c6b] text-white flex items-center justify-center shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#eb7c6b] uppercase block">
                  INTERNAL COMPONENT SPECIMEN • {component.category}
                </span>
                <h2 className="font-serif font-medium text-2xl text-[#2f2a27] leading-tight">
                  {component.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-[rgba(117,91,70,0.18)] bg-white/40 flex items-center justify-center text-[#8d847c] hover:text-[#2f2a27] hover:bg-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-5 py-2 border-b border-[rgba(117,91,70,0.12)] bg-[#f3eee5]/50 flex items-center gap-2">
            {[
              { id: 'matrix', label: 'Internal Weight Matrix', icon: Grid },
              { id: 'flow', label: 'Data Transformation Flow', icon: Activity },
              { id: 'analogy', label: '5yo Analogy & Explanation', icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
                      : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/40">
            {/* 1. Internal Tensor Weight Matrix Tab */}
            {activeTab === 'matrix' && (
              <div className="space-y-4 animate-modal-backdrop">
                <div className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                    INTERACTIVE WEIGHT MATRIX ARRAY
                  </span>
                  <p className="text-xs text-[#8d847c]">
                    Hover over parameter nodes to inspect internal weights and tensor values.
                  </p>
                </div>

                {/* 6x6 Matrix Grid */}
                <div className="grid grid-cols-6 gap-2 p-4 rounded-2xl bg-[#2f2a27] text-white border border-stone-800 shadow-inner font-mono">
                  {matrixData.map((val, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="p-3 rounded-xl border border-stone-700 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#eb7c6b]"
                      style={{
                        backgroundColor: `rgba(235, 124, 107, ${val * 0.85})`,
                      }}
                    >
                      <span className="text-[9px] text-stone-300 block">W[{Math.floor(idx / 6)},{idx % 6}]</span>
                      <span className="font-bold text-xs text-white">{val}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fff2c9] text-[#534a43] text-xs font-serif italic border border-[#f0e2b0]">
                  <span className="font-mono text-[9px] font-bold uppercase text-[#8d6bcc] block not-italic mb-0.5">
                    TENSOR EQUATION:
                  </span>
                  {component.outputTensor.expression}
                </div>
              </div>
            )}

            {/* 2. Input -> Output Data Transformation Flow Tab */}
            {activeTab === 'flow' && (
              <div className="space-y-4 animate-modal-backdrop">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]">
                  {/* Input Card */}
                  <div className="p-4 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.14)] space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#8d847c] uppercase block">
                      INPUT TENSOR DATA IN
                    </span>
                    <h5 className="font-serif font-bold text-sm text-[#2f2a27]">
                      {component.inputTensor.name}
                    </h5>
                    <span className="text-xs font-mono text-[#eb7c6b] block">
                      {component.inputTensor.expression}
                    </span>
                  </div>

                  <ArrowRight className="w-6 h-6 text-[#eb7c6b] animate-pulse" />

                  {/* Output Card */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block">
                      OUTPUT PRODUCED
                    </span>
                    <h5 className="font-serif font-bold text-sm text-emerald-950">
                      {component.outputTensor.name}
                    </h5>
                    <span className="text-xs font-mono text-emerald-800 block">
                      {component.outputTensor.expression}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] space-y-2 font-sans text-xs">
                  <span className="font-mono text-[10px] font-bold text-[#eb7c6b] uppercase block">
                    FUNCTIONAL ROLE IN {architecture.name.toUpperCase()}
                  </span>
                  <p className="text-[#2f2a27] leading-relaxed">
                    {component.description}
                  </p>
                </div>
              </div>
            )}

            {/* 3. 5yo Analogy Tab */}
            {activeTab === 'analogy' && (
              <div className="p-5 rounded-2xl bg-[#fff2c9] text-[#534a43] space-y-3 border border-[#f0e2b0] animate-modal-backdrop">
                <div className="flex items-center gap-2 font-cursive italic text-base font-bold text-[#8d6bcc]">
                  <Sparkles className="w-5 h-5 text-[#eb7c6b]" />
                  <span>5-Year-Old Explanation & Real-World Analogy</span>
                </div>
                <p className="text-sm font-serif italic leading-relaxed">
                  "{component.fiveYearOldWhy || component.description}"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
