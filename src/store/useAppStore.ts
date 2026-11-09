import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SystemCategory } from '../types/architecture';
import type { GraphSpec } from '../engine/spec/schema';

export type FlowMode = 'off' | 'forward' | 'backward';
export type ModalId = 'lesson' | 'quiz' | 'compare' | 'blocks' | 'detail' | 'pipeline' | 'share' | 'editor' | 'import' | 'study';

export interface ViewOptions {
  autoRotate: boolean;
  /** Extra layout spacing. */
  exploded: boolean;
  showShapes: boolean;
  /** Show numeric shapes (1, 8, 4096) instead of symbolic (B, T, d_model). */
  numericShapes: boolean;
}

interface TourState {
  playing: boolean;
  /** 1-based index into architecture.dataFlowSteps. */
  step: number;
  speed: number;
  narrate: boolean;
}

interface Progress {
  visited: Record<string, string[]>;
  quizBest: Record<string, number>;
  toursCompleted: string[];
  /** Deep Learning Basics concepts the learner has completed. */
  basicsDone?: string[];
  /** Flashcards marked “got it”, per architecture. */
  flashKnown?: Record<string, string[]>;
}

interface AppState {
  archId: string;
  category: SystemCategory | 'all';
  search: string;
  /** Selected spec node or group id. */
  selectedId: string | null;
  hoveredId: string | null;
  view: ViewOptions;
  flow: FlowMode;
  tour: TourState;
  collapsed: Record<string, string[]>;
  overrides: Record<string, Record<string, number>>;
  modals: Partial<Record<ModalId, boolean>>;
  /** Bumped to ask the camera to re-frame the whole model. */
  cameraNonce: number;
  progress: Progress;
  /** User-made architectures (spec editor, ONNX import, shared links). */
  custom: Record<string, GraphSpec>;
  /** Real tokens from the in-browser tokenizer, shown on the embedding layer of that architecture. */
  liveTokens: { archId: string; tokens: string[] } | null;
  audio: { sound: boolean; music: boolean };
  /** Desktop side panels can be hidden to give the 3D view the whole screen. */
  panels: { left: boolean; right: boolean };
  /** Magnifier that follows the pointer. */
  lens: { on: boolean; zoom: number };
  /** Basics concept to open at (set by deep-dive “learn the basics” links). */
  basicsFocus: string | null;
  openBasics: (conceptId: string) => void;
  /** One-shot camera commands for buttons outside the canvas. */
  cameraCmd: { kind: 'in' | 'out'; n: number } | null;
  toggleLens: () => void;
  setLensZoom: (z: number) => void;
  zoomCamera: (kind: 'in' | 'out' | 'fit') => void;
  togglePanel: (side: 'left' | 'right' | 'both') => void;

  toggleAudio: (key: 'sound' | 'music') => void;

  setLiveTokens: (archId: string, tokens: string[]) => void;
  addCustom: (id: string, spec: GraphSpec) => void;
  removeCustom: (id: string) => void;
  setArch: (id: string) => void;
  setCategory: (c: SystemCategory | 'all') => void;
  setSearch: (s: string) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  toggleView: (key: keyof ViewOptions) => void;
  setFlow: (f: FlowMode) => void;
  setTour: (patch: Partial<TourState>) => void;
  toggleCollapsed: (groupId: string) => void;
  setCollapsedAll: (ids: string[]) => void;
  setOverride: (key: string, value: number) => void;
  resetOverrides: () => void;
  openModal: (id: ModalId) => void;
  closeModal: (id: ModalId) => void;
  resetView: () => void;
  markVisited: (nodeId: string) => void;
  recordQuiz: (score: number) => void;
  completeTour: () => void;
  markBasicDone: (id: string) => void;
  setFlashKnown: (archId: string, cardId: string, known: boolean) => void;
}

