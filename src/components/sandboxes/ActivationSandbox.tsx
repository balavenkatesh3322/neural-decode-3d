import React, { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export const ActivationSandbox: React.FC = () => {
  const [selectedFunc, setSelectedFunc] = useState<'relu' | 'sigmoid' | 'gelu' | 'silu'>('relu');
  const [inputVal, setInputVal] = useState<number>(1.2);

  const calculateOutput = (x: number, func: string) => {
    switch (func) {
      case 'relu':
        return Math.max(0, x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'gelu':
        return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
      case 'silu':
        return x / (1 + Math.exp(-x));
      default:
        return Math.max(0, x);
    }
  };

  const outputVal = calculateOutput(inputVal, selectedFunc);

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E0D9C8] space-y-4 text-xs font-sans shadow-sm select-none">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <span className="font-mono font-bold text-[#8B5CF6] text-xs uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Interactive Activation Function Curve Plotter
        </span>
      </div>

      {/* Function Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl font-mono text-[11px]">
        {[
          { id: 'relu', label: 'ReLU' },
          { id: 'sigmoid', label: 'Sigmoid' },
          { id: 'gelu', label: 'GELU' },
          { id: 'silu', label: 'SiLU/Swish' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFunc(f.id as any)}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              selectedFunc === f.id
                ? 'bg-stone-900 text-amber-400 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Input Slider */}
      <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-1">
        <div className="flex justify-between font-mono">
          <span className="font-semibold text-purple-900">Input Value (z)</span>
          <span className="font-bold text-purple-700">{inputVal.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="-4"
          max="4"
          step="0.1"
          value={inputVal}
          onChange={(e) => setInputVal(parseFloat(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {/* Function Curve SVG Plotter */}
      <div className="relative w-full h-36 bg-stone-900 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="-40 -25 80 50">
          <line x1="-40" y1="0" x2="40" y2="0" stroke="#334155" strokeWidth="0.8" />
          <line x1="0" y1="-25" x2="0" y2="25" stroke="#334155" strokeWidth="0.8" />

          {/* Curve Path Points */}
          <polyline
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            points={Array.from({ length: 81 }).map((_, i) => {
              const x = (i - 40) * 0.1;
              const y = calculateOutput(x, selectedFunc);
              return `${x * 10},${-y * 10}`;
            }).join(' ')}
          />

          {/* Active Input Point Marker */}
          <circle
            cx={inputVal * 10}
            cy={-outputVal * 10}
            r="3.5"
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute top-2 left-3 px-2 py-1 rounded bg-stone-950/80 text-amber-300 font-mono text-[10px] border border-stone-800">
          f({inputVal.toFixed(2)}) = <span className="font-bold text-white">{outputVal.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};
