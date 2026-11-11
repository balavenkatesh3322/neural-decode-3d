import React, { useEffect, useRef, useState } from 'react';
import { PROFILE_URL as PORTFOLIO_URL, whatsappUrl } from '../../config/contact';
import { track } from '../../lib/track';
import { AGENTDECODE_URL } from '../../config/agentdecode';
import { levelFor, liveStreak } from '../../features/xp/levels';
import { Home, Flame, Zap, MessageCircle, Menu, X, Compass, Map, GraduationCap, Share2, Bot, Globe, Brain } from 'lucide-react';

const WHATSAPP_URL = whatsappUrl();
const WHATSAPP_DISPLAY = '+91 90038 12808';
import { useAppStore, ModalId } from '../../store/useAppStore';

const TABS: { id: ModalId | 'explore' | 'home'; label: string; icon: React.ReactNode; title: string }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, title: 'Home: start page, your path and continue' },
  { id: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" />, title: 'The 3D architecture you are on' },
  { id: 'blocks', label: 'Basics', icon: <GraduationCap className="w-4 h-4" />, title: 'Deep learning basics, end to end: 33 concepts with interactive sandboxes' },
  { id: 'path', label: 'Learning Path', icon: <Map className="w-4 h-4" />, title: 'The whole curriculum: 5 tracks, every architecture and your progress' },
  { id: 'study', label: 'Study', icon: <Brain className="w-4 h-4" />, title: 'Real-world story, cheat sheet and flashcards for this architecture' },
];


