/** Learning levels unlocked by XP. */
export const LEVELS = [
  { xp: 0, title: 'Curious Mind', emoji: '🌱' },
  { xp: 100, title: 'Neuron Tinkerer', emoji: '🔌' },
  { xp: 300, title: 'Layer Stacker', emoji: '🧱' },
  { xp: 600, title: 'Attention Seeker', emoji: '👀' },
  { xp: 1000, title: 'Transformer Builder', emoji: '🤖' },
  { xp: 1600, title: 'Model Engineer', emoji: '⚙️' },
  { xp: 2400, title: 'Architecture Architect', emoji: '🏛️' },
  { xp: 3500, title: 'Deep Learning Master', emoji: '👑' },
];

/** XP per action. */
export const XP = { tour: 20, basic: 10, predict: 5, daily: 15 } as const;

export function levelFor(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return { index: i, ...cur, next, progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 };
}

/** Local calendar day, e.g. "2026-11-11". */
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Advance a daily streak when the learner does something today. */
export function bumpStreak(streak: { count: number; last: string } | undefined, now = new Date()) {
  const t = today(now);
  if (!streak) return { count: 1, last: t };
  if (streak.last === t) return streak;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return { count: streak.last === today(y) ? streak.count + 1 : 1, last: t };
}

/** Streak as shown today: 0 if the learner missed yesterday. */
export function liveStreak(streak: { count: number; last: string } | undefined, now = new Date()) {
  if (!streak) return 0;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return streak.last === today(now) || streak.last === today(y) ? streak.count : 0;
}
