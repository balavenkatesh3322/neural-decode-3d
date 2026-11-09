import React, { useEffect } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Mobile bottom sheet: slides up over the 3D view, drag the handle down (or tap
 * the backdrop / press Esc) to close. Built on framer-motion — no extra dependency.
 */
export const BottomSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: string;
}> = ({ open, onClose, title, children, height = '78dvh' }) => {
  const drag = useDragControls();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-[#2f2a27]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-label={title}
            className="fixed left-0 right-0 bottom-0 z-[61] rounded-t-[24px] bg-[#fffbf4] border-t border-[rgba(117,91,70,0.18)] shadow-[0_-18px_40px_rgba(87,62,43,0.18)] flex flex-col"
            style={{ height, paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragControls={drag}
            dragListener={false}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
          >
            {/* drag from the header only, so lists inside the sheet still scroll */}
            <div
              className="relative flex items-center justify-between px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => drag.start(e)}
            >
              <span className="font-serif text-lg text-[#2f2a27]">{title}</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1.5 rounded-full bg-[#d8cdc1]" />
              <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-[#8d847c] hover:text-[#2f2a27]" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden px-2 pb-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
