import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { getOp } from '../../engine/ops';
import { music, playSfx, setSfxEnabled, themeFor } from './audio';

/** Turns app events into sound: selection, tour steps, flow mode, architecture theme. */
export function useAudioBridge(model: ArchitectureModel) {
  const sound = useAppStore((s) => s.audio.sound);
  const musicOn = useAppStore((s) => s.audio.music);
  const selectedId = useAppStore((s) => s.selectedId);
  const step = useAppStore((s) => s.tour.step);
  const playing = useAppStore((s) => s.tour.playing);
  const flow = useAppStore((s) => s.flow);
  const first = useRef(true);

  useEffect(() => {
    setSfxEnabled(sound);
  }, [sound]);
  useEffect(() => {
    music.setEnabled(musicOn);
  }, [musicOn]);
  useEffect(() => {
    music.setTheme(themeFor(model.architecture.id, model.architecture.category));
  }, [model.architecture.id, model.architecture.category]);

  useEffect(() => {
    if (first.current || !selectedId) return;
    const node = model.spec.nodes.find((n) => n.id === selectedId);
    playSfx('select', { family: node ? getOp(node.op).family : 'misc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!first.current && playing) playSfx('step');
  }, [step, playing]);

  useEffect(() => {
    if (first.current) return;
    if (flow === 'forward') playSfx('forward');
    if (flow === 'backward') playSfx('backprop');
  }, [flow]);

  useEffect(() => {
    first.current = false;
  }, []);
}
