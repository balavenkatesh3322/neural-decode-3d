import React, { useMemo, useState } from 'react';
import { Map as MapIcon, CheckCircle2, Route, MousePointerClick, GraduationCap, ChevronRight, MessageCircle, Globe } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { ALL_ARCHITECTURES, ARCHITECTURES_BY_ID } from '../../data/architectures';
import { BASICS } from '../../data/basics';
import { TRACKS, trackOfArch, type Track } from '../../data/tracks';
import { PROFILE_URL, whatsappUrl } from '../../config/contact';
import { AGENTDECODE_URL } from '../../config/agentdecode';
import { track } from '../../lib/track';
import type { Architecture } from '../../types/architecture';

/** The whole curriculum as a map of tracks: core path first, then optional deep dives. */
export const LearningPathModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const setArch = useAppStore((s) => s.setArch);
  const openModal = useAppStore((s) => s.openModal);
  const basicsDone = useAppStore((s) => s.progress.basicsDone?.length ?? 0);
  const archId = useAppStore((s) => s.archId);
  const progress = useAppStore((s) => s.progress);
  const [active, setActive] = useState<number>(() => trackOfArch(archId)?.id ?? 1);

  const done = (id: string) => {
    const tour = progress.toursCompleted.includes(id);
    const explored = (progress.visited[id]?.length ?? 0) > 0;
    return { tour, explored, score: (tour ? 1 : 0) + (explored ? 1 : 0) };
  };
  const byTrack = useMemo(
    () =>
      TRACKS.map((t) => ({
        t,
        core: t.core.map((id) => ARCHITECTURES_BY_ID[id]).filter(Boolean),
        deep: t.deep.map((id) => ARCHITECTURES_BY_ID[id]).filter(Boolean),
      })),
    [],
  );
  const pct = (list: Architecture[]) => (list.length ? Math.round((list.reduce((s, a) => s + done(a.id).score, 0) / (list.length * 2)) * 100) : 0);
  const cur = byTrack.find((x) => x.t.id === active)!;

  const card = (a: Architecture, t: Track, i: number, small = false) => {
    const d = done(a.id);
    return (
      <button
        key={a.id}
        onClick={() => (setArch(a.id), onClose())}
        className={`text-left ${small ? 'p-2.5' : 'p-3'} rounded-2xl border transition-all hover:shadow-md ${a.id === archId ? 'bg-[rgba(253,234,226,0.8)] border-[#eb7c6b]/60' : 'bg-white border-[rgba(117,91,70,0.14)] hover:border-[#eb7c6b]/40'}`}
      >
        <div className="flex items-start gap-2">
          <img src={a.thumbnail} alt="" width={36} height={36} className="w-9 h-9 rounded-full border border-[rgba(121,86,67,0.15)] bg-white flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-mono font-bold" style={{ color: t.color }}>
              {t.id}.{i + 1}
            </div>
            <div className={`font-serif ${small ? 'text-[13.5px]' : 'text-[15px]'} leading-tight text-[#2f2a27]`}>{a.name}</div>
            {!small && <div className="text-[10px] text-[#8d847c] line-clamp-2 mt-0.5">{a.tagline}</div>}
          </div>
          {d.score === 2 && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Route className={`w-3.5 h-3.5 ${d.tour ? 'text-[#eb7c6b]' : 'text-stone-300'}`} />
          <MousePointerClick className={`w-3.5 h-3.5 ${d.explored ? 'text-[#3FA7C9]' : 'text-stone-300'}`} />
          <span className="ml-auto text-[9px] font-mono text-[#8d847c] uppercase truncate">{a.badge}</span>
        </div>
      </button>
    );
  };

  return (
    <Modal title="Learning path" kicker={`${TRACKS.length} tracks · ${ALL_ARCHITECTURES.length} architectures`} icon={<MapIcon className="w-4 h-4" />} onClose={onClose} size="xl">
      <div className="p-3 sm:p-5 space-y-4">
        <button onClick={() => (onClose(), openModal('blocks'))} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#2f2a27] text-white text-left hover:bg-black">
          <GraduationCap className="w-8 h-8 text-[#eb7c6b] flex-shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[#f5b3a8]">Step 0 · new to deep learning? start here</span>
            <span className="block font-serif text-lg">Deep Learning Basics: {BASICS.length} concepts with interactive sandboxes</span>
            <span className="block text-[11px] text-white/70">
              {basicsDone}/{BASICS.length} done · then follow the tracks below, Core first
            </span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#eb7c6b]" />
        </button>

        {/* track map */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {byTrack.map(({ t, core, deep }) => {
            const p = pct([...core, ...deep]);
            const on = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`relative text-left p-3 rounded-2xl border-2 transition-all ${on ? 'shadow-lg -translate-y-0.5' : 'border-transparent bg-white hover:shadow-md'}`}
                style={on ? { borderColor: t.color, background: `${t.color}12` } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-mono text-sm font-bold flex-shrink-0" style={{ background: t.color }}>
                    {t.id}
                  </span>
                  <span className="font-semibold text-[13px] leading-tight text-[#2f2a27]">{t.name}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#ece4d8] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: t.color }} />
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#8d847c]">
                  {core.length + deep.length} models · {p}%
                </div>
              </button>
            );
          })}
        </div>

        {/* selected track */}
        <section className="rounded-3xl p-4 sm:p-5 space-y-4" style={{ background: `${cur.t.color}0d` }}>
          <div>
            <h3 className="font-serif text-2xl text-[#2f2a27]">
              Track {cur.t.id} · {cur.t.name}
            </h3>
            <p className="text-xs text-[#534a43]">{cur.t.blurb}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: cur.t.color }}>
              Core path · {cur.core.length} · tour each one to earn the certificate
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{cur.core.map((a, i) => card(a, cur.t, i))}</div>
          </div>
          {cur.deep.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8d847c] mb-2">Deep dives · {cur.deep.length} (optional)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{cur.deep.map((a, i) => card(a, cur.t, cur.core.length + i, true))}</div>
            </div>
          )}
        </section>

        <a
          href={AGENTDECODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('agentdecode_clicked', { from: 'path' })}
          className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#f6f1fb] to-[#eef7fa] border border-[#8d6bcc]/25 hover:border-[#8d6bcc]/60"
        >
          <span className="text-2xl">🤖</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#8d6bcc]">Next course · AgentDecode 3D ↗</span>
            <span className="block text-sm text-[#2f2a27]">
              Know what’s <b>inside</b> the models? Now learn how apps <b>use</b> them: prompting, RAG, tool calling, MCP and AI agents, step by step in 3D.
            </span>
          </span>
          <ChevronRight className="w-5 h-5 text-[#8d6bcc]" />
        </a>

        {/* contact */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)]">
          <div className="flex-1">
            <div className="font-serif text-lg text-[#2f2a27]">Want an architecture added, or a workshop for your team?</div>
            <p className="text-xs text-[#8d847c]">Message Bala Venkatesh. Requests decide what gets built next.</p>
          </div>
          <div className="flex gap-2">
            <a
              href={whatsappUrl('learning path')}
              onClick={() => track('contact_clicked', { via: 'whatsapp-path' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:brightness-95"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(117,91,70,0.2)] text-[#2f2a27] text-xs font-semibold hover:border-[#eb7c6b]">
              <Globe className="w-4 h-4 text-[#eb7c6b]" /> Profile
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
