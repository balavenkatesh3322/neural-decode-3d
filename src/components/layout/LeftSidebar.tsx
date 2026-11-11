import React, { useMemo } from 'react';
import { Search, X, CheckCircle2, Upload, Trash2, GraduationCap, Compass, Bot } from 'lucide-react';
import { ARCHITECTURES_BY_ID } from '../../data/architectures';
import { AGENTDECODE_URL } from '../../config/agentdecode';
import { track } from '../../lib/track';
import type { Architecture, SystemCategory } from '../../types/architecture';
import { listArchitectures, resolveArchitecture } from '../../engine/registry';
import { useAppStore } from '../../store/useAppStore';

const CATEGORY_LABEL: Record<SystemCategory | 'all', string> = {
  all: 'All',
  llm: 'Language',
  vision: 'Vision',
  generative: 'Generative',
  ssm: 'Sequence',
  multimodal: 'Multimodal',
  classic: 'Classic',
  custom: 'Yours',
};

/** Learning progress ring: share of lesson stops visited; full + check when the tour is done. */
const ProgressRing: React.FC<{ value: number; done: boolean; quiz?: number }> = ({ value, done, quiz }) => {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-6 h-6 flex items-center justify-center" title={`${Math.round(value * 100)}% explored${done ? ' · tour completed' : ''}${quiz !== undefined ? ` · best quiz ${Math.round(quiz * 100)}%` : ''}`}>
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      ) : (
        <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
          <circle cx="10" cy="10" r={r} fill="none" stroke="rgba(117,91,70,0.15)" strokeWidth="2.5" />
          {value > 0 && <circle cx="10" cy="10" r={r} fill="none" stroke="#eb7c6b" strokeWidth="2.5" strokeDasharray={`${c * value} ${c}`} strokeLinecap="round" />}
        </svg>
      )}
    </div>
  );
};

