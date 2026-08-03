import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  BarChart2,
  Zap,
} from 'lucide-react';

export const TextGenerationSimulator: React.FC = () => {
  const [promptText, setPromptText] = useState<string>('The neural network predicts');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([' complexity', ' accurately', ' in 3D']);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Simulated vocabulary logits for current step
  const vocabPredictions = [
    { token: ' complexity', prob: 78.4, logit: 12.45 },
    { token: ' patterns', prob: 14.2, logit: 9.82 },
    { token: ' representations', prob: 4.8, logit: 7.64 },
    { token: ' matrices', prob: 2.6, logit: 6.12 },
  ];

  const steps = [
    {
      id: 0,
      title: '1. BPE Tokenization & Embedding Matrix',
      subtitle: 'Text Prompt → Integer Token IDs → 4096-Dim Vector Space',
      details: 'Converts raw string into BPE subword tokens [1024, 4821, 9102] and retrieves initial dense embeddings E ∈ ℝ^(N × D).',
    },
    {
      id: 1,
      title: '2. Multi-Head Self-Attention (Q, K, V Matrix)',
      subtitle: 'Q · Kᵀ / √d_k → Softmax Attention Scores',
      details: 'Calculates query-key dot products across 32 attention heads to weight contextual relationships between words.',
    },
    {
      id: 2,
      title: '3. FeedForward Network (SwiGLU & Residual)',
      subtitle: 'Hidden Projection 4096 → 14336 → 4096',
      details: 'Applies gated non-linear activations and adds skip-connections: LayerNorm(x + FFN(x)).',
    },
    {
      id: 3,
      title: '4. Final LM Head & Softmax Probability Logits',
      subtitle: 'Linear(4096 → 128,000 Vocab) → Auto-regressive Sampling',
      details: 'Projects final hidden vector onto vocabulary logits to sample the next predicted token with highest probability.',
    },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Auto-regressive next token append
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(0);
      }, 600);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Interactive Prompt Input Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.18)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-[#eb7c6b] uppercase flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            INPUT TEXT PROMPT (AUTO-REGRESSIVE GENERATOR)
          </label>
          <span className="text-[10px] font-mono font-bold text-[#8d6bcc] bg-[#8d6bcc]/10 px-2 py-0.5 rounded border border-[#8d6bcc]/20">
            LLM DECODER ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.18)] text-sm font-medium text-[#2f2a27] focus:outline-none focus:ring-2 focus:ring-[#eb7c6b]/50"
            placeholder="Type any prompt..."
          />
          <button
            onClick={handleNextStep}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ed8a72] to-[#e87868] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all border border-[#eb7c6b]/40 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-spin text-sm">✦</span>
            ) : (
              <>
                <span>{currentStep === steps.length - 1 ? 'Sample Token' : 'Next Layer Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Live Prompt Output Preview */}
        <div className="p-3 rounded-xl bg-[#fff2c9] border border-[#f0e2b0] flex items-center gap-2 text-xs text-[#534a43]">
          <span className="font-bold text-[#2f2a27]">Current Context Stream:</span>
          <span className="font-serif italic text-sm text-[#2f2a27]">"{promptText}"</span>
          <span className="font-serif font-bold text-sm text-[#eb7c6b] bg-white px-2 py-0.5 rounded border border-[#eb7c6b]/30 shadow-xs">
            {generatedTokens.slice(0, currentStep + 1).join('')}
          </span>
        </div>
      </div>

      {/* Layer Step Progression Pipeline Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isPassed = step.id < currentStep;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
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

      {/* Active Layer Deep Calculation Inspector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-[24px] bg-white border border-[rgba(117,91,70,0.18)] shadow-md space-y-5"
        >
          {/* Stage Header */}
          <div className="flex items-start justify-between border-b border-[rgba(117,91,70,0.12)] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                LAYER DECODING SPECIMEN • STEP {currentStep + 1} OF 4
              </span>
              <h3 className="font-serif font-medium text-xl text-[#2f2a27] mt-0.5">
                {steps[currentStep].title}
              </h3>
              <p className="text-xs text-[#8d847c] mt-1 font-mono">
                {steps[currentStep].subtitle}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#f7f0e7] text-[#2f2a27] text-xs font-mono font-bold border border-[rgba(117,91,70,0.14)]">
              {steps[currentStep].details}
            </span>
          </div>

          {/* Interactive Calculation Visualizer Content */}
          {currentStep === 0 && (
            <div className="grid grid-cols-3 gap-3">
              {['The', 'neural', 'predicts'].map((word, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.14)] text-center space-y-1">
                  <span className="text-[9px] font-mono text-[#8d847c] block">TOKEN ID: #{1024 + idx * 379}</span>
                  <span className="font-serif font-bold text-sm text-[#2f2a27]">"{word}"</span>
                  <span className="text-[10px] font-mono text-[#eb7c6b] block">Vector [0.42, -0.81, 0.19...]</span>
                </div>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                32-HEAD ATTENTION HEATMAP SCORES (QKᵀ / √d_k)
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                {['0.94 (Self)', '0.82 (Context)', '0.64 (Relation)', '0.91 (Target)'].map((score, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#eb7c6b]/10 border border-[#eb7c6b]/30 text-xs font-bold text-[#eb7c6b]">
                    Head #{i + 1}: {score}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-4 rounded-xl bg-stone-900 text-white font-mono text-xs space-y-2">
              <span className="text-[10px] text-[#eb7c6b] font-bold block uppercase">SwiGLU GATED NON-LINEAR PROJECTION</span>
              <code>FFN(x) = (Swish(x · W_gate) ⊗ (x · W_up)) · W_down</code>
              <p className="text-[10px] text-stone-400">
                Expanded dimensions to 14,336 channels for deep semantic reasoning.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                TOP PREDICTED NEXT TOKENS (LOGITS & SOFTMAX DISTRIBUTION)
              </span>
              <div className="space-y-2">
                {vocabPredictions.map((pred, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.14)]">
                    <span className="font-serif font-bold text-sm text-[#2f2a27] w-32 truncate">
                      "{pred.token}"
                    </span>
                    <div className="flex-1 bg-white h-3 rounded-full overflow-hidden border border-[rgba(117,91,70,0.14)] p-0.5">
                      <div
                        className="bg-gradient-to-r from-[#ed8a72] to-[#e87868] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pred.prob}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs text-[#eb7c6b] w-16 text-right">
                      {pred.prob}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
