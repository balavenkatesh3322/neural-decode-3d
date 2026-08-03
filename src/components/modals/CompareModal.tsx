import React, { useState } from 'react';
import { Architecture } from '../../types/architecture';
import { ALL_ARCHITECTURES } from '../../data/architectures';
import { ArrowRightLeft, X, Check, Zap, Cpu } from 'lucide-react';

interface CompareModalProps {
  currentArchitecture: Architecture;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  currentArchitecture,
  onClose,
}) => {
  const [archA, setArchA] = useState<Architecture>(currentArchitecture);
  const [archB, setArchB] = useState<Architecture>(
    ALL_ARCHITECTURES.find((a) => a.id !== currentArchitecture.id) || ALL_ARCHITECTURES[1]
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#FBF9F5] border border-[#E8E3D8] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 uppercase">
                Comparative Architecture Matrix
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                Side-by-Side Model Comparison
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Comparison Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Selectors Header */}
          <div className="grid grid-cols-2 gap-4">
            {/* Arch A Selector */}
            <div className="p-4 rounded-2xl bg-white border border-[#E0D9C8] space-y-2">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block">
                MODEL A
              </label>
              <select
                value={archA.id}
                onChange={(e) =>
                  setArchA(ALL_ARCHITECTURES.find((a) => a.id === e.target.value)!)
                }
                className="w-full p-2 bg-[#F3EEE3] rounded-xl font-serif font-semibold text-sm border border-stone-300 text-stone-900 focus:outline-none"
              >
                {ALL_ARCHITECTURES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.badge})
                  </option>
                ))}
              </select>
              <p className="text-xs text-stone-500 font-sans italic">{archA.subtitle}</p>
            </div>

            {/* Arch B Selector */}
            <div className="p-4 rounded-2xl bg-white border border-[#E0D9C8] space-y-2">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block">
                MODEL B
              </label>
              <select
                value={archB.id}
                onChange={(e) =>
                  setArchB(ALL_ARCHITECTURES.find((a) => a.id === e.target.value)!)
                }
                className="w-full p-2 bg-[#F3EEE3] rounded-xl font-serif font-semibold text-sm border border-stone-300 text-stone-900 focus:outline-none"
              >
                {ALL_ARCHITECTURES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.badge})
                  </option>
                ))}
              </select>
              <p className="text-xs text-stone-500 font-sans italic">{archB.subtitle}</p>
            </div>
          </div>

          {/* Comparison Criteria Table */}
          <div className="space-y-3">
            {[
              {
                label: 'Primary Domain',
                valA: archA.keyFacts.primaryUse,
                valB: archB.keyFacts.primaryUse,
              },
              {
                label: 'Parameter Capacity',
                valA: archA.keyFacts.paramCount,
                valB: archB.keyFacts.paramCount,
              },
              {
                label: 'Context Window Scaling',
                valA: archA.keyFacts.contextLength || 'N/A',
                valB: archB.keyFacts.contextLength || 'N/A',
              },
              {
                label: 'Invented Year & Author',
                valA: archA.keyFacts.inventedYear,
                valB: archB.keyFacts.inventedYear,
              },
              {
                label: 'Key Architectural Breakthrough',
                valA: archA.keyFacts.keyInnovations,
                valB: archB.keyFacts.keyInnovations,
              },
              {
                label: 'Node Components Count',
                valA: `${archA.components.length} 3D Blocks`,
                valB: `${archB.components.length} 3D Blocks`,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-stone-200 grid grid-cols-5 items-center text-xs"
              >
                <div className="col-span-2 font-medium text-stone-800 pr-2">
                  {row.valA}
                </div>
                <div className="col-span-1 text-center font-mono font-bold text-[10px] text-amber-800 uppercase px-1 bg-amber-50 py-1 rounded">
                  {row.label}
                </div>
                <div className="col-span-2 text-right font-medium text-stone-800 pl-2">
                  {row.valB}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E3D8] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white font-medium text-xs hover:bg-stone-800 transition-all shadow-md"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
