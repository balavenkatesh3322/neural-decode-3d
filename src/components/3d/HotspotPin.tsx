import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeComponent } from '../../types/architecture';
import { Info, X, Layers } from 'lucide-react';

interface HotspotPinProps {
  component: NodeComponent;
  isSelected: boolean;
  isModalOpen?: boolean;
  onSelect: () => void;
  onDeselect?: () => void;
}

export const HotspotPin: React.FC<HotspotPinProps> = ({ component, isSelected, isModalOpen = false, onSelect, onDeselect }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isModalOpen) return null;

  // Extract component sequence index number (e.g. comp-1 -> 1)
  const sequenceNum = component.id.split('-').pop() || '1';

  return (
    <group position={component.position}>
      <Html center distanceFactor={14} zIndexRange={[100, 0]}>
        <div className="relative group select-none">
          {/* Glowing Pin Button displaying Sequence Number [ 1 ], [ 2 ], [ 3 ] */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isSelected && onDeselect) {
                onDeselect();
              } else {
                onSelect();
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`px-2 py-1 rounded-full flex items-center gap-1 font-mono text-xs font-bold transition-all duration-300 shadow-2xl ${
              isSelected
                ? 'bg-amber-500 text-white ring-4 ring-amber-300 scale-125'
                : isHovered
                ? 'bg-cyan-500 text-white ring-2 ring-cyan-300 scale-110'
                : 'bg-stone-900/95 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {sequenceNum}
            </span>
            <span className="text-[10px] font-sans truncate max-w-[80px]">{component.name.split(' ')[0]}</span>
          </button>

          {/* Framer Motion Spring Animated Floating On-Screen 3D Callout Card */}
          <AnimatePresence>
            {(isHovered || isSelected) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, x: -10, y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: 0, y: '-50%' }}
                exit={{ opacity: 0, scale: 0.88, x: -10, y: '-50%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="absolute left-16 top-1/2 w-72 p-3.5 rounded-2xl bg-stone-900/95 text-white backdrop-blur-md border border-stone-700 shadow-2xl space-y-2.5 pointer-events-auto z-50 font-sans"
              >
                {/* Header with Sequence Badge & Explicit Close (X) Button */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-mono text-[10px] font-bold">
                      STEP {sequenceNum}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 uppercase">
                      {component.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeselect) onDeselect();
                    }}
                    className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
                    title="Close 3D Node Pin"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-serif font-bold text-sm text-white leading-tight">
                  {component.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-stone-300 leading-snug font-sans">
                  {component.description}
                </p>

                {/* 5-Year-Old Explanation Card */}
                {component.fiveYearOldWhy && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs text-amber-200 italic font-serif leading-snug">
                    "{component.fiveYearOldWhy}"
                  </div>
                )}

                {/* Dedicated Input & Output Tensor Cards */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  {/* Input Card */}
                  <div className="p-2 rounded-xl bg-stone-950/90 border border-stone-800 text-stone-300 space-y-0.5">
                    <span className="text-[8px] text-amber-400 font-bold uppercase block">INPUT DATA IN</span>
                    <span className="font-bold text-white truncate block">{component.inputTensor.name}</span>
                    <span className="text-[9px] text-stone-400 block">{component.inputTensor.expression}</span>
                  </div>

                  {/* Output Card */}
                  <div className="p-2 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 space-y-0.5">
                    <span className="text-[8px] text-emerald-400 font-bold uppercase block">OUTPUT PRODUCED</span>
                    <span className="font-bold text-white truncate block">{component.outputTensor.name}</span>
                    <span className="text-[9px] text-emerald-300 block">{component.outputTensor.expression}</span>
                  </div>
                </div>

                {/* Math Formula */}
                <div className="p-2 rounded-xl bg-stone-950 font-mono text-[10px] text-cyan-300 border border-stone-800 overflow-x-auto">
                  <code>{component.mathFormula}</code>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
};
