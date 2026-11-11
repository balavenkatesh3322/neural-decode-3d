import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { useAppStore } from '../../store/useAppStore';
import { playSfx } from '../audio/audio';
import { seeded } from '../../engine/render/style';
import { track } from '../../lib/track';
import type { DataFlowStep } from '../../types/architecture';
import type { PredictState } from '../../store/useAppStore';

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

/** “What happens next?” with the real next step and two other steps of the same tour as options. */
export function buildPredict(steps: DataFlowStep[], stepIdx: number, seed: string): PredictState | null {
  const next = steps.find((s) => s.stepIndex === stepIdx);
  if (!next) return null;
  const correct = next.title;
  const rand = seeded(`${seed}:${stepIdx}`);
  const pool = [...new Set(steps.filter((s) => s.stepIndex !== stepIdx).map((s) => s.title))].filter((t) => t !== correct);
  if (pool.length < 2) return null;
  const wrong: string[] = [];
  while (wrong.length < 2 && pool.length) wrong.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  const options = [correct, ...wrong];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { step: stepIdx, question: 'What happens next?', options, answer: options.indexOf(correct) };
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
  const home = useAppStore((s) => s.home);
  const predictOn = useAppStore((s) => !!s.prefs.predict);
  const broken = useAppStore((s) => s.broken);
  const setPredict = useAppStore((s) => s.setPredict);
  const setFailure = useAppStore((s) => s.setFailure);
  const asked = useRef(new Set<string>());
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
    if (started && tour.step === 1 && !useAppStore.getState().home) track('tour_started', { arch });
    if (!stepChanged && !started) return;
    const m = modelRef.current;
    const id = m.specIdForStep(tour.step);
    if (id) select(id);
    const step = m.architecture.dataFlowSteps.find((s) => s.stepIndex === tour.step);
    if (step && tour.narrate && tour.playing) speak(`${step.title}. ${step.description}`, tour.speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.step, tour.playing, model.architecture.id]);

  useEffect(() => {
    if (tour.step <= 1) asked.current.clear();
  }, [tour.step]);

  // advance while playing
  useEffect(() => {
    if (!tour.playing) return;
    const t = window.setTimeout(() => {
      const m = modelRef.current;
      if (tour.step >= steps.length) {
        // the landing page loops its demo tour quietly
        if (home) return setTour({ step: 1 });
        setTour({ playing: false });
        completeTour();
        track('tour_completed', { arch: m.architecture.id });
        playSfx('complete');
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors: ['#eb7c6b', '#3FA7C9', '#8B6BD6', '#E3A23B'] });
        return;
      }
      const nextIdx = tour.step + 1;
      const nextStep = m.architecture.dataFlowSteps.find((s) => s.stepIndex === nextIdx);
      // break-it mode: the switched-off part makes the forward pass fail where it is first needed
      if (!home && broken && nextStep?.activeNodeId === broken) {
        const comp = m.architecture.components.find((c) => c.id === broken);
        setTour({ step: nextIdx, playing: false });
        setFailure({
          step: nextIdx,
          text: comp?.componentImpact ?? `${comp?.name ?? 'This part'} is switched off, so the tensor can’t pass through here and the forward pass stops.`,
        });
        playSfx('wrong');
        track('break_it_failed', { arch: m.architecture.id, part: broken });
        return;
      }
      // predict mode: pause and ask before every other step (once per step per tour)
      const key = `${m.architecture.id}:${nextIdx}`;
      if (predictOn && !home && nextIdx >= 2 && nextIdx % 2 === 0 && !asked.current.has(key)) {
        const p = buildPredict(m.architecture.dataFlowSteps, nextIdx, m.architecture.id);
        if (p) {
          asked.current.add(key);
          setTour({ playing: false });
          setPredict(p);
          return;
        }
      }
      setTour({ step: nextIdx });
    }, BASE_STEP_MS / tour.speed);
    return () => window.clearTimeout(t);
  }, [tour.playing, tour.step, tour.speed, steps.length, setTour, completeTour, home, predictOn, broken, setPredict, setFailure]);

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
