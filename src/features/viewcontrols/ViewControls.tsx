import React from 'react';
import { ZoomIn, ZoomOut, Scan, Search, Minus, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const btn = 'w-9 h-9 flex items-center justify-center rounded-xl transition-colors';
const idle = `${btn} text-[#534a43] hover:text-[#2f2a27] hover:bg-white`;

/** Zoom in / out / fit, and the magnifying lens. Keys: + − 0 L. */
export const ViewControls: React.FC = () => {
  const zoom = useAppStore((s) => s.zoomCamera);
  const lens = useAppStore((s) => s.lens);
  const toggleLens = useAppStore((s) => s.toggleLens);
  const setLensZoom = useAppStore((s) => s.setLensZoom);

  return (
    <div className="absolute z-20 right-2 top-1/2 -translate-y-1/2 lg:right-auto lg:top-auto lg:translate-y-0 lg:left-5 lg:bottom-5 flex flex-col items-center gap-1.5 select-none">
      {lens.on && (
        <div className="flex flex-col items-center gap-0.5 p-1 rounded-2xl bg-[#2f2a27] text-white shadow-lg" aria-label="Lens magnification">
          <button onClick={() => setLensZoom(lens.zoom * 1.5)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10" title="Stronger lens">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-[#f5b3a8]">{lens.zoom.toFixed(lens.zoom % 1 ? 1 : 0)}×</span>
          <button onClick={() => setLensZoom(lens.zoom / 1.5)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10" title="Weaker lens">
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex flex-col gap-0.5 p-1 rounded-2xl bg-[rgba(255,252,247,0.94)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] shadow-[0_12px_32px_rgba(87,62,43,0.1)]" role="group" aria-label="Zoom">
        <button onClick={() => zoom('in')} className={idle} title="Zoom in (+)" aria-label="Zoom in">
          <ZoomIn className="w-[18px] h-[18px]" />
        </button>
        <button onClick={() => zoom('out')} className={idle} title="Zoom out (−)" aria-label="Zoom out">
          <ZoomOut className="w-[18px] h-[18px]" />
        </button>
        <button onClick={() => zoom('fit')} className={idle} title="Fit the whole model (0)" aria-label="Fit whole model">
          <Scan className="w-[18px] h-[18px]" />
        </button>
        <div className="h-px mx-1.5 bg-[rgba(117,91,70,0.15)]" />
        <button
          onClick={toggleLens}
          className={lens.on ? `${btn} bg-[#eb7c6b] text-white shadow-md` : idle}
          title={lens.on ? 'Hide magnifying lens (L)' : 'Magnifying lens — hover to magnify details (L)'}
          aria-pressed={lens.on}
          aria-label="Magnifying lens"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
};
