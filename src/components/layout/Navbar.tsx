import React, { useState } from 'react';
import { SystemCategory } from '../../types/architecture';
import {
  Boxes,
  Search,
  BookOpen,
  HelpCircle,
  BarChart2,
  Sliders,
  Sparkles,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Globe,
  Github,
  Linkedin,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  activeCategory: SystemCategory | 'all';
  searchQuery: string;
  isLeftCollapsed?: boolean;
  isRightCollapsed?: boolean;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  onSelectCategory: (cat: SystemCategory | 'all') => void;
  onSearchChange: (query: string) => void;
  onOpenBuildingBlocks: () => void;
  onOpenLesson: () => void;
  onOpenQuiz: () => void;
  onOpenCompare: () => void;
  onOpenPlayground: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  searchQuery,
  isLeftCollapsed = false,
  isRightCollapsed = false,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onSelectCategory,
  onSearchChange,
  onOpenBuildingBlocks,
  onOpenLesson,
  onOpenQuiz,
  onOpenCompare,
  onOpenPlayground,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E8E3D8] px-4 md:px-6 flex items-center justify-between z-30 select-none relative">
      {/* Left Section: Sidebar Toggle & NeuralDecode 3D Brand Logo */}
      <div className="flex items-center gap-2 md:gap-3">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`p-2 rounded-xl border transition-all ${
              isLeftCollapsed
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
            title={isLeftCollapsed ? 'Open Left Library Sidebar' : 'Close Left Library Sidebar'}
          >
            {isLeftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-md border border-stone-800">
            <Boxes className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base md:text-lg text-stone-900 leading-tight">
              NeuralDecode <span className="text-amber-600 font-sans text-xs px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">3D</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-mono text-stone-500 tracking-wider uppercase hidden sm:block">
              Interactive Deep Learning Engine
            </p>
          </div>
        </div>
      </div>

      {/* Center Architecture Category Filters (Desktop) */}
      <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-full bg-[#F3EEE3] border border-[#E0D9C8]">
        {[
          { id: 'all', label: 'All Architectures' },
          { id: 'llm', label: 'LLM & Attention' },
          { id: 'vision', label: 'Vision (CNN)' },
          { id: 'ssm', label: 'Mamba (SSM)' },
          { id: 'generative', label: 'Generative AI' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id as any)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-stone-900 text-amber-400 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right Section: Creator Profile Badge, Building Blocks & Action Buttons */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Creator Profile Badge (Bala Venkatesh) */}
        <a
          href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 text-white border border-amber-500/40 hover:border-amber-400 hover:bg-stone-800 transition-all shadow-sm group"
          title="Creator Portfolio: Bala Venkatesh"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center font-mono">
            BV
          </div>
          <span className="text-xs font-sans font-medium text-stone-200 group-hover:text-amber-300">
            Bala Venkatesh
          </span>
          <Globe className="w-3.5 h-3.5 text-amber-400 animate-[spin_6s_linear_infinite]" />
        </a>

        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search layers..."
            className="w-36 pl-8 pr-3 py-1 text-xs bg-[#F3EEE3] border border-[#E0D9C8] rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-stone-800"
          />
        </div>

        {/* Building Blocks Encyclopedia Button */}
        <button
          onClick={onOpenBuildingBlocks}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all border border-amber-400/50 animate-pulse"
        >
          <Layers className="w-4 h-4 text-amber-100" />
          <span>Building Blocks Section</span>
        </button>

        {/* Right Sidebar Toggle Button */}
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`p-2 rounded-xl border transition-all ${
              isRightCollapsed
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
            title={isRightCollapsed ? 'Open Right Training Inspector' : 'Close Right Training Inspector'}
          >
            {isRightCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Responsive Mobile Drawer Menu Toggle Button (< 768px) */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={onOpenBuildingBlocks}
          className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold"
        >
          Blocks
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-stone-900 text-amber-400"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#FBF9F5] border-b border-[#E8E3D8] p-4 space-y-3 shadow-2xl md:hidden z-50 animate-modal-content">
          {/* Creator Profile Link */}
          <a
            href="https://balavenkatesh3322.github.io/bala_venkatesh_profile/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-stone-900 text-white font-medium text-xs"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Created by Bala Venkatesh (Portfolio)</span>
            </div>
            <Globe className="w-4 h-4 text-amber-400" />
          </a>

          {/* Educational Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenLesson(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>3D Lesson</span>
            </button>
            <button
              onClick={() => { onOpenQuiz(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Quiz</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
