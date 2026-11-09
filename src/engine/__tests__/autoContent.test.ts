import { describe, expect, it } from 'vitest';
import { ALL_ARCHITECTURES } from '../../data/architectures';
import { GRAPHS } from '../../specs';
import { buildArchitectureModel } from '../useArchitectureModel';
import { architectureFromSpec } from '../autoContent';

describe('every architecture is fully teachable', () => {
  for (const arch of ALL_ARCHITECTURES) {
    it(`${arch.id}: lessons map to graph nodes, every tour step resolves, quiz is valid`, () => {
      const m = buildArchitectureModel(arch, GRAPHS[arch.id], {});
      expect(m.infer.errors).toEqual([]);
      expect(arch.components.length).toBeGreaterThan(2);
      for (const c of arch.components) expect(m.specIdForComponent.has(c.id), c.id).toBe(true);
      for (const s of arch.dataFlowSteps) expect(m.specIdForStep(s.stepIndex), s.title).toBeDefined();
      expect(arch.quizQuestions.length).toBeGreaterThan(0);
      for (const q of arch.quizQuestions) {
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.question).toBe(q.options.length);
      }
    });
  }

  it('a bare spec with no lessons still gets stops, a tour and a quiz', () => {
    const spec = { ...GRAPHS.mlp, meta: undefined, nodes: GRAPHS.mlp.nodes.map(({ lesson, ...n }) => n) };
    const arch = architectureFromSpec('bare', spec);
    expect(arch.components.length).toBeGreaterThan(2);
    expect(arch.dataFlowSteps.length).toBe(arch.components.length);
    expect(arch.quizQuestions.length).toBeGreaterThanOrEqual(2);
  });
});
