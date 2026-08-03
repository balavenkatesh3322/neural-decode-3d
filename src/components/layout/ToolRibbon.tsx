import React from 'react';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Box,
  Scissors,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

interface ToolRibbonProps {
  isIsolated: boolean;
  isWireframe: boolean;
  isCrossSection: boolean;
  isAutoRotate: boolean;
  onResetView: () => void;
  onToggleIsolate: () => void;
  onToggleWireframe: () => void;
  onToggleCrossSection: () => void;
  onToggleAutoRotate: () => void;
  onOpenCompare: () => void;
}

export const ToolRibbon: React.FC<ToolRibbonProps> = ({
  isIsolated,
  isWireframe,
  isCrossSection,
  isAutoRotate,
  onResetView,
  onToggleIsolate,
  onToggleWireframe,
  onToggleCrossSection,
  onToggleAutoRotate,
  onOpenCompare,
}) => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E0D9C8] shadow-editorial z-10 select-none">
      {/* Reset Camera View */}
      <button
        onClick={onResetView}
        className="p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-amber-100/60 transition-all group relative"
        title="Reset Camera View"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-stone-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Reset View
        </span>
      </button>

      <div className="w-full h-px bg-stone-200" />

      {/* Isolate Node View */}
      <button
        onClick={onToggleIsolate}
        className={`p-2.5 rounded-xl transition-all group relative ${
          isIsolated
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
        }`}
        title="Isolate Active Node"
      >
        {isIsolated ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-stone-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {isIsolated ? 'Show All Layers' : 'Isolate Layer'}
        </span>
      </button>

      {/* Wireframe X-Ray Mode */}
      <button
        onClick={onToggleWireframe}
        className={`p-2.5 rounded-xl transition-all group relative ${
          isWireframe
            ? 'bg-stone-900 text-amber-400 shadow-sm'
            : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
        }`}
        title="Wireframe X-Ray Mode"
      >
        <Box className="w-4 h-4" />
        <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-stone-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Wireframe X-Ray
        </span>
      </button>

      {/* Cross-Section View */}
      <button
        onClick={onToggleCrossSection}
        className={`p-2.5 rounded-xl transition-all group relative ${
          isCrossSection
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/60'
        }`}
        title="Cross-Section Cutaway"
      >
        <Scissors className="w-4 h-4" />
        <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-stone-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Cross-Section View
        </span>
      </button>

      <div className="w-full h-px bg-stone-200" />

      {/* Model Compare */}
      <button
        onClick={onOpenCompare}
        className="p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-amber-100/60 transition-all group relative"
        title="Compare Models"
      >
        <ArrowRightLeft className="w-4 h-4" />
        <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-stone-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Compare Architectures
        </span>
      </button>
    </div>
  );
};
