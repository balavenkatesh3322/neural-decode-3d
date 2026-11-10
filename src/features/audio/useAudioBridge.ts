import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ArchitectureModel } from '../../engine/useArchitectureModel';
import { getOp } from '../../engine/ops';
import { playSfx, setSfxEnabled } from './audio';

/** Turns app events into sound effects: selection, tour steps, flow mode. */
export function useAudioBridge(model: ArchitectureModel) {
  const sound = useAppStore((s) => s.audio.sound);
  const selectedId = useAppStore((s) => s.selectedId);
  const step = useAppStore((s) => s.tour.step);
  const playing = useAppStore((s) => s.tour.playing);
  const flow = useAppStore((s) => s.flow);
  const first = useRef(true);

  useEffect(() => {
    setSfxEnabled(sound);
  }, [sound]);

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
