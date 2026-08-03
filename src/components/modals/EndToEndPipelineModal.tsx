import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextGenerationSimulator } from '../simulators/TextGenerationSimulator';
import { ImageGenerationSimulator } from '../simulators/ImageGenerationSimulator';
import {
  X,
  Sparkles,
  Type,
  Image as ImageIcon,
  Cpu,
  Layers,
  Wand2,
  Globe,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const EndToEndPipelineModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [pipelineMode, setPipelineMode] = useState<'text' | 'image' | 'translation'>('translation');
  const [translationStep, setTranslationStep] = useState<number>(0);

  const translationSteps = [
    {
      id: 0,
      title: '1. Encoder Source Embeddings (English)',
      subtitle: 'Prompt: "Knowledge is power" → [1042, 8812, 3491]',
      details: 'Passes raw source tokens into sinusoidal positional embeddings E_enc ∈ ℝ^(3 × 4096).',
    },
    {
      id: 1,
      title: '2. Encoder Unmasked Self-Attention Memory',
      subtitle: 'Softmax(Q_enc K_encᵀ / √d_k) V_enc',
      details: 'Constructs unmasked 3×3 source attention matrix Z_enc storing English context.',
    },
    {
      id: 2,
      title: '3. Cross-Attention Encoder-Decoder Bridge',
      subtitle: 'Q_dec (Target Spanish) · K_encᵀ (Source English)',
      details: 'Connects Spanish target queries to English source memory keys to align translation semantics.',
    },
    {
      id: 3,
      title: '4. Decoder Target Output Generation (Spanish)',
      subtitle: 'Linear LM Head Logits → Softmax Sampling',
      details: 'Generates final Spanish translation: "El conocimiento es poder" with 98.6% confidence.',
    },
  ];

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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] rounded-[28px] max-w-5xl w-full h-[88vh] shadow-[0_24px_60px_rgba(87,62,43,0.15)] overflow-hidden flex flex-col z-10"
        >
          {/* Top Header */}
          <div className="p-5 border-b border-[rgba(117,91,70,0.14)] flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eb7c6b] text-white flex items-center justify-center shadow-md">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#eb7c6b] uppercase block">
                  REAL-WORLD AI GENERATION PIPELINE DECODER
                </span>
                <h2 className="font-serif font-medium text-2xl text-[#2f2a27] leading-tight">
                  End-to-End Layer-by-Layer Calculation Simulator
                </h2>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-[#f3eee5] border border-[rgba(117,91,70,0.18)]">
                <button
                  onClick={() => setPipelineMode('translation')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                    pipelineMode === 'translation'
                      ? 'bg-[#eb7c6b] text-white font-bold shadow-sm'
                      : 'text-[#8d847c] hover:text-[#2f2a27]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Seq2Seq Translation</span>
                </button>

                <button
                  onClick={() => setPipelineMode('text')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                    pipelineMode === 'text'
                      ? 'bg-[#eb7c6b] text-white font-bold shadow-sm'
                      : 'text-[#8d847c] hover:text-[#2f2a27]'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text Gen (LLM)</span>
                </button>

                <button
                  onClick={() => setPipelineMode('image')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                    pipelineMode === 'image'
                      ? 'bg-[#eb7c6b] text-white font-bold shadow-sm'
                      : 'text-[#8d847c] hover:text-[#2f2a27]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image Gen (Diffusion)</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-[rgba(117,91,70,0.18)] bg-white/40 flex items-center justify-center text-[#8d847c] hover:text-[#2f2a27] hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Simulator Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/40">
            {pipelineMode === 'translation' ? (
              <div className="space-y-6 font-sans">
                {/* Real-World Machine Translation Input & Output Cards */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] shadow-sm">
                  {/* Source English */}
                  <div className="p-4 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.14)] space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#8d847c] uppercase block">
                      ENGLISH SOURCE PROMPT (ENCODER IN)
                    </span>
                    <h4 className="font-serif font-bold text-lg text-[#2f2a27]">
                      "Knowledge is power"
                    </h4>
                  </div>

                  <ArrowRight className="w-6 h-6 text-[#eb7c6b] animate-pulse" />

                  {/* Target Spanish */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block">
                      SPANISH TRANSLATION (DECODER OUT)
                    </span>
                    <h4 className="font-serif font-bold text-lg text-emerald-950">
                      "El conocimiento es poder"
                    </h4>
                  </div>
                </div>

                {/* Machine Translation Progress Steps */}
                <div className="grid grid-cols-4 gap-2">
                  {translationSteps.map((step) => {
                    const isActive = step.id === translationStep;
                    const isPassed = step.id < translationStep;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setTranslationStep(step.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-300 relative ${
                          isActive
                            ? 'bg-white border-[#eb7c6b] shadow-md ring-2 ring-[#eb7c6b]/30'
                            : isPassed
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-white/40 border-[rgba(117,91,70,0.12)] text-[#8d847c]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold uppercase">
                            STAGE {step.id + 1}
                          </span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <h4 className="font-serif font-bold text-xs leading-snug line-clamp-1">
                          {step.title.split('.')[1]}
                        </h4>
                      </button>
                    );
                  })}
                </div>

                {/* Active Step Inner Calculation Specimen */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={translationStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 rounded-[24px] bg-white border border-[rgba(117,91,70,0.18)] shadow-md space-y-4"
                  >
                    <div className="border-b border-[rgba(117,91,70,0.12)] pb-3">
                      <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                        TRANSLATION INNER CALCULATION SPECIMEN • STEP {translationStep + 1} OF 4
                      </span>
                      <h3 className="font-serif font-medium text-xl text-[#2f2a27] mt-0.5">
                        {translationSteps[translationStep].title}
                      </h3>
                      <p className="text-xs text-[#8d847c] mt-1 font-mono">
                        {translationSteps[translationStep].subtitle}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#f7f0e7] text-xs text-[#2f2a27]">
                      {translationSteps[translationStep].details}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#fff2c9] text-[#534a43] text-xs font-serif italic border border-[#f0e2b0]">
                      <span className="font-mono text-[9px] font-bold uppercase text-[#8d6bcc] block not-italic mb-0.5">
                        TENSOR MATH EQUATION:
                      </span>
                      {translationStep === 0 && 'E_enc = Emb("Knowledge is power") + SinusoidalPos(1..3)'}
                      {translationStep === 1 && 'Z_enc = Softmax(Q_enc K_encᵀ / √4096) V_enc'}
                      {translationStep === 2 && 'Z_cross = Softmax(Q_dec K_encᵀ / √4096) V_enc'}
                      {translationStep === 3 && 'P("El conocimiento es poder") = Softmax(H W_vocab)'}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : pipelineMode === 'text' ? (
              <TextGenerationSimulator />
            ) : (
              <ImageGenerationSimulator />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
