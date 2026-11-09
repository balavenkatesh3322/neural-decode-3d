import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { resolveArchitecture, specToHash } from '../../engine/registry';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  MessageCircle,
  Linkedin,
  Twitter,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const archId = useAppStore((st) => st.archId);
  const custom = useAppStore((st) => st.custom);
  const { architecture, spec } = resolveArchitecture(archId, custom);
  // built-in models get a short link; your own models travel inside the link itself
  const base = `${window.location.origin}${window.location.pathname}`;
  const shareUrl = custom[archId] ? `${base}#${specToHash(spec)}` : `${base}#arch=${encodeURIComponent(archId)}`;
  const shareTitle = `${architecture.name} in 3D — NeuralDecode`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // clipboard blocked (http, iframe): select the text so the user can copy manually
      const input = document.getElementById('share-url') as HTMLInputElement | null;
      input?.select();
    }
    setCopied(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const nativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const socialLinks = [
    {
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-black text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    },
    {
      name: 'Reddit',
      icon: Globe,
      color: 'bg-[#FF4500] text-white',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2f2a27]/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] rounded-[28px] max-w-md w-full p-6 shadow-[0_24px_60px_rgba(87,62,43,0.15)] overflow-hidden z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#eb7c6b] text-white flex items-center justify-center shadow-md">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#eb7c6b] uppercase block">
                  SHARE SPECIMEN ENGINE
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2f2a27]">
                  Spread NeuralDecode 3D
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[rgba(117,91,70,0.18)] bg-white/40 flex items-center justify-center text-[#8d847c] hover:text-[#2f2a27] hover:bg-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social Share Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {socialLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-3 rounded-2xl ${item.color} font-bold text-xs shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>

          {nativeShare && (
            <button
              onClick={() => navigator.share({ title: shareTitle, url: shareUrl }).catch(() => undefined)}
              className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#2f2a27] text-white text-xs font-bold"
            >
              <Share2 className="w-4 h-4" /> Share via your device…
            </button>
          )}
          {/* Copy Link Input Bar */}
          <div className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.18)] flex items-center gap-2 shadow-inner">
            <input
              id="share-url"
              type="text"
              aria-label="Link to share"
              onFocus={(e) => e.currentTarget.select()}
              readOnly
              value={shareUrl}
              className="flex-1 text-xs font-mono text-[#8d847c] bg-transparent focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eb7c6b] text-white font-sans font-bold text-xs shadow-sm hover:bg-[#e87868] transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