const DEFAULT_VIEW: ViewOptions = {
  autoRotate: true,
  exploded: false,
  showShapes: true,
  numericShapes: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      archId: 'transformer',
      category: 'all',
      search: '',
      selectedId: null,
      hoveredId: null,
      view: DEFAULT_VIEW,
      flow: 'forward',
      tour: { playing: false, step: 1, speed: 1, narrate: false },
      collapsed: {},
      overrides: {},
      modals: {},
      cameraNonce: 0,
      progress: { visited: {}, quizBest: {}, toursCompleted: [] },
      custom: {},
      liveTokens: null,
      audio: { sound: true, music: true },

      panels: { left: true, right: true },
      lens: { on: false, zoom: 3 },
      basicsFocus: null,
      openBasics: (conceptId) => set((s) => ({ basicsFocus: conceptId, modals: { ...s.modals, detail: false, blocks: true } })),
      cameraCmd: null,
      toggleLens: () => set((s) => ({ lens: { ...s.lens, on: !s.lens.on } })),
      setLensZoom: (z) => set((s) => ({ lens: { ...s.lens, zoom: Math.min(8, Math.max(1.5, z)) } })),
      zoomCamera: (kind) =>
        set((s) => (kind === 'fit' ? { cameraNonce: s.cameraNonce + 1 } : { cameraCmd: { kind, n: (s.cameraCmd?.n ?? 0) + 1 } })),
      togglePanel: (side) => {
        set((s) => {
          const both = s.panels.left || s.panels.right;
          const panels = side === 'both' ? { left: !both, right: !both } : { ...s.panels, [side]: !s.panels[side] };
          return { panels };
        });
        // re-frame the model once the panel slide has finished and the canvas has resized
        window.setTimeout(() => set((s) => ({ cameraNonce: s.cameraNonce + 1 })), 360);
      },
      toggleAudio: (key) => set((s) => ({ audio: { ...s.audio, [key]: !s.audio[key] } })),

      setLiveTokens: (archId, tokens) => set({ liveTokens: { archId, tokens } }),

      addCustom: (id, spec) => set((s) => ({ custom: { ...s.custom, [id]: spec } })),
      removeCustom: (id) =>
        set((s) => {
          const custom = { ...s.custom };
          delete custom[id];
          return { custom, ...(s.archId === id ? { archId: 'transformer', selectedId: null } : {}) };
        }),

      setArch: (id) =>
        set((s) => ({
          archId: id,
          selectedId: null,
          hoveredId: null,
          tour: { ...s.tour, playing: false, step: 1 },
          cameraNonce: s.cameraNonce + 1,
        })),
      setCategory: (category) => set({ category }),
      setSearch: (search) => set({ search }),
      select: (id) => {
        set({ selectedId: id });
        if (id) get().markVisited(id);
      },
      hover: (id) => set({ hoveredId: id }),
      toggleView: (key) => set((s) => ({ view: { ...s.view, [key]: !s.view[key] } })),
      setFlow: (flow) => set({ flow }),
      setTour: (patch) => set((s) => ({ tour: { ...s.tour, ...patch } })),
      toggleCollapsed: (gid) =>
        set((s) => {
          const cur = new Set(s.collapsed[s.archId] ?? []);
          if (cur.has(gid)) cur.delete(gid);
          else cur.add(gid);
          return { collapsed: { ...s.collapsed, [s.archId]: [...cur] }, cameraNonce: s.cameraNonce + 1 };
        }),
      setCollapsedAll: (ids) =>
        set((s) => ({ collapsed: { ...s.collapsed, [s.archId]: ids }, cameraNonce: s.cameraNonce + 1 })),
      setOverride: (key, value) =>
        set((s) => ({ overrides: { ...s.overrides, [s.archId]: { ...(s.overrides[s.archId] ?? {}), [key]: value } } })),
      resetOverrides: () => set((s) => ({ overrides: { ...s.overrides, [s.archId]: {} } })),
      openModal: (id) => set((s) => ({ modals: { ...s.modals, [id]: true } })),
      closeModal: (id) => set((s) => ({ modals: { ...s.modals, [id]: false } })),
      resetView: () =>
        set((s) => ({
          selectedId: null,
          view: { ...DEFAULT_VIEW, showShapes: s.view.showShapes, numericShapes: s.view.numericShapes },
          tour: { ...s.tour, playing: false, step: 1 },
          collapsed: { ...s.collapsed, [s.archId]: [] },
          cameraNonce: s.cameraNonce + 1,
        })),
      markVisited: (nodeId) =>
        set((s) => {
          const list = s.progress.visited[s.archId] ?? [];
          if (list.includes(nodeId)) return {};
          return { progress: { ...s.progress, visited: { ...s.progress.visited, [s.archId]: [...list, nodeId] } } };
        }),
      recordQuiz: (score) =>
        set((s) => ({
          progress: {
            ...s.progress,
            quizBest: { ...s.progress.quizBest, [s.archId]: Math.max(score, s.progress.quizBest[s.archId] ?? 0) },
          },
        })),
      setFlashKnown: (archId, cardId, known) =>
        set((s) => {
          const all = s.progress.flashKnown ?? {};
          const cur = new Set(all[archId] ?? []);
          if (known) cur.add(cardId);
          else cur.delete(cardId);
          return { progress: { ...s.progress, flashKnown: { ...all, [archId]: [...cur] } } };
        }),
      markBasicDone: (id) =>
        set((s) => {
          const done = s.progress.basicsDone ?? [];
          return done.includes(id) ? {} : { progress: { ...s.progress, basicsDone: [...done, id] } };
        }),
      completeTour: () =>
        set((s) =>
          s.progress.toursCompleted.includes(s.archId)
            ? {}
            : { progress: { ...s.progress, toursCompleted: [...s.progress.toursCompleted, s.archId] } },
        ),
    }),
    {
      name: 'neuraldecode-3d',
      version: 3,
      // v2: sound + music default to on
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted;
        const p = { ...persisted };
        if (version < 2) p.audio = { sound: true, music: true }; // v2: sound + music on by default
        if (version < 3) p.view = { ...(p.view ?? {}), autoRotate: true }; // v3: auto-rotate on by default
        return p;
      },
      storage: createJSONStorage(() => {
        try {
          const ls = window.localStorage;
          return {
            getItem: (k: string) => ls.getItem(k),
            // a large imported model can exceed the quota — keep working in memory rather than crash
            setItem: (k: string, v: string) => {
              try {
                ls.setItem(k, v);
              } catch {
                /* quota exceeded */
              }
            },
            removeItem: (k: string) => ls.removeItem(k),
          };
        } catch {
          // private mode / blocked storage: fall back to an in-memory shim
          const mem = new Map<string, string>();
          return {
            getItem: (k: string) => mem.get(k) ?? null,
            setItem: (k: string, v: string) => void mem.set(k, v),
            removeItem: (k: string) => void mem.delete(k),
          };
        }
      }),
      partialize: (s) => ({ progress: s.progress, view: s.view, archId: s.archId, flow: s.flow, custom: s.custom, audio: s.audio, panels: s.panels }),
    },
  ),
);

export const isModalOpen = (s: AppState) => Object.values(s.modals).some(Boolean);
