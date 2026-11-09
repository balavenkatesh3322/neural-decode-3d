import { useEffect, useRef, useState } from 'react';
import type { ArchitectureModel } from './useArchitectureModel';
import { buildScene, SceneModel } from './scene';

/**
 * Runs the async elk layout whenever the graph, collapse state or spacing changes.
 * Keeps the previous scene on screen while the next one is computed so nodes can
 * animate from old to new positions.
 */
export function useSceneModel(model: ArchitectureModel, collapsed: string[], spread: number) {
  const [scene, setScene] = useState<SceneModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const runId = useRef(0);
  const collapsedKey = collapsed.slice().sort().join('|');

  useEffect(() => {
    const id = ++runId.current;
    setPending(true);
    buildScene(model.spec, model.infer, new Set(collapsed), { spread })
      .then((s) => {
        if (id !== runId.current) return;
        setScene(s);
        setError(null);
      })
      .catch((err: Error) => {
        if (id !== runId.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (id === runId.current) setPending(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, collapsedKey, spread]);

  return { scene, error, pending };
}
