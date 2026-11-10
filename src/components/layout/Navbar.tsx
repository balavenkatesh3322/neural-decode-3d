import React, { useState } from 'react';
import { MessageCircle, Menu, X, Compass, BrainCircuit, BookOpen, BarChart2, Sliders, Share2, HelpCircle, Wrench, Globe, Brain } from 'lucide-react';
import { useAppStore, ModalId } from '../../store/useAppStore';
import { PROFILE_URL, whatsappUrl } from '../../config/contact';

const TABS: { id: ModalId | 'explore'; label: string; icon: React.ReactNode; title: string }[] = [
  { id: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" />, title: 'Back to the 3D model' },
  { id: 'blocks', label: 'Basics', icon: <BrainCircuit className="w-4 h-4" />, title: 'Deep learning basics, end to end: 33 concepts with sandboxes' },
  { id: 'study', label: 'Study', icon: <Brain className="w-4 h-4" />, title: 'Real-world story, cheat sheet and flashcards for this architecture' },
  { id: 'lesson', label: 'Lessons', icon: <BookOpen className="w-4 h-4" />, title: 'Step-by-step lesson for this architecture' },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" />, title: 'Test yourself on this architecture' },
  { id: 'compare', label: 'Compare', icon: <BarChart2 className="w-4 h-4" />, title: 'Compare two architectures side by side' },
  { id: 'pipeline', label: 'Playground', icon: <Sliders className="w-4 h-4" />, title: 'Type a prompt and follow it through a real model' },
  { id: 'editor', label: 'Build', icon: <Wrench className="w-4 h-4" />, title: 'Build or edit your own architecture' },
];


/** Top bar. The active tab is derived from which panel is open, so it never goes stale. */
export const Navbar: React.FC = () => {
  const modals = useAppStore((s) => s.modals);
  const openModal = useAppStore((s) => s.openModal);
  const closeModal = useAppStore((s) => s.closeModal);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeTab = (TABS.find((t) => t.id !== 'explore' && modals[t.id as ModalId])?.id ?? 'explore') as string;

  const go = (id: ModalId | 'explore') => {
    // one panel at a time; "Explore" simply closes them
    (Object.keys(modals) as ModalId[]).forEach((m) => modals[m] && closeModal(m));
    if (id !== 'explore') openModal(id);
    setMenuOpen(false);
  };

  return (
    <header className="h-[56px] lg:h-[68px] max-w-[1720px] w-full mx-auto px-3 md:px-6 flex items-center justify-between gap-3 z-40 select-none relative flex-shrink-0">
      <button onClick={() => go('explore')} className="flex items-baseline gap-3 flex-shrink-0" title="NeuralDecode 3D home">
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
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => go('share')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#eb7c6b] text-white font-bold text-xs shadow-sm hover:bg-[#e06a58]"
          title="Share a link to exactly what you are looking at"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white text-xs font-bold shadow-sm"
          title="Chat with Bala on WhatsApp (+91 90038 12808) to learn more"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Learn with Bala</span>
        </a>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/80 border border-[rgba(117,91,70,0.18)] hover:border-[#eb7c6b] flex-shrink-0 group"
          title="Bala Venkatesh — creator profile"
        >
          <img src="/bv_avatar.webp" alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover border-2 border-[#eb7c6b] group-hover:scale-105 transition-transform" />
          <span className="hidden xl:inline text-xs font-semibold text-[#2f2a27]">Bala Venkatesh</span>
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
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold">
            <MessageCircle className="w-4 h-4" /> WhatsApp Bala
          </a>
          <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white text-[#2f2a27] text-sm">
            <Globe className="w-4 h-4 text-[#eb7c6b]" /> Bala Venkatesh
          </a>
        </div>
      )}
    </header>
  );
};
