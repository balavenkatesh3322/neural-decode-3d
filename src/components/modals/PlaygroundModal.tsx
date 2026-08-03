import React, { useState } from 'react';
import { Architecture } from '../../types/architecture';
import { Flame, X, Sparkles, Send, Play, Terminal } from 'lucide-react';

interface PlaygroundModalProps {
  architecture: Architecture;
  onClose: () => void;
  onAnimateWithPrompt: (promptText: string) => void;
}

export const PlaygroundModal: React.FC<PlaygroundModalProps> = ({
  architecture,
  onClose,
  onAnimateWithPrompt,
}) => {
  const [inputText, setInputText] = useState('The quick brown fox jumps over the lazy dog');
  const [batchSize, setBatchSize] = useState('1');
  const [seqLen, setSeqLen] = useState('8');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimLogs([
      `[Tokenization] Input text encoded: "${inputText}"`,
      `[Embedding] Generating tensor shape (${batchSize}, ${seqLen}, 4096)...`,
      `[Forward Pass] Passing data through ${architecture.name} 3D layers...`,
      `[3D Visualization] Triggering signal pulse stream in canvas...`,
    ]);

    setTimeout(() => {
      setIsSimulating(false);
      onAnimateWithPrompt(inputText);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#FBF9F5] border border-[#E8E3D8] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 uppercase">
                Interactive Input Simulator
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                {architecture.name} Signal Playground
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

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Sample Input Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-stone-700 block">
              INPUT TEXT / PROMPT
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              className="w-full p-3 bg-white border border-[#E0D9C8] rounded-2xl text-xs text-stone-900 font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Type any sentence or code snippet to run through the 3D model..."
            />
          </div>

          {/* Tensor Dimensions Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                BATCH SIZE (B)
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono font-semibold text-stone-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                SEQUENCE LENGTH (T)
              </label>
              <input
                type="number"
                value={seqLen}
                onChange={(e) => setSeqLen(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono font-semibold text-stone-900"
              />
            </div>
          </div>

          {/* Simulation Console Log Box */}
          {simLogs.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-xs space-y-1.5 border border-stone-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>Simulation Execution Log</span>
              </div>
              {simLogs.map((log, idx) => (
                <div key={idx} className="text-[11px] text-stone-300">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E3D8] bg-white flex justify-end">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <span>Processing Forward Pass...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Inject Signal & Run 3D Animation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
