import React from 'react';
import {
  RotateCcw,
  Eye,
  Box,
  Slice,
  Globe,
  BarChart2,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ToolRibbonProps {
  isIsolated: boolean;
  isWireframe: boolean;
  isCrossSection: boolean;
  isAutoRotate: boolean;
  isExplodedView?: boolean;
  onResetView: () => void;
  onToggleIsolate: () => void;
  onToggleWireframe: () => void;
  onToggleCrossSection: () => void;
  onToggleAutoRotate: () => void;
  onToggleExplodedView?: () => void;
  onOpenCompare: () => void;
}

export const ToolRibbon: React.FC<ToolRibbonProps> = ({
  isIsolated,
  isWireframe,
  isCrossSection,
  isAutoRotate,
  isExplodedView = false,
  onResetView,
  onToggleIsolate,
  onToggleWireframe,
  onToggleCrossSection,
  onToggleAutoRotate,
  onToggleExplodedView,
  onOpenCompare,
}) => {
  return (
    <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 bg-[rgba(255,251,244,0.85)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] p-2 rounded-[20px] shadow-[0_12px_32px_rgba(87,62,43,0.08)] select-none">
      {/* 1. Reset 3D Viewport Button (RotateCcw) */}
      <button
        onClick={onResetView}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60 transition-all group relative"
        title="Reset 3D Viewport & Camera"
      >
        <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
      </button>

      {/* 2. Dismantle / Exploded Layers Toggle (Layers Icon) */}
      {onToggleExplodedView && (
        <button
          onClick={onToggleExplodedView}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
            isExplodedView
              ? 'bg-[#eb7c6b] text-white shadow-md ring-2 ring-[#eb7c6b]/40'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
          }`}
          title="Dismantle / Explode 3D Specimen Layers"
        >
          <Layers className={`w-5 h-5 ${isExplodedView ? 'animate-pulse' : 'group-hover:scale-110 text-[#eb7c6b]'} transition-transform`} />
        </button>
      )}

      {/* 3. Isolate Selected Layer (Eye Icon) */}
      <button
        onClick={onToggleIsolate}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
          isIsolated
            ? 'bg-[#eb7c6b] text-white shadow-md'
            : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
        }`}
        title="Isolate Layer Mesh"
      >
        <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 4. Wireframe X-Ray Mode (Box Icon) */}
      <button
        onClick={onToggleWireframe}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
          isWireframe
            ? 'bg-[#eb7c6b] text-white shadow-md'
            : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
        }`}
        title="Toggle X-Ray Wireframe"
      >
        <Box className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 5. Cross-Section Anatomical Cut (Slice Icon) */}
      <button
        onClick={onToggleCrossSection}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
          isCrossSection
            ? 'bg-[#eb7c6b] text-white shadow-md'
            : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
        }`}
        title="Cross-Section Anatomical Cut"
      >
        <Slice className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 6. Auto Rotate 3D Orbit (Globe Icon - Replaces Duplicate Refresh Icon) */}
      <button
        onClick={onToggleAutoRotate}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
          isAutoRotate
            ? 'bg-[#eb7c6b] text-white shadow-md'
            : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
        }`}
        title="Auto-Rotate 3D Orbit Camera"
      >
        <Globe className={`w-5 h-5 ${isAutoRotate ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
      </button>

      {/* 7. Compare Architectures (BarChart2 Icon) */}
      <button
        onClick={onOpenCompare}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8d847c] hover:text-[#eb7c6b] hover:bg-white/60 transition-all group relative"
        title="Compare Architectures"
      >
        <BarChart2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
