import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Wand2,
  Grid,
} from 'lucide-react';

export const ImageGenerationSimulator: React.FC = () => {
  const [promptText, setPromptText] = useState<string>('A futuristic glowing cybernetic brain in 3D');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [denoiseProgress, setDenoiseProgress] = useState<number>(0); // 0 to 100%

  const denoisingSteps = [
    {
      id: 0,
      title: '1. CLIP / T5 Prompt Text Conditioning',
      subtitle: 'Raw Prompt → Text Embedding Vector Space c ∈ ℝ^(77 × 768)',
      details: 'Extracts cross-attention prompt guidance vectors c to condition UNet spatial generation.',
      noiseBlur: 'blur-xl opacity-20',
      sampleImg: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 1,
      title: '2. Initial Latent Gaussian Noise Tensor (t = 1000)',
      subtitle: 'z_1000 ~ N(0, I) 4 × 64 × 64 Latent Grid',
      details: 'Initializes pure Gaussian noise latent tensor before UNet reverse diffusion steps.',
      noiseBlur: 'blur-lg opacity-40',
      sampleImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 2,
      title: '3. UNet Cross-Attention Denoising (t = 500 → 0)',
      subtitle: 'Predict Noise Residual ε_θ(z_t, t, c) & Subtract',
      details: 'Iteratively predicts and subtracts noise tensor across 4 down/up UNet cross-attention blocks.',
      noiseBlur: 'blur-xs opacity-80',
      sampleImg: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 3,
      title: '4. VAE Latent Decoder RGB Reconstruction',
      subtitle: 'z_0 (4 × 64 × 64) → VAE Decoder → RGB (3 × 512 × 512)',
      details: 'Converts cleaned latent vector z_0 back into a crisp, high-resolution 3D digital image.',
      noiseBlur: 'blur-none opacity-100',
      sampleImg: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Interactive Image Prompt Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.18)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-[#eb7c6b] uppercase flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            IMAGE GENERATION PROMPT (LATENT DIFFUSION SIMULATOR)
          </label>
          <span className="text-[10px] font-mono font-bold text-[#8d6bcc] bg-[#8d6bcc]/10 px-2 py-0.5 rounded border border-[#8d6bcc]/20">
            LATENT DIFFUSION ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.18)] text-sm font-medium text-[#2f2a27] focus:outline-none focus:ring-2 focus:ring-[#eb7c6b]/50"
            placeholder="Describe an image..."
          />
          <button
            onClick={() => setCurrentStep((prev) => (prev < 3 ? prev + 1 : 0))}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ed8a72] to-[#e87868] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all border border-[#eb7c6b]/40"
          >
            <span>{currentStep === 3 ? 'Restart Denoising' : 'Denoise Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Denoising Stage Steps Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {denoisingSteps.map((step) => {
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
                  STEP {step.id + 1}
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

      {/* Active Denoising Step Visualizer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-6 p-3 sm:p-6 rounded-[24px] bg-white border border-[rgba(117,91,70,0.18)] shadow-md"
        >
          {/* Latent Visualizer Frame */}
          <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border border-[rgba(117,91,70,0.18)] bg-[#2f2a27] flex items-center justify-center shadow-inner">
            <img
              src={denoisingSteps[currentStep].sampleImg}
              alt="Denoised Latent"
              className={`w-full h-full object-cover transition-all duration-700 ${denoisingSteps[currentStep].noiseBlur}`}
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#2f2a27]/80 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-stone-700">
              TIMESTEP t = {1000 - currentStep * 333}
            </div>
          </div>

          {/* Denoising Info & Inner Calculations */}
          <div className="space-y-4 flex flex-col justify-center">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#eb7c6b] uppercase block">
                UNet DENOISING SPECIMEN • STEP {currentStep + 1} OF 4
              </span>
              <h3 className="font-serif font-medium text-xl text-[#2f2a27] mt-0.5">
                {denoisingSteps[currentStep].title}
              </h3>
              <p className="text-xs text-[#8d847c] mt-1 font-mono">
                {denoisingSteps[currentStep].subtitle}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f7f0e7] border border-[rgba(117,91,70,0.14)] text-xs text-[#2f2a27]">
              {denoisingSteps[currentStep].details}
            </div>

            <div className="p-3 rounded-xl bg-[#fff2c9] text-[#534a43] text-xs font-serif italic border border-[#f0e2b0]">
              <span className="font-mono text-[9px] font-bold uppercase text-[#8d6bcc] block not-italic mb-0.5">
                LATENT EQUATION:
              </span>
              z_(t-1) = 1/√α_t · (z_t - (1 - α_t)/√(1 - ᾱ_t) · ε_θ(z_t, t, c))
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
