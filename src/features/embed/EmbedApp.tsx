import React, { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { CanvasContainer } from '../../components/3d/CanvasContainer';
import { TourPlayer } from '../tour/TourPlayer';
import { useTourDriver } from '../tour/useTourDriver';
import { useArchitectureModel } from '../../engine/useArchitectureModel';
import { useAppStore } from '../../store/useAppStore';
import { setSfxEnabled } from '../audio/audio';
import { parseLocation } from '../../hooks/useRouter';
import { ARCHITECTURES_BY_ID } from '../../data/architectures';

/**
 * /embed/<architecture>: the 3D model and its guided-tour player, nothing else.
 * Meant for <iframe> embeds in blogs and courses; a badge links to the full app.
 */
export const EmbedApp: React.FC = () => {
  const model = useArchitectureModel();
  useTourDriver(model);
  const { architecture } = model;

  useEffect(() => {
    setSfxEnabled(false);
    const { arch, step } = parseLocation();
    const st = useAppStore.getState();
    useAppStore.setState({ home: false, prefs: { ...st.prefs, tipDismissed: true, focusOnTour: false, predict: false } });
    if (arch && ARCHITECTURES_BY_ID[arch]) st.setArch(arch);
    useAppStore.getState().setTour({ step: step ?? 1, playing: false });
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-[#FBF9F5] overflow-hidden relative font-sans">
      <main className="relative w-full h-full">
        <div className="absolute inset-0">
          <CanvasContainer model={model} />
        </div>
        <TourPlayer model={model} />
        <a
          href={`/architecture/${architecture.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 left-2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[rgba(117,91,70,0.18)] shadow-sm text-[11px] text-[#2f2a27] hover:border-[#eb7c6b]"
          title="Open the full interactive lesson"
        >
          <span className="font-serif text-[14px]">
            NeuralDecode<sup className="text-[#eb7c6b]">✦</sup>
          </span>
          <span className="font-semibold truncate max-w-[180px]">{architecture.name}</span>
          <ExternalLink className="w-3 h-3 text-[#eb7c6b]" />
        </a>
      </main>
    </div>
  );
};
