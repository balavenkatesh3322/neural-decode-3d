import { describe, it, expect } from 'vitest';
import { ARCHITECTURES_BY_ID, ALL_ARCHITECTURES } from '../../data/architectures';
import { BASICS } from '../../data/basics';
import { TRACKS } from '../../data/tracks';
import { GOALS, LEVELS, recommend } from '../../features/home/paths';
import { ARCH_TO_AD, BASIC_TO_AD, adLink } from '../../config/agentdecode';
import { bumpStreak, levelFor, liveStreak } from '../../features/xp/levels';
import { buildPredict } from '../../features/tour/useTourDriver';
import { SEO_ARCHITECTURES } from '../../data/seo';

// AgentDecode topic ids (agentdecode.vercel.app/topic/<id>) the links point to
const AD_TOPICS = new Set(['next-token', 'kv-cache', 'what-is-genai', 'embeddings', 'vision-language', 'model-routing', 'sampling', 'llm-serving', 'tokens-context', 'multimodal-rag', 'voice-agent', 'graphrag', 'lora-finetuning', 'llm-as-judge']);

describe('curriculum ids', () => {
  it('every track, goal and link points at a real architecture', () => {
    for (const t of TRACKS) for (const id of [...t.core, ...t.deep]) expect(ARCHITECTURES_BY_ID[id], id).toBeTruthy();
    for (const g of GOALS) for (const id of g.archs) expect(ARCHITECTURES_BY_ID[id], id).toBeTruthy();
    for (const id of Object.keys(ARCH_TO_AD)) expect(ARCHITECTURES_BY_ID[id], id).toBeTruthy();
  });
  it('every built-in architecture belongs to a track and links to AgentDecode', () => {
    const inTracks = new Set(TRACKS.flatMap((t) => [...t.core, ...t.deep]));
    for (const a of ALL_ARCHITECTURES) {
      expect(inTracks.has(a.id), a.id).toBe(true);
      expect(ARCH_TO_AD[a.id], a.id).toBeTruthy();
    }
  });
  it('AgentDecode links use known topics; basics links use real concepts', () => {
    for (const r of [...Object.values(ARCH_TO_AD), ...Object.values(BASIC_TO_AD)]) expect(AD_TOPICS.has(r.topic), r.topic).toBe(true);
    const basics = new Set(BASICS.map((b) => b.id));
    for (const id of Object.keys(BASIC_TO_AD)) expect(basics.has(id), id).toBe(true);
    expect(adLink('kv-cache')).toBe('https://agentdecode.vercel.app/topic/kv-cache');
  });
  it('recommends a non-empty path for every level and goal', () => {
    for (const l of LEVELS) for (const g of GOALS) expect(recommend(l.id, g.id).path.length).toBeGreaterThanOrEqual(3);
    expect(recommend('new', 'llm').startBasics).toBe(true);
    expect(recommend('builder', 'vision').path).not.toContain('mlp');
  });
  it('has SEO data for every architecture', () => {
    expect(SEO_ARCHITECTURES).toHaveLength(ALL_ARCHITECTURES.length);
    for (const s of SEO_ARCHITECTURES) expect(s.description.length).toBeGreaterThan(20);
  });
});

describe('XP and streaks', () => {
  it('levels up at thresholds', () => {
    expect(levelFor(0).index).toBe(0);
    expect(levelFor(100).index).toBe(1);
    expect(levelFor(99999).next).toBeUndefined();
  });
  it('keeps a streak across consecutive days and resets after a gap', () => {
    const d1 = new Date(2026, 10, 10, 12);
    const d2 = new Date(2026, 10, 11, 12);
    const d4 = new Date(2026, 10, 13, 12);
    const s1 = bumpStreak(undefined, d1);
    const s2 = bumpStreak(s1, d2);
    expect(s2.count).toBe(2);
    expect(bumpStreak(s2, d2)).toBe(s2);
    expect(bumpStreak(s2, d4).count).toBe(1);
    expect(liveStreak(s2, d4)).toBe(0);
  });
});

describe('predict mode', () => {
  it('asks with the real next step among 3 distinct options', () => {
    for (const a of ALL_ARCHITECTURES) {
      const steps = a.dataFlowSteps;
      if (steps.length < 4) continue;
      const p = buildPredict(steps, 2, a.id);
      expect(p, a.id).toBeTruthy();
      expect(new Set(p!.options).size).toBe(3);
      expect(p!.options[p!.answer]).toBe(steps.find((s) => s.stepIndex === 2)!.title);
    }
  });
});