/** Architecture library: search, category filters, learning progress, user models. */
export const LeftSidebar: React.FC<{ variant?: 'panel' | 'sheet'; onPicked?: () => void }> = ({ variant = 'panel', onPicked }) => {
  const archId = useAppStore((s) => s.archId);
  const setArch = useAppStore((s) => s.setArch);
  const search = useAppStore((s) => s.search);
  const setSearch = useAppStore((s) => s.setSearch);
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const progress = useAppStore((s) => s.progress);
  const custom = useAppStore((s) => s.custom);
  const removeCustom = useAppStore((s) => s.removeCustom);
  const openModal = useAppStore((s) => s.openModal);
  const onboardingPath = useAppStore((s) => s.onboarding.path);

  const all = useMemo(() => listArchitectures(custom), [custom]);
  const categories = useMemo(() => ['all', ...new Set(all.map((a) => a.category))] as (SystemCategory | 'all')[], [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (!q) return true;
      return [a.name, a.subtitle, a.badge, a.description, ...a.components.map((c) => c.name)].some((t) => t?.toLowerCase().includes(q));
    });
  }, [all, search, category]);

  const pick = (a: Architecture) => {
    // switch first (ignored by the URL while the landing page is up), then leave it → one history entry
    setArch(a.id);
    if (useAppStore.getState().home) useAppStore.getState().setHome(false);
    onPicked?.();
  };

  const explored = (a: Architecture) => {
    const visited = new Set(progress.visited[a.id] ?? []);
    if (!a.components.length || !visited.size) return 0;
    const { spec } = resolveArchitecture(a.id, custom);
    const carriers = [...spec.nodes, ...(spec.groups ?? [])];
    const seen = a.components.filter((c) => carriers.some((n) => (n.content === c.id || n.id === c.id) && visited.has(n.id))).length;
    return seen / a.components.length;
  };

  const shell =
    variant === 'panel'
      ? 'w-[285px] flex-shrink-0 h-full bg-[rgba(255,251,244,0.82)] backdrop-blur-md border border-[rgba(117,91,70,0.18)] rounded-[26px] shadow-[0_18px_48px_rgba(87,62,43,0.06)] p-4'
      : 'w-full h-full p-1';

  return (
    <aside className={`${shell} flex flex-col z-20 overflow-hidden select-none font-sans`}>
      <div className="flex items-center justify-between px-1 pb-2 flex-shrink-0">
        <span className="uppercase tracking-[0.13em] text-[10px] font-semibold text-[#8d847c]">Architecture library</span>
        <span className="text-[10px] font-mono font-bold text-[#eb7c6b]">
          {filtered.length}/{all.length}
        </span>
      </div>

      {/* search */}
      <label className="relative flex-shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8d847c]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models or layers (e.g. attention)"
          className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/80 border border-[rgba(117,91,70,0.18)] text-xs text-[#2f2a27] placeholder:text-[#a69c92] outline-none focus:border-[#eb7c6b] focus:ring-2 focus:ring-[#eb7c6b]/15"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8d847c] hover:text-[#2f2a27]" aria-label="Clear search">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </label>

      {/* category chips */}
      <div className="flex flex-wrap gap-1 pt-2 pb-2 flex-shrink-0 border-b border-[rgba(117,91,70,0.12)]">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
              category === c ? 'bg-[#eb7c6b] border-[#eb7c6b] text-white' : 'bg-white/60 border-[rgba(117,91,70,0.16)] text-[#8d847c] hover:text-[#2f2a27]'
            }`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pt-2 space-y-1 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="text-xs text-[#8d847c] text-center py-6">
            No models match “{search}”.{' '}
            <button className="underline text-[#eb7c6b]" onClick={() => (setSearch(''), setCategory('all'))}>
              Clear filters
            </button>
          </div>
        )}
        {filtered.map((arch) => {
          const isSelected = arch.id === archId;
          const isCustom = !!custom[arch.id];
          return (
            <div key={arch.id} className="relative group">
              <button
                onClick={() => pick(arch)}
                className={`w-full min-h-[62px] grid grid-cols-[44px_1fr_24px] items-center gap-2 text-left p-2 rounded-[15px] border transition-all ${
                  isSelected
                    ? 'bg-[rgba(253,234,226,0.72)] border-[#eb7c6b]/50 shadow-[0_8px_20px_rgba(195,91,70,0.07)]'
                    : 'bg-transparent border-transparent hover:bg-white/50 hover:border-[rgba(117,91,70,0.12)]'
                }`}
              >
                <img src={arch.thumbnail} alt="" width={42} height={42} className="w-[42px] h-[42px] rounded-full border border-[rgba(121,86,67,0.15)] bg-white" />
                <div className="min-w-0">
                  <b className="block font-serif font-medium text-[16px] leading-[1.1] text-[#2f2a27] truncate group-hover:text-[#eb7c6b] transition-colors">{arch.name}</b>
                  <small className="block mt-0.5 text-[10px] text-[#8d847c] truncate">{arch.badge}</small>
                </div>
                <ProgressRing value={explored(arch)} done={progress.toursCompleted.includes(arch.id)} quiz={progress.quizBest[arch.id]} />
              </button>
              {isCustom && (
                <button
                  onClick={() => removeCustom(arch.id)}
                  className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#8d847c] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete this saved model"
                  aria-label={`Delete ${arch.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {(() => {
        const path = onboardingPath;
        if (!path?.length) return null;
        const done = new Set(progress.toursCompleted);
        const next = path.find((id) => !done.has(id));
        const n = path.filter((id) => done.has(id)).length;
        return (
          <button
            onClick={() => (next && ARCHITECTURES_BY_ID[next] ? pick(ARCHITECTURES_BY_ID[next]) : openModal('path'))}
            className="mt-2 flex-shrink-0 text-left p-2.5 rounded-xl bg-[#2f2a27] text-white hover:bg-black"
            title="Your recommended path"
          >
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-[#f5b3a8]">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3" /> Your path
              </span>
              <span>
                {n}/{path.length}
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-[#eb7c6b]" style={{ width: `${(n / path.length) * 100}%` }} />
            </div>
            <div className="mt-1.5 text-[12px] font-serif truncate">{next ? `Next: ${ARCHITECTURES_BY_ID[next]?.name}` : 'Path complete 🎉'}</div>
          </button>
        );
      })()}

      <div className="flex-shrink-0 pt-2 mt-1 border-t border-[rgba(117,91,70,0.12)] space-y-1.5">
        <button onClick={() => openModal('import')} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-[rgba(117,91,70,0.2)] text-[#2f2a27] text-[11px] font-semibold hover:border-[#eb7c6b]">
          <Upload className="w-3.5 h-3.5" /> Import ONNX
        </button>
        <a
          href={AGENTDECODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('agentdecode_clicked', { from: 'library' })}
          title="AgentDecode 3D: prompting, RAG, tool calling and AI agents, running step by step in 3D"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-[#f6f1fb] to-[#eef7fa] border border-[#8d6bcc]/25 text-[#5b3fb3] text-[11px] font-semibold hover:border-[#8d6bcc]/60"
        >
          <Bot className="w-3.5 h-3.5" /> Learn AI agents in 3D ↗
        </a>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8d847c] px-1">
          <GraduationCap className="w-3.5 h-3.5 text-[#8d6bcc]" />
          {progress.toursCompleted.length} tours completed · {progress.basicsDone?.length ?? 0} basics learned
        </div>
      </div>
    </aside>
  );
};
