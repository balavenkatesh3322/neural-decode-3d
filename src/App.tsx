import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Library, BookOpen, HelpCircle, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { ToolRibbon } from './components/layout/ToolRibbon';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { BottomSheet } from './components/common/BottomSheet';
import { PanelBoundary } from './components/common/PanelBoundary';
import { NodeInspector } from './features/inspector/NodeInspector';
import { ModelKnobs } from './features/knobs/ModelKnobs';
import { TourPlayer } from './features/tour/TourPlayer';
import { useTourDriver } from './features/tour/useTourDriver';
import { useArchitectureModel } from './engine/useArchitectureModel';
import { useAppStore } from './store/useAppStore';
import { useIsMobile } from './hooks/useIsMobile';
import { useDeepLink } from './hooks/useDeepLink';
import { useAudioBridge } from './features/audio/useAudioBridge';

// Panels are code-split: they download only when first opened.
const named = <T extends Record<string, any>>(p: Promise<T>, key: keyof T) => p.then((m) => ({ default: m[key] }));
const LessonModal = lazy(() => named(import('./components/modals/LessonModal'), 'LessonModal'));
const QuizModal = lazy(() => named(import('./components/modals/QuizModal'), 'QuizModal'));
const CompareModal = lazy(() => named(import('./components/modals/CompareModal'), 'CompareModal'));
const BasicsModal = lazy(() => named(import('./features/basics/BasicsModal'), 'BasicsModal'));
const StudyModal = lazy(() => named(import('./features/study/StudyModal'), 'StudyModal'));
const ComponentDetailModal = lazy(() => named(import('./components/modals/ComponentDetailModal'), 'ComponentDetailModal'));
const EndToEndPipelineModal = lazy(() => named(import('./components/modals/EndToEndPipelineModal'), 'EndToEndPipelineModal'));
const ShareModal = lazy(() => named(import('./components/modals/ShareModal'), 'ShareModal'));
const SpecEditorModal = lazy(() => named(import('./features/editor/SpecEditorModal'), 'SpecEditorModal'));
const ImportModal = lazy(() => named(import('./features/import/ImportModal'), 'ImportModal'));

