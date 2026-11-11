import { useEffect } from 'react';
import { readHash, slugify } from '../engine/registry';
import { ARCHITECTURES_BY_ID } from '../data/architectures';
import { useAppStore, type ModalId } from '../store/useAppStore';

/**
 * URL ⇄ app state, using the History API so the browser's Back / Forward buttons work:
 *
 *   /                               landing page
 *   /architecture/<id>              an architecture       (?step=N opens that tour step)
 *   /architecture/<id>?panel=study  a panel on top        (Back closes it)
 *   /embed/<id>                     minimal embeddable view (see EmbedApp)
 *   #arch=<id> / #spec=…            legacy and user-built links, still accepted
 *
 * Every architecture change pushes a history entry; opening a panel pushes one too, and closing
 * it with ✕ steps back, so history never fills up with duplicates.
 */

/** Panels that get their own URL (and therefore a Back step). */
const ROUTED_PANELS: ModalId[] = ['path', 'progress', 'blocks', 'study', 'share'];
const PANEL_SLUG: Partial<Record<ModalId, string>> = { blocks: 'basics' };
const slugToPanel = (s: string | null): ModalId | null => {
  if (!s) return null;
  const hit = (Object.entries(PANEL_SLUG) as [ModalId, string][]).find(([, v]) => v === s)?.[0];
  return hit ?? (ROUTED_PANELS.includes(s as ModalId) ? (s as ModalId) : null);
};

export interface Route {
  home: boolean;
  arch?: string;
  panel: ModalId | null;
  step?: number;
}

export function parseLocation(loc: Location = window.location): Route & { specHash?: string } {
  const params = new URLSearchParams(loc.search);
  const panel = slugToPanel(params.get('panel'));
  const step = params.get('step') ? Math.max(1, parseInt(params.get('step')!, 10) || 1) : undefined;
  // legacy hash links (AgentDecode and older shares link with #arch=<id>)
  if (loc.hash) {
    const { archId, spec } = readHash(loc.hash);
    if (spec) return { home: false, panel, step, specHash: loc.hash };
    if (archId) return { home: false, arch: archId, panel, step };
  }
  const m = loc.pathname.match(/^\/(?:architecture|embed)\/([^/?#]+)/);
  if (m) return { home: false, arch: decodeURIComponent(m[1]), panel, step };
  return { home: true, panel, step };
}

const panelOf = (modals: Partial<Record<ModalId, boolean>>) => ROUTED_PANELS.find((p) => modals[p]) ?? null;

/** The URL the current state should have. */
function urlFor(home: boolean, archId: string, panel: ModalId | null): string {
  const base = home ? '/' : `/architecture/${encodeURIComponent(archId)}`;
  return panel ? `${base}?panel=${PANEL_SLUG[panel] ?? panel}` : base;
}

let applying = false;

/** Make the app match a route (startup and Back/Forward). */
export function applyRoute(r: Route & { specHash?: string }) {
  applying = true;
  try {
    const st = useAppStore.getState();
    if (r.specHash) {
      const { spec, error } = readHash(r.specHash);
      if (spec) {
        const id = slugify(spec.meta?.name ?? 'shared-model');
        st.addCustom(id, spec);
        if (st.archId !== id) st.setArch(id);
      } else if (error) console.warn('[NeuralDecode] could not open shared model:', error);
    } else if (r.arch && (ARCHITECTURES_BY_ID[r.arch] || st.custom[r.arch])) {
      if (st.archId !== r.arch) st.setArch(r.arch);
    }
    if (useAppStore.getState().home !== r.home) useAppStore.getState().setHome(r.home);
    // panels: exactly the one in the URL is open
    const modals = useAppStore.getState().modals;
    for (const p of ROUTED_PANELS) {
      if (p === r.panel && !modals[p]) useAppStore.getState().openModal(p);
      if (p !== r.panel && modals[p]) useAppStore.getState().closeModal(p);
    }
    if (r.step !== undefined && !r.home) useAppStore.getState().setTour({ step: r.step, playing: false });
  } finally {
    applying = false;
  }
}

export function useRouter() {
  useEffect(() => {
    // startup: normalise legacy links to clean paths (user-built #spec= links stay as they are)
    const first = parseLocation();
    applyRoute(first);
    const st = useAppStore.getState();
    if (!first.specHash) {
      const clean = urlFor(st.home, st.archId, panelOf(st.modals)) + (first.step !== undefined ? `${panelOf(st.modals) ? '&' : '?'}step=${first.step}` : '');
      history.replaceState({ panel: !!panelOf(st.modals) }, '', clean);
    }

    const onPop = () => applyRoute(parseLocation());
    window.addEventListener('popstate', onPop);
    // a #arch= / #spec= link pasted into the address bar
    const onHash = () => applyRoute(parseLocation());
    window.addEventListener('hashchange', onHash);

    // state → URL, flushed once per tick so multi-step actions (close one panel, open another,
    // switch architecture) become a single history entry
    let flushed = { home: st.home, archId: st.archId, panel: panelOf(st.modals) };
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      const s = useAppStore.getState();
      const next = { home: s.home, archId: s.archId, panel: panelOf(s.modals) };
      const before = flushed;
      flushed = next;
      if (next.home === before.home && next.archId === before.archId && next.panel === before.panel) return;
      // while the landing page is up, its demo architecture must not leak into the URL
      if (next.home && before.home && next.panel === before.panel) return;
      // a user-built model keeps its #spec= link until you navigate away from it
      if (s.custom[next.archId] && next.archId === before.archId && window.location.hash.includes('spec=')) return;
      const url = urlFor(next.home, next.archId, next.panel);
      if (url === window.location.pathname + window.location.search && !window.location.hash) return;
      // a panel closed with ✕ on the same page: step back instead of stacking another entry
      if (!next.panel && before.panel && next.home === before.home && next.archId === before.archId && history.state?.panel) {
        history.back();
        return;
      }
      history.pushState({ panel: !!next.panel }, '', url);
    };
    const unsub = useAppStore.subscribe(() => {
      if (applying) {
        const s = useAppStore.getState();
        flushed = { home: s.home, archId: s.archId, panel: panelOf(s.modals) };
        return;
      }
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
      }
    });

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onHash);
      unsub();
    };
  }, []);
}
