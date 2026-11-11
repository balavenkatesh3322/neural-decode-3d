import React from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

/** One-time “how to read this scene” legend for first-time visitors. */
export const SceneTip: React.FC = () => {
  const dismissed = useAppStore((s) => s.prefs.tipDismissed);
  const setPrefs = useAppStore((s) => s.setPrefs);
  // the layer inspector uses the same corner: step aside while a layer is selected
  const selected = useAppStore((s) => !!s.selectedId);
  if (dismissed || selected) return null;
  const item = (color: string, shape: 'dot' | 'block', text: string) => (
    <span className="flex items-center gap-1.5">
      <span className={shape === 'dot' ? 'w-2.5 h-2.5 rounded-full flex-shrink-0' : 'w-3 h-2 rounded-sm flex-shrink-0'} style={{ background: color }} />
      {text}
    </span>
  );
  return (
    <div className="absolute z-20 top-[58px] left-2 right-2 lg:right-auto lg:left-[84px] lg:top-5 lg:max-w-[440px] p-3 rounded-2xl bg-[#2f2a27]/95 text-white shadow-xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#f5b3a8]">How to read this scene</div>
        <button onClick={() => setPrefs({ tipDismissed: true })} className="p-0.5 -m-0.5 text-white/60 hover:text-white" aria-label="Dismiss">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-1.5 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-white/85">
        {item('#E3A23B', 'dot', 'Glowing packets = tensors flowing')}
        {item('#3FA7C9', 'block', 'Blocks = layers, sized by their output')}
        {item('#eb7c6b', 'dot', 'Click any layer to learn what it does')}
        {item('#4E9F6B', 'dot', '▶ guided tour · drag to orbit · F full view')}
      </div>
      <button onClick={() => setPrefs({ tipDismissed: true })} className="mt-2 px-3 py-1 rounded-lg bg-[#eb7c6b] text-[11px] font-semibold">
        Got it
      </button>
    </div>
  );
};
