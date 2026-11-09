import { describe, expect, it } from 'vitest';
import { ALL_ARCHITECTURES } from '../../data/architectures';
import { GRAPHS } from '../../specs';
import { buildArchitectureModel } from '../useArchitectureModel';
import { walkthroughFor, dimMeaning } from '../../features/deepdive/walkthroughs';

describe('deep-dive worked examples', () => {
  for (const a of ALL_ARCHITECTURES) {
    it(`${a.id}: every lesson component has a real, finite worked example (or is an input)`, () => {
      const m = buildArchitectureModel(a, GRAPHS[a.id], {});
      for (const c of a.components) {
        const id = m.specIdForComponent.get(c.id)!;
        const node = m.infer.nodes.get(id)?.node ?? null;
        if (!node || node.op === 'input' || node.op === 'output' || node.op === 'custom') continue; // groups / io / black boxes
        const steps = walkthroughFor(node.op, node.params ?? {}, m.spec.sampleTokens ?? []);
        expect(steps.length, `${a.id}/${c.id} (${node.op})`).toBeGreaterThan(1);
        for (const s of steps)
          for (const row of s.table?.rows ?? [])
            for (const v of row) if (typeof v === 'number') expect(Number.isFinite(v), `${a.id}/${c.id}: ${s.title}`).toBe(true);
      }
    });
  }
  it('causal attention masks the future', () => {
    const steps = walkthroughFor('sdpa', { causal: true }, []);
    const mask = steps.find((s) => s.title.startsWith('Causal'))!;
    expect(mask.table!.rows[0]).toContain('−∞');
    const weights = steps.find((s) => s.title.startsWith('Softmax'))!;
    expect(weights.table!.rows[0][1]).toBe('100%');
  });
  it('explains dimensions in words', () => {
    expect(dimMeaning('B', 0, 3)).toMatch(/batch/);
    expect(dimMeaning('T', 1, 3)).toMatch(/tokens/);
    expect(dimMeaning('d_model', 2, 3)).toMatch(/features/);
  });
});
