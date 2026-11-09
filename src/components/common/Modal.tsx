import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Responsive modal shell: full-screen on phones, a centred card on larger screens. Esc closes. */
export const Modal: React.FC<{
  title: string;
  kicker?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}> = ({ title, kicker, icon, onClose, children, footer, size = 'lg' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const width = size === 'md' ? 'sm:max-w-xl' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-6xl';

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 font-sans" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-[#2f2a27]/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className={`relative w-full ${width} h-full sm:h-auto sm:max-h-[90dvh] bg-[#fffbf4] sm:border border-[rgba(117,91,70,0.18)] sm:rounded-[26px] shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[rgba(117,91,70,0.14)] bg-white/60 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="w-9 h-9 rounded-2xl bg-[#eb7c6b] text-white flex items-center justify-center flex-shrink-0">{icon}</div>}
            <div className="min-w-0">
              {kicker && <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#eb7c6b]">{kicker}</span>}
              <h2 className="font-serif text-xl text-[#2f2a27] leading-tight truncate">{title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#8d847c] hover:text-[#2f2a27] hover:bg-stone-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">{children}</div>
        {footer && <div className="flex-shrink-0 px-4 sm:px-5 py-3 border-t border-[rgba(117,91,70,0.14)] bg-white/60">{footer}</div>}
      </motion.div>
    </div>
  );
};
