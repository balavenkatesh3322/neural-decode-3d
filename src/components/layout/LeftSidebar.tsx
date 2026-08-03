import React from 'react';
import { Architecture } from '../../types/architecture';
import { Layers, Sparkles, Heart, FileText, ExternalLink, Flame } from 'lucide-react';

interface LeftSidebarProps {
  architectures: Architecture[];
  activeArchitecture?: Architecture;
  selectedArchId?: string;
  onSelectArchitecture: (arch: Architecture) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  architectures,
  activeArchitecture,
  selectedArchId,
  onSelectArchitecture,
}) => {
  const currentArchId = selectedArchId || activeArchitecture?.id;

  // High-Resolution Crisp Technology Thumbnail Image Dataset
  const fallbackThumbnails: Record<string, string> = {
    transformer: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop',
    cnn: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop',
    moe: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    mamba: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop',
    diffusion: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=400&auto=format&fit=crop',
  };

  // Trending Upcoming Research Papers Dataset
  const upcomingPapers = [
    {
      id: 'deepseek-v3',
      name: 'DeepSeek-V3',
      subtitle: 'Multi-head Latent Attention & MoE',
      paperTitle: 'DeepSeek-V3 Technical Report',
      paperUrl: 'https://arxiv.org/abs/2412.19437',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'kimi-k1-5',
      name: 'Kimi k1.5',
      subtitle: 'Multimodal LLM Long-Context RL',
      paperTitle: 'Kimi k1.5: Multimodal LLM',
      paperUrl: 'https://arxiv.org/',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'qwen-2-5-coder',
      name: 'Qwen 2.5-Coder',
      subtitle: 'Code Reasoning & Agentic Execution',
      paperTitle: 'Qwen2.5-Coder Report',
      paperUrl: 'https://arxiv.org/abs/2409.12186',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'llama-3-3',
      name: 'Llama 3.3 70B',
      subtitle: 'Open Weights Multilingual Model',
      paperTitle: 'Llama 3 Herd of Models',
      paperUrl: 'https://arxiv.org/abs/2407.21783',
      thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'flux-1',
      name: 'FLUX.1 Schneller',
      subtitle: 'Flow Matching Image Generation',
      paperTitle: 'FLUX.1 Technical Overview',
      paperUrl: 'https://arxiv.org/abs/2408.00000',
      thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'sora-2',
      name: 'Sora 2.0 Video Engine',
      subtitle: 'Spatiotemporal Video Diffusion',
      paperTitle: 'Video Models World Simulators',
      paperUrl: 'https://openai.com/research/video-generation-models-as-world-simulators',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=200&auto=format&fit=crop',
    },
  ];

  return (
    <aside className="w-[285px] flex-shrink-0 h-full bg-[rgba(255,251,244,0.82)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] rounded-[26px] shadow-[0_18px_48px_rgba(87,62,43,0.06)] p-4 flex flex-col z-20 overflow-hidden transition-all duration-300 select-none font-sans">
      {/* Panel Heading */}
      <div className="h-[33px] flex items-center justify-between px-1 pb-2.5 flex-shrink-0 border-b border-[rgba(117,91,70,0.12)]">
        <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c]">
          EXPLORE ARCHITECTURES
        </span>
        <span className="text-[10px] font-mono font-bold text-[#eb7c6b]">
          {architectures.length} Active
        </span>
      </div>

      {/* Organ List Container */}
      <div className="flex-1 overflow-y-auto pt-2 space-y-3 custom-scrollbar">
        {/* Active Interactive 3D Models Section */}
        <div className="space-y-1">
          {architectures.map((arch) => {
            const isSelected = arch.id === currentArchId;
            const imgSrc = arch.thumbnail || fallbackThumbnails[arch.id] || fallbackThumbnails.transformer;

            return (
              <button
                key={arch.id}
                onClick={() => onSelectArchitecture(arch)}
                className={`w-full min-h-[70px] grid grid-cols-[54px_1fr_18px] items-center gap-2 text-left p-2 rounded-[15px] border transition-all duration-300 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-[rgba(253,234,226,0.72)] border-[#eb7c6b]/50 shadow-[0_8px_20px_rgba(195,91,70,0.07)]'
                    : 'bg-transparent border-transparent hover:bg-white/50 hover:border-[rgba(117,91,70,0.12)]'
                }`}
              >
                {/* Circular Thumbnail Glyph (Crisp contrast with zero transparency wash-out) */}
                <div className="w-[47px] h-[47px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white border border-[rgba(121,86,67,0.15)] shadow-sm p-0.5">
                  <img
                    src={imgSrc}
                    alt={arch.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackThumbnails.transformer;
                    }}
                  />
                </div>

                {/* Title & Category Info */}
                <div className="min-w-0 pr-1">
                  <b className="block font-serif font-medium text-[17px] leading-[1.1] text-[#2f2a27] truncate group-hover:text-[#eb7c6b] transition-colors">
                    {arch.name}
                  </b>
                  <small className="block mt-1 text-[10px] text-[#8d847c] font-sans truncate">
                    {arch.badge} • {arch.subtitle.split('&')[0]}
                  </small>
                </div>

                {/* Favorite Heart Icon */}
                <div className="flex justify-end">
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isSelected ? 'fill-[#ef8d7d] text-[#ef8d7d]' : 'text-stone-300 group-hover:text-[#ef8d7d]'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dedicated Trending Research Papers Showcase Section */}
        <div className="pt-3 border-t border-[rgba(117,91,70,0.14)] space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#eb7c6b]" />
              TRENDING PAPERS
            </span>
            <span className="text-[9px] font-mono font-bold text-[#8d6bcc] bg-[#8d6bcc]/10 px-1.5 py-0.5 rounded border border-[#8d6bcc]/20">
              COMING SOON
            </span>
          </div>

          <div className="space-y-1.5">
            {upcomingPapers.map((paper) => (
              <a
                key={paper.id}
                href={paper.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full grid grid-cols-[38px_1fr_auto] items-center gap-2.5 p-2 rounded-[14px] bg-white/40 border border-[rgba(117,91,70,0.1)] hover:bg-white/80 hover:border-[#eb7c6b]/30 transition-all text-left group"
                title={`Paper: ${paper.paperTitle}`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white border border-[rgba(117,91,70,0.12)] p-0.5">
                  <img
                    src={paper.thumbnail}
                    alt={paper.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-medium text-xs text-[#2f2a27] truncate group-hover:text-[#eb7c6b]">
                      {paper.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8d847c] font-sans truncate block">
                    {paper.subtitle}
                  </span>
                </div>

                <span className="text-[8px] font-mono font-bold text-[#8d847c] bg-[#f3eee5] px-1.5 py-0.5 rounded border border-[rgba(117,91,70,0.14)] uppercase flex-shrink-0">
                  SOON
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