/** Slim tab on the edge of the 3D view that hides / shows a side panel. */
const PanelHandle: React.FC<{ side: 'left' | 'right'; open: boolean; onToggle: () => void }> = ({ side, open, onToggle }) => {
  const Icon = (side === 'left') === open ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onToggle}
      title={`${open ? 'Hide' : 'Show'} the ${side === 'left' ? 'architecture library' : 'learning panel'}`}
      aria-label={`${open ? 'Hide' : 'Show'} ${side} panel`}
      className={`absolute top-1/2 -translate-y-1/2 z-30 w-5 h-14 flex items-center justify-center bg-[rgba(255,252,247,0.95)] border border-[rgba(117,91,70,0.2)] text-[#8d847c] hover:text-[#eb7c6b] shadow-sm ${
        side === 'left' ? '-left-2.5 rounded-r-lg border-l-0' : '-right-2.5 rounded-l-lg border-r-0'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

const PanelFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a27]/30 backdrop-blur-sm">
    <div className="w-10 h-10 rounded-full border-4 border-[#eb7c6b]/20 border-t-[#eb7c6b] animate-spin" />
  </div>
);

export function App() {
  const model = useArchitectureModel();
  const { architecture, componentForSpecId, specIdForComponent } = model;
  useTourDriver(model);
  useDeepLink();
  useAudioBridge(model);
  const mobile = useIsMobile();
  const [sheet, setSheet] = useState<'models' | 'learn' | null>(null);

  const selectedId = useAppStore((s) => s.selectedId);
  const select = useAppStore((s) => s.select);
  const tour = useAppStore((s) => s.tour);
  const setTour = useAppStore((s) => s.setTour);
  const modals = useAppStore((s) => s.modals);
  const openModal = useAppStore((s) => s.openModal);
  const closeModal = useAppStore((s) => s.closeModal);
  const recordQuiz = useAppStore((s) => s.recordQuiz);
  const panels = useAppStore((s) => s.panels);
  const togglePanel = useAppStore((s) => s.togglePanel);

  // keyboard: F full view · + / − zoom · 0 fit · L lens — ignored while typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return;
      const st = useAppStore.getState();
      const k = e.key.toLowerCase();
      if (k === 'f') togglePanel('both');
      else if (k === '+' || k === '=') st.zoomCamera('in');
      else if (k === '-' || k === '_') st.zoomCamera('out');
      else if (k === '0') st.zoomCamera('fit');
      else if (k === 'l') st.toggleLens();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePanel]);

  const selectedComponent = selectedId ? componentForSpecId.get(selectedId) ?? null : null;
  const selectComponent = (componentId: string) => {
    const id = specIdForComponent.get(componentId);
    if (id) select(id);
  };

  const rightSidebar = (variant: 'panel' | 'sheet') => (
    <RightSidebar
      architecture={architecture}
      selectedNode={selectedComponent}
      currentStepIndex={tour.step}
      isPlayingAnimation={tour.playing}
      onTogglePlayAnimation={() => setTour({ playing: !tour.playing })}
      onSelectNode={(comp) => {
        selectComponent(comp.id);
        if (variant === 'sheet') setSheet(null);
      }}
      variant={variant}
    />
  );

  const viewer = (
    <main className="viewer-shell relative h-full w-full min-h-0 lg:rounded-[26px] lg:border border-[rgba(117,91,70,0.18)] bg-[rgba(255,251,244,0.82)] lg:shadow-[0_18px_48px_rgba(87,62,43,0.06)] overflow-hidden">
      <CanvasContainer model={model} />
      <ToolRibbon />
      <ModelKnobs model={model} />
      <NodeInspector model={model} />
      <TourPlayer model={model} />
    </main>
  );

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#FBF9F5] text-stone-900 overflow-hidden font-sans">
      <Navbar />

      {mobile ? (
        <>
          <div className="flex-1 min-h-0 relative">{viewer}</div>
          {/* mobile tab bar */}
          <nav className="flex-shrink-0 grid grid-cols-4 border-t border-[rgba(117,91,70,0.16)] bg-[#fffbf4]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Sections">
            {[
              { id: 'models', label: 'Models', icon: <Library className="w-5 h-5" />, on: () => setSheet('models') },
              { id: 'learn', label: 'Learn', icon: <BookOpen className="w-5 h-5" />, on: () => setSheet('learn') },
              { id: 'tour', label: tour.playing ? 'Pause' : 'Tour', icon: tour.playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />, on: () => setTour({ playing: !tour.playing }) },
              { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-5 h-5" />, on: () => openModal('quiz') },
            ].map((t) => (
              <button key={t.id} onClick={t.on} className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-[#534a43] active:bg-[#f3eee5]">
                <span className="text-[#eb7c6b]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
          <BottomSheet open={sheet === 'models'} onClose={() => setSheet(null)} title="Architectures">
            <LeftSidebar variant="sheet" onPicked={() => setSheet(null)} />
          </BottomSheet>
          <BottomSheet open={sheet === 'learn'} onClose={() => setSheet(null)} title={architecture.name}>
            {rightSidebar('sheet')}
          </BottomSheet>
        </>
      ) : (
        <div className={`workspace w-full mx-auto flex-1 min-h-0 flex my-3 px-4 md:px-6 ${panels.left || panels.right ? 'max-w-[1720px]' : ''}`}>
          {/* side panels slide closed to give the 3D view the whole screen */}
          <div className={`flex-shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-out ${panels.left ? 'w-[250px] 2xl:w-[285px] mr-3 2xl:mr-[18px]' : 'w-0 mr-0'}`} aria-hidden={!panels.left}>
            <div className="w-[250px] 2xl:w-[285px] h-full">
              <LeftSidebar />
            </div>
          </div>
          <div className="flex-1 min-w-0 relative">
            {viewer}
            <PanelHandle side="left" open={panels.left} onToggle={() => togglePanel('left')} />
            <PanelHandle side="right" open={panels.right} onToggle={() => togglePanel('right')} />
          </div>
          <div className={`flex-shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-out ${panels.right ? 'w-[290px] 2xl:w-[330px] ml-3 2xl:ml-[18px]' : 'w-0 ml-0'}`} aria-hidden={!panels.right}>
            <div className="w-[290px] 2xl:w-[330px] h-full">{rightSidebar('panel')}</div>
          </div>
        </div>
      )}

      <PanelBoundary onReset={() => (Object.keys(modals) as (keyof typeof modals)[]).forEach((m) => closeModal(m))}>
      <Suspense fallback={<PanelFallback />}>
        {modals.lesson && <LessonModal architecture={architecture} onClose={() => closeModal('lesson')} onSelectStepNode={(nodeId) => selectComponent(nodeId)} />}
        {modals.quiz && (
          <QuizModal
            key={architecture.id}
            architecture={architecture}
            onClose={() => closeModal('quiz')}
            onComplete={recordQuiz}
            onShowInModel={(componentId) => {
              closeModal('quiz');
              selectComponent(componentId);
            }}
          />
        )}
        {modals.compare && <CompareModal currentArchitecture={architecture} onClose={() => closeModal('compare')} />}
        {modals.blocks && <BasicsModal onClose={() => closeModal('blocks')} />}
        {modals.study && <StudyModal model={model} onClose={() => closeModal('study')} onShowNode={(c: string) => (closeModal('study'), selectComponent(c))} />}
        {modals.detail && selectedComponent && <ComponentDetailModal component={selectedComponent} architecture={architecture} onClose={() => closeModal('detail')} />}
        {modals.pipeline && <EndToEndPipelineModal onClose={() => closeModal('pipeline')} />}
        {modals.share && <ShareModal onClose={() => closeModal('share')} />}
        {modals.editor && <SpecEditorModal onClose={() => closeModal('editor')} />}
        {modals.import && <ImportModal onClose={() => closeModal('import')} />}
      </Suspense>
      </PanelBoundary>
    </div>
  );
}
