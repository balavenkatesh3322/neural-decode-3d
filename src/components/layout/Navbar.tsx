import React, { useState } from 'react';
import { SystemCategory } from '../../types/architecture';
import {
  Boxes,
  Layers,
  Globe,
  Github,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Compass,
  BrainCircuit,
  BookOpen,
  BarChart2,
  Sliders,
  Share2,
} from 'lucide-react';

interface NavbarProps {
  activeCategory: SystemCategory | 'all';
  searchQuery: string;
  onSelectCategory: (cat: SystemCategory | 'all') => void;
  onSearchChange: (query: string) => void;
  onOpenBuildingBlocks: () => void;
  onOpenLesson: () => void;
  onOpenQuiz: () => void;
  onOpenCompare: () => void;
  onOpenPlayground: () => void;
  onOpenShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBuildingBlocks,
  onOpenLesson,
  onOpenCompare,
  onOpenPlayground,
  onOpenShare,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'components' | 'lessons' | 'compare' | 'playground'>('explore');

  return (
    <header className="h-[68px] max-w-[1720px] w-full mx-auto px-4 md:px-6 flex items-center justify-between z-30 select-none relative flex-nowrap whitespace-nowrap">
      {/* 1. Left Section: Brand Logo & Tagline */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-baseline gap-3 cursor-pointer">
          <strong className="font-serif font-medium text-2xl md:text-3xl text-[#2f2a27] tracking-tight leading-none whitespace-nowrap">
            NeuralDecode<sup className="text-[#eb7c6b] font-sans text-xs font-normal pl-0.5">✦</sup>
          </strong>
          <em className="text-xs font-cursive italic text-[#8d6bcc] hidden sm:inline-block whitespace-nowrap">
            Learn AI like an artist
          </em>
        </div>
      </div>

      {/* 2. Center Section: Exact Anatomy Atelier Main Navigation Buttons (.main-nav) */}
      <nav className="hidden lg:flex items-center justify-center gap-1.5 px-2 py-1 rounded-full bg-[#f3eee5] border border-[rgba(117,91,70,0.18)] shadow-inner">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
            activeTab === 'explore'
              ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </button>

        {/* Core Components Tab */}
        <button
          onClick={() => {
            setActiveTab('components');
            onOpenBuildingBlocks();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
            activeTab === 'components'
              ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Core Components</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('lessons');
            onOpenLesson();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
            activeTab === 'lessons'
              ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lessons</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('compare');
            onOpenCompare();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
            activeTab === 'compare'
              ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('playground');
            onOpenPlayground();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
            activeTab === 'playground'
              ? 'bg-[#eb7c6b]/10 text-[#eb7c6b] border border-[#eb7c6b]/30 font-semibold shadow-sm'
              : 'text-[#8d847c] hover:text-[#2f2a27] hover:bg-white/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Playground</span>
        </button>
      </nav>

      {/* 3. Right Section: Share Button, GitHub Repository Link & Creator Profile Avatar Image */}
      <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
        {/* Share Button */}
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#eb7c6b] text-white font-sans font-bold text-xs shadow-sm hover:bg-[#e87868] transition-all whitespace-nowrap flex-shrink-0"
            title="Share NeuralDecode 3D Link"
          >
            <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Share</span>
          </button>
        )}

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/balavenkatesh3322/neural-decode-3d"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 border border-[rgba(117,91,70,0.18)] hover:border-[#2f2a27] text-[#2f2a27] font-sans text-xs shadow-sm hover:shadow transition-all group whitespace-nowrap flex-shrink-0"
          title="GitHub Repository: balavenkatesh3322/neural-decode-3d"
        >
          <Github className="w-4 h-4 text-[#2f2a27] group-hover:scale-110 transition-transform flex-shrink-0" />
          <span className="font-semibold">Repository</span>
        </a>

        {/* Profile Avatar Image (Replaces BV text badge with Bala Venkatesh portrait photo) */}
        <a
          href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0"
          title="Creator Portfolio: Bala Venkatesh"
        >
          <img
            src="/bv_avatar.jpg"
            alt="Bala Venkatesh"
            className="w-[38px] h-[38px] rounded-full object-cover border-2 border-[#eb7c6b] ring-4 ring-[#f7eee5] shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
          />
          <ChevronDown className="w-3.5 h-3.5 text-[#8d847c] flex-shrink-0" />
        </a>
      </div>

      {/* Responsive Mobile Menu Toggle Button (< 768px) */}
      <div className="flex md:hidden items-center gap-2 flex-shrink-0">
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="p-1.5 rounded-full bg-[#eb7c6b] text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-[#2f2a27] text-[#eb7c6b]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#fffbf4] border-b border-[rgba(117,91,70,0.18)] p-4 space-y-3 shadow-2xl md:hidden z-50 animate-modal-content">
          <a
            href="https://github.com/balavenkatesh3322/neural-decode-3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#2f2a27] text-white font-medium text-xs"
          >
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-[#eb7c6b]" />
              <span>GitHub Repository (balavenkatesh3322)</span>
            </div>
            <Globe className="w-4 h-4 text-[#eb7c6b]" />
          </a>

          <a
            href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[rgba(117,91,70,0.18)] text-[#2f2a27] font-medium text-xs"
          >
            <div className="flex items-center gap-2">
              <img src="/bv_avatar.jpg" alt="BV" className="w-6 h-6 rounded-full object-cover border border-[#eb7c6b]" />
              <span>Created by Bala Venkatesh</span>
            </div>
            <Globe className="w-4 h-4 text-[#eb7c6b]" />
          </a>
        </div>
      )}
    </header>
  );
};
