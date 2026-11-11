import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { resolveArchitecture, specToHash } from '../../engine/registry';
import { track } from '../../lib/track';
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
  const tourStep = useAppStore((st) => st.tour.step);
  const [atStep, setAtStep] = useState(tourStep > 1);
  const [embedCopied, setEmbedCopied] = useState(false);
  const { architecture, spec } = resolveArchitecture(archId, custom);
  // built-in models get a clean path; your own models travel inside the link itself
  const archUrl = `${window.location.origin}/architecture/${encodeURIComponent(archId)}`;
  const shareUrl = custom[archId] ? `${archUrl}#${specToHash(spec)}` : `${archUrl}${atStep && tourStep > 1 ? `?step=${tourStep}` : ''}`;
  const shareTitle = atStep && tourStep > 1 ? `${architecture.name}, step ${tourStep}, in 3D — NeuralDecode` : `${architecture.name} in 3D — NeuralDecode`;
  const embedCode = `<iframe src="${window.location.origin}/embed/${encodeURIComponent(archId)}" width="100%" height="520" style="border:0;border-radius:16px" title="${architecture.name} — NeuralDecode 3D" loading="lazy" allow="fullscreen"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // clipboard blocked (http, iframe): select the text so the user can copy manually
      const input = document.getElementById('share-url') as HTMLInputElement | null;
      input?.select();
    }
    setCopied(true);
    track('shared', { via: 'copy', arch: archId });
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
          className="relative bg-[#fffbf4] border border-[rgba(117,91,70,0.18)] rounded-[28px] max-w-md w-full max-h-[92dvh] overflow-y-auto custom-scrollbar p-6 shadow-[0_24px_60px_rgba(87,62,43,0.15)] z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#eb7c6b] text-white flex items-center justify-center shadow-md">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#eb7c6b] uppercase block">
                  Share this architecture
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2f2a27] leading-tight">{architecture.name}</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[rgba(117,91,70,0.18)] bg-white/40 flex items-center justify-center text-[#8d847c] hover:text-[#2f2a27] hover:bg-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {tourStep > 1 && !custom[archId] && (
            <label className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.18)] text-xs text-[#2f2a27] cursor-pointer">
              <input type="checkbox" checked={atStep} onChange={(e) => setAtStep(e.target.checked)} className="accent-[#eb7c6b]" />
              Link to <b>this exact moment</b> (tour step {tourStep})
            </label>
          )}

          {/* Social Share Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {socialLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  onClick={() => track('shared', { via: item.name, arch: archId })}
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

          {!custom[archId] && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8d847c]">Embed in your blog or course</div>
              <div className="p-2.5 rounded-2xl bg-[#2f2a27] flex items-start gap-2">
                <code className="flex-1 text-[10px] font-mono text-[#f6efe6] break-all leading-relaxed select-text">{embedCode}</code>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(embedCode);
                    } catch {
                      /* clipboard blocked */
                    }
                    setEmbedCopied(true);
                    track('shared', { via: 'embed', arch: archId });
                    setTimeout(() => setEmbedCopied(false), 2000);
                  }}
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#eb7c6b] text-white text-[10px] font-bold"
                >
                  {embedCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {embedCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
