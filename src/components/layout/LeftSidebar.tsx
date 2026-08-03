import React from 'react';
import { Architecture } from '../../types/architecture';
import { Layers, ChevronLeft, ChevronRight, Sparkles, Cpu, Eye, Network, Image as ImageIcon } from 'lucide-react';

interface LeftSidebarProps {
  architectures: Architecture[];
  activeArchitecture?: Architecture;
  selectedArchId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectArchitecture: (arch: Architecture) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  architectures,
  activeArchitecture,
  selectedArchId,
  isCollapsed = false,
  onToggleCollapse,
  onSelectArchitecture,
}) => {
  const currentArchId = selectedArchId || activeArchitecture?.id;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'llm':
        return <Cpu className="w-3.5 h-3.5 text-amber-600" />;
      case 'vision':
        return <Eye className="w-3.5 h-3.5 text-amber-700" />;
      case 'ssm':
        return <Network className="w-3.5 h-3.5 text-amber-800" />;
      case 'generative':
        return <ImageIcon className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  if (isCollapsed) {
    return (
      <aside
        onClick={onToggleCollapse}
        className="w-12 flex-shrink-0 h-full bg-[#FBF9F5]/95 backdrop-blur-md border-r border-[#E8E3D8] flex flex-col items-center py-4 z-20 shadow-md transition-all duration-300 select-none cursor-pointer group hover:bg-amber-100/50"
        title="Click to Open Architecture Library"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleCollapse) onToggleCollapse();
          }}
          className="p-2.5 rounded-xl bg-stone-900 text-amber-400 hover:bg-stone-800 shadow-md transition-all mb-6 group-hover:scale-110"
          title="Open Architecture Library"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="writing-mode-vertical font-mono text-xs uppercase font-bold text-stone-600 group-hover:text-amber-800 tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-600 rotate-90" />
          <span>Library ({architectures.length})</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 flex-shrink-0 h-full bg-[#FBF9F5]/95 backdrop-blur-md border-r border-[#E8E3D8] flex flex-col z-20 shadow-xl overflow-hidden transition-all duration-300 select-none">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-[#E8E3D8] flex items-center justify-between bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm text-stone-900 leading-tight">
              Architecture Library
            </h2>
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              All {architectures.length} Models Displayed
            </span>
          </div>
        </div>

        {/* Minimize Collapse Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
            title="Minimize Library"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Balanced Scroll Container with Natural Card Heights */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FBF9F5] custom-scrollbar">
        {architectures.map((arch) => {
          const isSelected = arch.id === currentArchId;
          return (
            <div
              key={arch.id}
              onClick={() => onSelectArchitecture(arch)}
              className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer space-y-2.5 font-sans relative overflow-hidden group ${
                isSelected
                  ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400/40 scale-[1.01]'
                  : 'bg-white/90 border-[#E8E3D8] hover:border-amber-400/60 hover:bg-white hover:shadow-sm'
              }`}
            >
              {/* Active Selection Left Border Accent */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
              )}

              {/* Square Image Thumbnail & Header Row */}
              <div className="flex items-center gap-3">
                {arch.thumbnail && (
                  <img
                    src={arch.thumbnail}
                    alt={arch.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-stone-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Title & Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getCategoryIcon(arch.category)}
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-900/80 truncate">
                        {arch.categoryName.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 flex-shrink-0 shadow-sm">
                      {arch.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xs text-stone-900 truncate leading-tight group-hover:text-amber-700 transition-colors">
                    {arch.name}
                  </h3>
                  <p className="text-[10px] text-stone-500 font-sans truncate mt-0.5">
                    {arch.subtitle}
                  </p>
                </div>
              </div>

              {/* Specs Footer Row */}
              <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[10px] font-mono text-stone-500">
                <span>{arch.keyFacts.primaryUse.split('&')[0]}</span>
                <span className="font-bold text-amber-600">{arch.components.length} 3D Nodes</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
