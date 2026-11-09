import { describe, expect, it } from 'vitest';
import { ALL_ARCHITECTURES } from '../../data/architectures';
import { STORIES } from '../../data/stories';
import { BASICS, UNITS } from '../../data/basics';
import { OPS } from '../ops';
import { GRAPHS } from '../../specs';
import { buildArchitectureModel } from '../useArchitectureModel';
import { ioNodes, storyFor } from '../story';
import { architectureFromSpec } from '../autoContent';

describe('real-world stories', () => {
  for (const a of ALL_ARCHITECTURES) {
    it(`${a.id} has a complete story and resolvable input/output nodes`, () => {
      const s = STORIES[a.id];
      expect(s, 'missing story').toBeDefined();
      expect(s.problems.length).toBeGreaterThanOrEqual(3);
      expect(s.journey.length).toBeGreaterThanOrEqual(3);
      expect(s.remember.keyIdeas.length).toBeGreaterThanOrEqual(3);
      const m = buildArchitectureModel(a, GRAPHS[a.id], {});
      const io = ioNodes(m);
      expect(io.inputId).toBeDefined();
      expect(io.outputId).toBeDefined();
    });
  }
  it('custom models get a generated story', () => {
    const { lesson, ...rest } = GRAPHS.mlp.nodes[0];
    void lesson;
    const spec = { ...GRAPHS.mlp, meta: { name: 'Mine' }, nodes: [rest, ...GRAPHS.mlp.nodes.slice(1)] };
    const arch = architectureFromSpec('mine', spec);
    const s = storyFor(buildArchitectureModel(arch, spec, {}));
    expect(s.input.value).toMatch(/\(1, 784\)/);
    expect(s.journey.length).toBe(arch.dataFlowSteps.length);
  });
});

describe('Deep Learning Basics course', () => {
  it('has 30+ concepts covering every unit, with unique ids', () => {
    expect(BASICS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(BASICS.map((b) => b.id)).size).toBe(BASICS.length);
    for (const u of UNITS) expect(BASICS.some((b) => b.unit === u.id), u.id).toBe(true);
  });
  for (const b of BASICS) {
    it(`${b.id}: valid check question and real op links`, () => {
      expect(b.check.answer).toBeLessThan(b.check.options.length);
      for (const op of b.relatedOps ?? []) expect(OPS[op], `${b.id} → ${op}`).toBeDefined();
    });
  }
});
