import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Environment, Grid, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Boxes, AlertTriangle } from 'lucide-react';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { useSceneModel } from '../../engine/useSceneModel';
import { GraphScene } from '../../engine/render/GraphScene';
import { BACKGROUND } from '../../engine/render/style';
import { useAppStore } from '../../store/useAppStore';
import { isMobileNow } from '../../hooks/useIsMobile';
import { MiniMap } from '../../features/minimap/MiniMap';
import { Lens, LensPointer } from '../../engine/render/Lens';
import { ViewControls } from '../../features/viewcontrols/ViewControls';
import { useFocus } from '../../features/focus/useFocus';

const LENS_PX = 220;

// post-processing (~230 KB) streams in after the first frame is already on screen
const Effects = React.lazy(() => import('../../engine/render/Effects').then((m) => ({ default: m.Effects })));

const EMPTY: string[] = [];

/** Keeps a bad spec from blanking the whole canvas; resets when the architecture changes. */
class SceneBoundary extends React.Component<{ resetKey: string; onError: (msg: string) => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: Error) {
    this.props.onError(err.message);
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Hosts the WebGL canvas: lighting, backdrop, post-processing and the data-driven GraphScene. */
export const CanvasContainer: React.FC<{ model: ArchitectureModel }> = ({ model }) => {
  const { minimal } = useFocus();
  const stored = useAppStore((s) => s.collapsed[s.archId]);
  // until the user expands/collapses something, use the spec's defaults (e.g. big imported models start collapsed)
  const specDefault = useMemo(() => (model.spec.groups ?? []).filter((g) => g.collapsed).map((g) => g.id), [model.spec]);
  const collapsed = stored ?? (specDefault.length ? specDefault : EMPTY);
  const exploded = useAppStore((s) => s.view.exploded);
  const select = useAppStore((s) => s.select);
  const spread = exploded ? 1.8 : 1;
  const { scene, error, pending } = useSceneModel(model, collapsed, spread);
  // phones/tablets: skip ambient occlusion and cap pixel ratio — the biggest GPU costs
  const [quality, setQuality] = useState<'high' | 'low'>(() => (isMobileNow() ? 'low' : 'high'));
  const [renderError, setRenderError] = useState<string | null>(null);
  useEffect(() => {
    setRenderError(null);
  }, [model.architecture.id]);

  // a layout computed for the previous architecture must not be drawn against the new one
  const current = scene && scene.spec === model.spec ? scene : null;
  const showLoader = pending && !current;

  // lens: pointer tracked in a ref (no React re-render per mouse move); the frame div is moved directly
  const lens = useAppStore((s) => s.lens);
  const lensPointer = useRef<LensPointer>({ x: 0, y: 0, inside: false });
  const lensFrame = useRef<HTMLDivElement>(null);
  const lensCanvas = useRef<HTMLCanvasElement>(null);
  const trackLens = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lens.on) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    lensPointer.current = { x, y, inside: true };
    if (lensFrame.current) {
      lensFrame.current.style.transform = `translate(${x - LENS_PX / 2}px, ${y - LENS_PX / 2}px)`;
      lensFrame.current.style.opacity = '1';
    }
  };
  const leaveLens = () => {
    lensPointer.current.inside = false;
    if (lensFrame.current) lensFrame.current.style.opacity = '0';
  };

  return (
    <div className={`w-full h-full relative overflow-hidden ${lens.on ? 'cursor-crosshair' : ''}`} onPointerMove={trackLens} onPointerDown={trackLens} onPointerLeave={leaveLens}>
      <Canvas
        camera={{ position: [-6, 4, 22], fov: 40, near: 0.1, far: 200 }}
        dpr={isMobileNow() ? [1, 1.5] : [1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        onPointerMissed={() => select(null)}
      >
        <color attach="background" args={[BACKGROUND]} />
        <fog attach="fog" args={[BACKGROUND, 40, 110]} />
        <PerformanceMonitor onDecline={() => setQuality('low')} onIncline={() => !isMobileNow() && setQuality('high')} flipflops={3} onFallback={() => setQuality('low')}>
          <AdaptiveDpr pixelated={false} />
        </PerformanceMonitor>

        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#fff8ef', '#d8c7b6', 0.6]} />
        <directionalLight position={[8, 14, 10]} intensity={1.3} />
        <directionalLight position={[-10, -4, -8]} intensity={0.35} />
        {/* procedural studio lighting — no network fetch for HDRIs */}
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2.2} position={[0, 6, 6]} scale={[14, 6, 1]} color="#fffaf2" />
          <Lightformer intensity={1.1} position={[-8, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 8, 1]} color="#ffe9d6" />
          <Lightformer intensity={0.8} position={[8, -2, 3]} rotation-y={-Math.PI / 2} scale={[8, 8, 1]} color="#e3efff" />
        </Environment>

        {/* specimen-board backdrop */}
        <Grid
          position={[0, 0, -3.2]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[200, 200]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#e6d9ca"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#dcc9b6"
          fadeDistance={70}
          fadeStrength={1.5}
          infiniteGrid
        />

        <Suspense fallback={null}>
          <SceneBoundary resetKey={model.architecture.id} onError={setRenderError}>
            {current && <GraphScene model={model} scene={current} spread={spread} />}
          </SceneBoundary>
        </Suspense>

        <Suspense fallback={null}>
          <Effects quality={quality} />
        </Suspense>
        {lens.on && <Lens pointer={lensPointer} zoom={lens.zoom} size={LENS_PX} output={lensCanvas} />}
      </Canvas>

      {current && !minimal && <MiniMap model={model} scene={current} />}
      {!minimal && <ViewControls />}
      {lens.on && (
        <div
          ref={lensFrame}
          className="pointer-events-none absolute left-0 top-0 z-[16] rounded-full border-[5px] border-[#2f2a27] shadow-[0_10px_30px_rgba(47,42,39,0.35)] opacity-0 transition-opacity"
          style={{ width: LENS_PX, height: LENS_PX }}
        >
          <canvas ref={lensCanvas} className="absolute inset-0 w-full h-full rounded-full" />
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#2f2a27] text-[#f5b3a8] text-[10px] font-mono font-bold">{lens.zoom.toFixed(lens.zoom % 1 ? 1 : 0)}×</span>
          <span className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 bg-[#eb7c6b]/70" />
          <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-[#eb7c6b]/70" />
        </div>
      )}

      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[rgba(255,251,244,0.88)] backdrop-blur-md flex flex-col items-center justify-center z-40 select-none"
          >
            <div className="p-6 rounded-[26px] bg-white border border-[rgba(117,91,70,0.18)] shadow-2xl flex flex-col items-center gap-3 max-w-sm text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#eb7c6b]/20 border-t-[#eb7c6b] animate-spin" />
                <Boxes className="w-6 h-6 text-[#2f2a27] animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-medium text-lg text-[#2f2a27]">Building the 3D model…</h3>
                <p className="text-xs font-sans text-[#8d847c] mt-0.5">Working out every tensor shape and wiring up the layers</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(error || renderError || model.infer.errors.length > 0) && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-lg p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div>
            {error && <div>Layout failed: {error}</div>}
            {renderError && <div>Render failed: {renderError}</div>}
            {model.infer.errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
