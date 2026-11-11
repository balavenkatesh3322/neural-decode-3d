import React from 'react';
import { RotateCcw, Globe, Layers, Ruler, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useAppStore, ViewOptions } from '../../store/useAppStore';

const RibbonButton: React.FC<{ active?: boolean; title: string; onClick: () => void; children: React.ReactNode }> = ({ active, title, onClick, children }) => (
  <button
    onClick={onClick}
    title={title}
    aria-pressed={active}
    className={`w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all group relative ${
      active ? 'bg-[#eb7c6b] text-white shadow-md' : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/60'
    }`}
  >
    {children}
    <span className="hidden lg:block pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-lg bg-[#2f2a27] text-white text-[10px] font-sans opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {title}
    </span>
  </button>
);

/** Vertical viewport tool ribbon. All state lives in the app store. */
export const ToolRibbon: React.FC = () => {
  const view = useAppStore((s) => s.view);
  const toggle = useAppStore((s) => s.toggleView);
  const resetView = useAppStore((s) => s.resetView);
  const audio = useAppStore((s) => s.audio);
  const toggleAudio = useAppStore((s) => s.toggleAudio);
  const panels = useAppStore((s) => s.panels);
  const togglePanel = useAppStore((s) => s.togglePanel);
  const full = !panels.left && !panels.right;

  const btn = (key: keyof ViewOptions, title: string, icon: React.ReactNode) => (
    <RibbonButton active={view[key]} title={title} onClick={() => toggle(key)}>
      {icon}
    </RibbonButton>
  );

  const shapeTitle = !view.showShapes ? 'Show tensor shapes' : view.numericShapes ? 'Shapes: numbers → symbols' : 'Shapes: symbols → hide';
  const cycleShapes = () => {
    if (!view.showShapes) {
      toggle('showShapes');
      if (!view.numericShapes) toggle('numericShapes');
    } else if (view.numericShapes) toggle('numericShapes');
    else toggle('showShapes');
  };

  return (
    <div className="absolute top-2 left-2 right-2 lg:right-auto lg:top-5 lg:left-5 z-20 flex flex-row lg:flex-col gap-1 lg:gap-1.5 overflow-x-auto lg:overflow-visible bg-[rgba(255,251,244,0.88)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] p-1.5 lg:p-2 rounded-2xl lg:rounded-[20px] shadow-[0_12px_32px_rgba(87,62,43,0.08)] select-none" role="toolbar" aria-label="View tools">
      <RibbonButton title="Reset view & camera" onClick={resetView}>
        <RotateCcw className="w-5 h-5" />
      </RibbonButton>
      <span className="hidden lg:contents">
        <RibbonButton active={full} title={full ? 'Show side panels' : 'Full view: hide both side panels (F)'} onClick={() => togglePanel('both')}>
          {full ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </RibbonButton>
      </span>
      {btn('exploded', 'Exploded view: spread layers apart', <Layers className="w-5 h-5" />)}
      {btn('autoRotate', 'Auto-rotate camera', <Globe className={`w-5 h-5 ${view.autoRotate ? 'animate-spin [animation-duration:4s]' : ''}`} />)}
      <RibbonButton active={view.showShapes} title={shapeTitle} onClick={cycleShapes}>
        <span className="relative">
          <Ruler className="w-5 h-5" />
          {view.showShapes && (
            <span className="absolute -bottom-1.5 -right-2 text-[8px] font-mono font-bold">{view.numericShapes ? '123' : 'B,T'}</span>
          )}
        </span>
      </RibbonButton>
      <div className="w-px h-6 self-center lg:w-auto lg:h-px lg:self-auto bg-[rgba(117,91,70,0.15)] mx-0.5 lg:mx-1 flex-shrink-0" />
      <RibbonButton active={audio.sound} title={audio.sound ? 'Sound effects on' : 'Sound effects off'} onClick={() => toggleAudio('sound')}>
        {audio.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </RibbonButton>
    </div>
  );
};