/** Top bar. The active tab is derived from which panel is open, so it never goes stale. */
export const Navbar: React.FC = () => {
  const modals = useAppStore((s) => s.modals);
  const openModal = useAppStore((s) => s.openModal);
  const closeModal = useAppStore((s) => s.closeModal);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  // close the contact menu on outside click / Escape
  useEffect(() => {
    if (!contactOpen) return;
    const onDown = (e: PointerEvent) => !contactRef.current?.contains(e.target as Node) && setContactOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setContactOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => (window.removeEventListener('pointerdown', onDown), window.removeEventListener('keydown', onKey));
  }, [contactOpen]);

  const home = useAppStore((s) => s.home);
  const xp = useAppStore((s) => s.progress.xp ?? 0);
  const streak = useAppStore((s) => liveStreak(s.progress.streak));
  const lvl = levelFor(xp);
  const activeTab = home ? 'home' : ((TABS.find((t) => t.id !== 'explore' && t.id !== 'home' && modals[t.id as ModalId])?.id ?? 'explore') as string);

  const go = (id: ModalId | 'explore' | 'home') => {
    // one panel at a time; Home shows the start page, Explore the 3D model
    (Object.keys(modals) as ModalId[]).forEach((m) => modals[m] && closeModal(m));
    if (id === 'home') useAppStore.getState().setHome(true);
    else {
      if (useAppStore.getState().home) {
        useAppStore.getState().setHome(false);
        useAppStore.getState().setTour({ playing: false, step: 1 });
      }
      if (id !== 'explore') openModal(id);
    }
    setMenuOpen(false);
  };

  return (
    <header className="h-[56px] lg:h-[68px] max-w-[1720px] w-full mx-auto px-3 md:px-6 flex items-center justify-between gap-3 z-40 select-none relative flex-shrink-0">
      <button onClick={() => go('home')} className="flex items-baseline gap-3 flex-shrink-0" title="NeuralDecode 3D home">
        <strong className="font-serif font-medium text-[22px] lg:text-3xl text-[#2f2a27] tracking-tight leading-none whitespace-nowrap">
          NeuralDecode<sup className="text-[#eb7c6b] font-sans text-xs font-normal pl-0.5">✦</sup>
        </strong>
        <em className="text-xs font-cursive italic text-[#8d6bcc] hidden 2xl:inline-block whitespace-nowrap">Learn AI like an artist</em>
      </button>

      <nav className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-full bg-[#f3eee5] border border-[rgba(117,91,70,0.18)] shadow-inner" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            title={t.title}
            aria-current={activeTab === t.id ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
              activeTab === t.id ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border-[#eb7c6b]/30 font-semibold shadow-sm' : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40 border-transparent'
            }`}
          >
            {t.icon}
            <span className="hidden xl:inline">{t.label}</span>
            <span className="xl:hidden">{t.label.split(' ')[0]}</span>
          </button>
        ))}
        <a
          href={AGENTDECODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('agentdecode_clicked', { from: 'navbar' })}
          title="AgentDecode 3D: prompting, RAG, tool calling and AI agents, running step by step in 3D"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#8d6bcc] hover:text-[#5b3fb3] hover:bg-white/40 border border-transparent whitespace-nowrap"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden xl:inline">AI agents 3D ↗</span>
          <span className="xl:hidden">AgentDecode ↗</span>
        </a>
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => go('progress')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 border border-[rgba(117,91,70,0.18)] hover:border-[#E3A23B] text-[11px] font-semibold text-[#2f2a27]"
          title={`${lvl.emoji} ${lvl.title} · ${xp} XP · ${streak}-day streak: open your progress`}
        >
          <Flame className={`w-3.5 h-3.5 ${streak ? 'text-orange-500 fill-orange-400' : 'text-stone-300'}`} />
          <span className="font-mono">{streak}</span>
          <span className="w-px h-3 bg-[rgba(117,91,70,0.2)]" />
          <Zap className="w-3.5 h-3.5 text-[#E3A23B] fill-[#E3A23B]" />
          <span className="font-mono">{xp}</span>
          <span className="hidden xl:inline text-[#8d847c] font-normal">{lvl.emoji}</span>
        </button>
        <button
          onClick={() => go('share')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#eb7c6b] text-white font-bold text-xs shadow-sm hover:bg-[#e06a58]"
          title="Share a link to exactly what you are looking at"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <div className="relative hidden md:block" ref={contactRef}>
          <button
            onClick={() => setContactOpen(!contactOpen)}
            aria-expanded={contactOpen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 border border-[rgba(117,91,70,0.18)] hover:border-[#2f2a27] text-[#2f2a27] text-xs font-semibold"
            title="Contact Bala Venkatesh"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className="hidden 2xl:inline">Contact</span>
          </button>
          {contactOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] shadow-2xl z-50 space-y-1">
              <div className="px-2 pt-1 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8d847c]">Contact Bala Venkatesh</div>
              <a onClick={() => track('contact_clicked', { via: 'whatsapp' })} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#2f2a27]">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>
                  <b className="block text-xs">WhatsApp</b>
                  <span className="block text-[11px] font-mono text-[#534a43]">{WHATSAPP_DISPLAY}</span>
                </span>
              </a>
              <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white text-[#2f2a27]">
                <Globe className="w-5 h-5 text-[#eb7c6b]" />
                <span>
                  <b className="block text-xs">Profile</b>
                  <span className="block text-[11px] text-[#534a43]">Projects, talks & more</span>
                </span>
              </a>
            </div>
          )}
        </div>
        <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="hidden md:block flex-shrink-0" title="Creator: Bala Venkatesh">
          <img src="/bv_avatar.webp" alt="Bala Venkatesh" width={36} height={36} className="w-9 h-9 rounded-full object-cover border-2 border-[#eb7c6b] ring-4 ring-[#f7eee5] hover:scale-105 transition-transform" />
        </a>
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl bg-[#2f2a27] text-[#eb7c6b]" aria-label="Menu" aria-expanded={menuOpen}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden absolute top-full left-2 right-2 mt-1 p-2 rounded-2xl bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] shadow-2xl z-50 grid grid-cols-2 gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium text-left ${activeTab === t.id ? 'bg-[#eb7c6b]/10 text-[#eb7c6b]' : 'bg-white text-[#2f2a27]'}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <a href={AGENTDECODE_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('agentdecode_clicked', { from: 'menu' })} className="flex items-center gap-2 p-3 rounded-xl bg-[#f6f1fb] text-[#5b3fb3] text-sm">
            <Bot className="w-4 h-4" /> AI agents in 3D ↗
          </a>
          <a onClick={() => track('contact_clicked', { via: 'whatsapp' })} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-[#25D366] text-white text-sm">
            <MessageCircle className="w-4 h-4" /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white text-[#2f2a27] text-sm">
            <Globe className="w-4 h-4 text-[#eb7c6b]" /> Bala’s profile
          </a>
        </div>
      )}
    </header>
  );
};
