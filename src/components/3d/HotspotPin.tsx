import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeComponent } from '../../types/architecture';
import { Sparkles, Layers, Info } from 'lucide-react';

interface HotspotPinProps {
  position: [number, number, number];
  component: NodeComponent;
  isSelected: boolean;
  isHovered: boolean;
  stepNumber: number;
  onSelect: (component: NodeComponent) => void;
  onHover: (id: string | null) => void;
}

export const HotspotPin: React.FC<HotspotPinProps> = ({
  position,
  component,
  isSelected,
  isHovered,
  stepNumber,
  onSelect,
  onHover,
}) => {
  return (
    <Html
      position={position}
      center
      distanceFactor={15}
      zIndexRange={[100, 0]}
    >
      <div className="relative group select-none pointer-events-auto">
        {/* Hotspot 3D Pin Button with Sequence Step Badge [ 1 ], [ 2 ], [ 3 ] */}
        <motion.button
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(component);
          }}
          onPointerEnter={() => onHover(component.id)}
          onPointerLeave={() => onHover(null)}
          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-extrabold text-xs shadow-lg transition-all duration-300 ${
            isSelected
              ? 'bg-[#eb7c6b] text-white ring-4 ring-[#eb7c6b]/40 scale-110'
              : isHovered
              ? 'bg-stone-900 text-[#eb7c6b] ring-2 ring-[#eb7c6b]'
              : 'bg-white/90 text-[#2f2a27] border border-[rgba(117,91,70,0.2)] hover:bg-[#eb7c6b] hover:text-white'
          }`}
          title={`Step ${stepNumber}: ${component.name}`}
        >
          {stepNumber}
        </motion.button>

        {/* Anatomy Atelier Callout Popup Overlay on Hover/Selection */}
        <AnimatePresence>
          {(isSelected || isHovered) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-9 w-48 p-3 rounded-[14px] bg-[rgba(255,252,247,0.94)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_12px_30px_rgba(75,54,40,0.08)] pointer-events-none z-50 space-y-1.5"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f3eee5] text-[#2f2a27] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eb7c6b]" />
                  STEP {stepNumber}
                </span>
                <span className="text-[8px] font-mono uppercase text-[#8d847c]">
                  {component.category}
                </span>
              </div>

              {/* Title in Cormorant Garamond */}
              <h4 className="font-serif font-bold text-sm text-[#2f2a27] leading-tight">
                {component.name}
              </h4>

              {/* Tensor Expression */}
              <div className="text-[9px] font-mono text-[#eb7c6b] bg-[#eb7c6b]/10 px-1.5 py-0.5 rounded border border-[#eb7c6b]/20 truncate">
                {component.outputTensor.expression}
              </div>

              {/* 5-Year-Old Explanation Snippet */}
              <p className="text-[10px] font-serif italic text-[#8d847c] line-clamp-2 leading-relaxed">
                "{component.fiveYearOldWhy || component.description}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
};
