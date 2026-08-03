import React, { useState } from 'react';
import { Architecture } from '../../types/architecture';
import { BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Calculator, Sparkles } from 'lucide-react';

interface LessonModalProps {
  architecture: Architecture;
  onClose: () => void;
  onSelectStepNode: (nodeId: string, cameraTarget: [number, number, number], cameraPosition: [number, number, number]) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  architecture,
  onClose,
  onSelectStepNode,
}) => {
  const steps = architecture.dataFlowSteps;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = steps[currentStepIdx];
  const activeNode = architecture.components.find((c) => c.id === currentStep.activeNodeId);

  const handleStepChange = (idx: number) => {
    setCurrentStepIdx(idx);
    const targetStep = steps[idx];
    onSelectStepNode(targetStep.activeNodeId, targetStep.cameraTarget, targetStep.cameraPosition);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#FBF9F5] border border-[#E8E3D8] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 uppercase">
                Interactive Guided Tour • Step {currentStepIdx + 1} of {steps.length}
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                {architecture.name} Masterclass
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Step Progress Line */}
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleStepChange(idx)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'bg-amber-500 shadow-sm'
                    : idx < currentStepIdx
                    ? 'bg-stone-900'
                    : 'bg-stone-200'
                }`}
              />
            ))}
          </div>

          {/* Current Step Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-semibold text-2xl text-stone-900">
                {currentStep.title}
              </h3>
              {activeNode && (
                <span
                  className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: activeNode.color }}
                >
                  {activeNode.category}
                </span>
              )}
            </div>

            <p className="text-sm text-stone-700 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            {/* Active Node Detail Card */}
            {activeNode && (
              <div className="p-5 rounded-2xl bg-white border border-[#E0D9C8] space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-stone-700">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Calculator className="w-4 h-4" />
                    Node Equation & Mechanism
                  </span>
                  <span>{activeNode.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900 text-amber-300 font-mono text-sm border border-stone-800">
                  <code>{activeNode.mathFormula}</code>
                </div>
                <p className="text-xs text-stone-600 italic font-serif">
                  "{activeNode.explanation}"
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-stone-50">
                    <span className="text-[10px] text-stone-400 block">INPUT SHAPE</span>
                    <span className="font-semibold text-stone-800">{activeNode.inputTensor.expression}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50">
                    <span className="text-[10px] text-amber-700 block">OUTPUT SHAPE</span>
                    <span className="font-semibold text-amber-900">{activeNode.outputTensor.expression}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-[#E8E3D8] bg-white flex items-center justify-between">
          <button
            onClick={() => handleStepChange(Math.max(0, currentStepIdx - 1))}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none font-medium text-xs transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono font-semibold text-stone-500">
            Step {currentStepIdx + 1} / {steps.length}
          </span>

          <button
            onClick={() => {
              if (currentStepIdx < steps.length - 1) {
                handleStepChange(currentStepIdx + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-amber-500 hover:bg-amber-600 font-medium text-xs shadow-md transition-all"
          >
            <span>{currentStepIdx < steps.length - 1 ? 'Next Step' : 'Finish Tour'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
