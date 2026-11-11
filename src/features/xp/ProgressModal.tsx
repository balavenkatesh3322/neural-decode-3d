import React, { useMemo, useState } from 'react';
import { Trophy, Flame, Zap, Award, Download, Linkedin, CalendarCheck, Lock, Brain } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { ALL_ARCHITECTURES, ARCHITECTURES_BY_ID } from '../../data/architectures';
import { TRACKS, type Track } from '../../data/tracks';
import { LEVELS, XP, levelFor, liveStreak, today } from './levels';
import { seeded } from '../../engine/render/style';
import { track } from '../../lib/track';
import { playSfx } from '../audio/audio';

const SITE = 'https://neuraldecode.vercel.app';

/** Today’s challenge: the same quiz question for everyone on a given day. */
function dailyChallenge(date: string) {
  const pool = ALL_ARCHITECTURES.filter((a) => a.quizQuestions.length > 0);
  if (!pool.length) return null;
  const rand = seeded(`daily:${date}`);
  const a = pool[Math.floor(rand() * pool.length)];
  const q = a.quizQuestions[Math.floor(rand() * a.quizQuestions.length)];
  return { topic: a, p: { question: q.question, options: q.options, answer: q.correctOptionIndex, explanation: q.explanation } };
}

/** Render a 1200×630 certificate PNG in the browser. */
function drawCertificate(name: string, t: Track, topics: number): string {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 630;
  const g = c.getContext('2d')!;
  g.fillStyle = '#FBF9F5';
  g.fillRect(0, 0, 1200, 630);
  g.strokeStyle = t.color;
  g.lineWidth = 10;
  g.strokeRect(30, 30, 1140, 570);
  g.lineWidth = 2;
  g.strokeRect(48, 48, 1104, 534);
  g.fillStyle = t.color;
  g.beginPath();
  g.arc(1060, 140, 56, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff';
  g.font = 'bold 54px Georgia, serif';
  g.textAlign = 'center';
  g.fillText(String(t.id), 1060, 160);
  g.textAlign = 'left';
  g.fillStyle = '#8d847c';
  g.font = '600 22px system-ui, sans-serif';
  g.fillText('CERTIFICATE OF COMPLETION', 100, 140);
  g.fillStyle = '#2f2a27';
  g.font = '64px Georgia, serif';
  g.fillText(name || 'NeuralDecode learner', 100, 250);
  g.fillStyle = '#534a43';
  g.font = '28px system-ui, sans-serif';
  g.fillText('has completed the track', 100, 310);
  g.fillStyle = t.color;
  g.font = 'bold 52px Georgia, serif';
  g.fillText(`${t.name}`, 100, 380);
  g.fillStyle = '#534a43';
  g.font = '24px system-ui, sans-serif';
  g.fillText(`${topics} interactive 3D architectures · ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, 100, 430);
  g.fillStyle = '#2f2a27';
  g.font = '36px Georgia, serif';
  g.fillText('NeuralDecode', 100, 540);
  g.fillStyle = '#eb7c6b';
  g.fillText('✦', 320, 530);
  g.fillStyle = '#8d847c';
  g.font = '20px system-ui, sans-serif';
  g.fillText('neuraldecode.vercel.app · by Bala Venkatesh', 360, 538);
  return c.toDataURL('image/png');
}

/** Level, streak, daily challenge and track certificates. */
export const ProgressModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const progress = useAppStore((s) => s.progress);
  const name = useAppStore((s) => s.prefs.name ?? '');
  const setPrefs = useAppStore((s) => s.setPrefs);
  const xp = progress.xp ?? 0;
  const lvl = levelFor(xp);
  const streak = liveStreak(progress.streak);
  const date = today();
  const challenge = useMemo(() => dailyChallenge(date), [date]);
  const [picked, setPicked] = useState<number | null>(null);
  const doneToday = progress.dailyDone === date;

  const doneIds = new Set(progress.toursCompleted);
  const tracks = TRACKS.map((t) => {
    const core = t.core.map((id) => ARCHITECTURES_BY_ID[id]).filter(Boolean);
    const done = core.filter((a) => doneIds.has(a.id)).length;
    return { t, core, done, complete: core.length > 0 && done === core.length };
  });

  const answer = (i: number) => {
    if (!challenge || picked !== null || doneToday) return;
    setPicked(i);
    const ok = i === challenge.p.answer;
    playSfx(ok ? 'correct' : 'wrong');
    track('daily_done', { correct: ok });
    useAppStore.setState((s) => ({ progress: { ...s.progress, dailyDone: date } }));
    if (ok) useAppStore.getState().award(XP.daily, 'Daily challenge');
  };

  const download = (t: Track, topics: number) => {
    const a = document.createElement('a');
    a.href = drawCertificate(name, t, topics);
    a.download = `neuraldecode-${t.short.toLowerCase()}-certificate.png`;
    a.click();
    track('certificate_downloaded', { track: t.id });
  };

  return (
    <Modal title="Your progress" kicker={`${lvl.emoji} ${lvl.title} · ${xp} XP`} icon={<Trophy className="w-4 h-4" />} onClose={onClose} size="lg">
      <div className="p-4 sm:p-5 space-y-4">
        {/* level */}
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2 p-4 rounded-2xl bg-[#2f2a27] text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#f5b3a8]">Level {lvl.index + 1}</div>
                <div className="font-serif text-2xl">
                  {lvl.emoji} {lvl.title}
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-2xl font-bold text-[#E3A23B]">{xp}</div>
                <div className="text-[10px] text-white/60">XP</div>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-[#E3A23B] rounded-full transition-all" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-white/60">{lvl.next ? `${lvl.next.xp - xp} XP to ${lvl.next.emoji} ${lvl.next.title}` : 'Max level reached'}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[rgba(117,91,70,0.14)] flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <Flame className={`w-7 h-7 ${streak ? 'text-orange-500 fill-orange-400' : 'text-stone-300'}`} />
              <span className="font-serif text-3xl text-[#2f2a27]">{streak}</span>
            </div>
            <div className="text-[11px] text-[#8d847c]">day streak · learn something daily to keep it</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] text-[#8d847c]">
          {[
            ['Tours finished', progress.toursCompleted.length],
            ['Daily streak', streak],
            ['Basics learned', progress.basicsDone?.length ?? 0],
            ['Predictions right', `${progress.predicted?.right ?? 0}/${progress.predicted?.total ?? 0}`],
          ].map(([k, v]) => (
            <div key={k as string} className="p-2.5 rounded-xl bg-white border border-[rgba(117,91,70,0.12)]">
              <div className="font-mono text-lg font-bold text-[#2f2a27]">{v}</div>
              {k}
            </div>
          ))}
        </div>

        {/* daily challenge */}
        {challenge && (
          <section className="p-4 rounded-2xl bg-[#f6f1fb] border border-[#8d6bcc]/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8d6bcc]">
                <CalendarCheck className="w-4 h-4" /> Daily challenge · +{XP.daily} XP
              </div>
              <span className="text-[10px] text-[#8d847c]">{challenge.topic.name}</span>
            </div>
            <p className="text-xs text-[#534a43]">
              Today’s question is about <b>{challenge.topic.name}</b>.
            </p>
            <div className="font-serif text-lg text-[#2f2a27] flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#8d6bcc]" /> {challenge.p.question}
            </div>
            <div className="space-y-1.5">
              {challenge.p.options.map((o, i) => {
                const reveal = picked !== null || doneToday;
                const cls = !reveal
                  ? 'bg-white border-[rgba(117,91,70,0.18)] hover:border-[#8d6bcc]'
                  : i === challenge.p.answer
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : i === picked
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white border-transparent opacity-50';
                return (
                  <button key={i} onClick={() => answer(i)} disabled={doneToday && picked === null} className={`w-full text-left px-3 py-2 rounded-xl text-[13px] border ${cls}`}>
                    {o}
                  </button>
                );
              })}
            </div>
            {(picked !== null || doneToday) && challenge.p.explanation && <p className="text-xs text-[#534a43] leading-relaxed">{challenge.p.explanation}</p>}
            {doneToday && picked === null && <p className="text-xs text-[#8d847c]">Done for today. Come back tomorrow for a new one 🔥</p>}
          </section>
        )}

        {/* certificates */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-[#2f2a27] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E3A23B]" /> Track certificates
            </h3>
            <input
              value={name}
              onChange={(e) => setPrefs({ name: e.target.value.slice(0, 40) })}
              placeholder="Your name on certificates"
              className="w-48 px-2.5 py-1.5 rounded-xl border border-[rgba(117,91,70,0.2)] text-xs outline-none focus:border-[#eb7c6b]"
            />
          </div>
          <p className="text-[11px] text-[#8d847c]">Finish the guided tour of every Core architecture in a track to unlock its certificate.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {tracks.map(({ t, core, done, complete }) => (
              <div key={t.id} className={`p-3 rounded-2xl border ${complete ? 'bg-white border-[#E3A23B]/60 shadow-sm' : 'bg-[#fbf7f1] border-[rgba(117,91,70,0.14)]'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-mono text-sm font-bold" style={{ background: t.color }}>
                    {t.id}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-[#2f2a27]">{t.name}</span>
                  {complete ? <Award className="w-5 h-5 text-[#E3A23B]" /> : <Lock className="w-4 h-4 text-stone-300" />}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#ece4d8] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(done / Math.max(1, core.length)) * 100}%`, background: t.color }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8d847c]">
                    {done}/{core.length} core architectures
                  </span>
                  {complete && (
                    <span className="flex gap-1">
                      <button onClick={() => download(t, core.length)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2f2a27] text-white text-[10px] font-semibold">
                        <Download className="w-3 h-3" /> PNG
                      </button>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('shared', { via: 'linkedin-certificate' })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0A66C2] text-white text-[10px] font-semibold"
                      >
                        <Linkedin className="w-3 h-3" /> Share
                      </a>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-3 rounded-2xl bg-white border border-[rgba(117,91,70,0.12)]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8d847c] mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3" /> How to earn XP
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#534a43]">
            <span>Finish a guided tour · +{XP.tour}</span>
            <span>Learn a basic · +{XP.basic}</span>
            <span>Correct prediction · +{XP.predict}</span>
            <span>Daily challenge · +{XP.daily}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {LEVELS.map((l, i) => (
              <span key={l.title} className={`px-2 py-0.5 rounded-full text-[10px] border ${i <= lvl.index ? 'bg-[#E3A23B]/15 border-[#E3A23B]/40 text-[#8a5a00]' : 'border-[rgba(117,91,70,0.14)] text-[#a69c92]'}`}>
                {l.emoji} {l.title} · {l.xp}
              </span>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
};
