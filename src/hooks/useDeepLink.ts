import { useEffect, useRef } from 'react';
import { readHash, slugify } from '../engine/registry';
import { ARCHITECTURES_BY_ID } from '../data/architectures';
import { useAppStore } from '../store/useAppStore';

/**
 * Keeps the URL hash in sync with what is on screen, so the address bar is
 * always a shareable link:
 *   #arch=gpt2            a built-in architecture
 *   #spec=<compressed>    a user-built architecture travelling inside the link
 */
export function useDeepLink() {
  const archId = useAppStore((s) => s.archId);
  const custom = useAppStore((s) => s.custom);
  const loaded = useRef(false);

  // read once on startup (and when the user pastes a new link)
  useEffect(() => {
    const apply = () => {
      const { archId: id, spec, error } = readHash(window.location.hash);
      const st = useAppStore.getState();
      if (spec) {
        const newId = slugify(spec.meta?.name ?? 'shared-model');
        st.addCustom(newId, spec);
        st.setArch(newId);
      } else if (id && (ARCHITECTURES_BY_ID[id] || st.custom[id])) {
        if (id !== st.archId) st.setArch(id);
      } else if (error) {
        console.warn('[NeuralDecode] could not open shared model:', error);
      }
      loaded.current = true;
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  // write: built-ins get a short #arch= link; custom models keep their #spec= link until you navigate away
  useEffect(() => {
    if (!loaded.current) return;
    const builtIn = !!ARCHITECTURES_BY_ID[archId];
    const current = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (builtIn && current.get('arch') !== archId) {
      history.replaceState(null, '', `#arch=${encodeURIComponent(archId)}`);
    } else if (!builtIn && custom[archId] && !current.get('spec')) {
      history.replaceState(null, '', `#arch=${encodeURIComponent(archId)}`);
    }
  }, [archId, custom]);
}
