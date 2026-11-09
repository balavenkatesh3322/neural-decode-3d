import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { useAppStore } from '../../store/useAppStore';
import { playSfx } from '../audio/audio';

const BASE_STEP_MS = 5200;

function speak(text: string, rate: number) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = Math.min(1.6, 0.95 * rate);
    synth.speak(u);
  } catch {
    /* speech unavailable — the captions still show */
  }
}

/**
 * Drives the guided tour: advances steps on a timer while playing, moves the
 * selection (and therefore the camera) to each step's node, and narrates.
 */
export function useTourDriver(model: ArchitectureModel) {
  const tour = useAppStore((s) => s.tour);
  const setTour = useAppStore((s) => s.setTour);
  const select = useAppStore((s) => s.select);
  const completeTour = useAppStore((s) => s.completeTour);
  const steps = model.architecture.dataFlowSteps;
  const prev = useRef<{ arch: string; step: number; playing: boolean } | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

  // follow the current step: only on a real step change or when play starts,
  // never on first load or on an architecture switch (those show the overview)
  useEffect(() => {
    const arch = model.architecture.id;
    const p = prev.current;
    prev.current = { arch, step: tour.step, playing: tour.playing };
    if (!p || p.arch !== arch) return;
    const stepChanged = p.step !== tour.step;
    const started = tour.playing && !p.playing;
    if (!stepChanged && !started) return;
    const m = modelRef.current;
    const id = m.specIdForStep(tour.step);
    if (id) select(id);
    const step = m.architecture.dataFlowSteps.find((s) => s.stepIndex === tour.step);
    if (step && tour.narrate && tour.playing) speak(`${step.title}. ${step.description}`, tour.speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.step, tour.playing, model.architecture.id]);

  // advance while playing
  useEffect(() => {
    if (!tour.playing) return;
    const t = window.setTimeout(() => {
      if (tour.step >= steps.length) {
        setTour({ playing: false });
        completeTour();
        playSfx('complete');
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors: ['#eb7c6b', '#3FA7C9', '#8B6BD6', '#E3A23B'] });
      } else {
        setTour({ step: tour.step + 1 });
      }
    }, BASE_STEP_MS / tour.speed);
    return () => window.clearTimeout(t);
  }, [tour.playing, tour.step, tour.speed, steps.length, setTour, completeTour]);

  // stop speaking when paused / unmounted
  useEffect(() => {
    if (!tour.playing || !tour.narrate) {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    }
  }, [tour.playing, tour.narrate]);
}
