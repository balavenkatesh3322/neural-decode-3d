import { describe, expect, it } from 'vitest';
import { inferGraph, isDataEdge } from '../graph/infer';
import { buildScene } from '../scene';
import { buildVisibleGraph } from '../graph/visible';
import { GRAPHS } from '../../specs';

function overlaps(a: { pos: number[]; size: { w: number; h: number } }, b: typeof a) {
  return (
    Math.abs(a.pos[0] - b.pos[0]) * 2 < a.size.w + b.size.w - 0.01 &&
    Math.abs(a.pos[1] - b.pos[1]) * 2 < a.size.h + b.size.h - 0.01
  );
}

describe('layout', () => {
  for (const [id, spec] of Object.entries(GRAPHS)) {
    it(`${id}: lays out every node and edge, flows upward, no overlaps`, async () => {
      const infer = inferGraph(spec);
      const { visible, layout } = await buildScene(spec, infer, new Set());
      expect(layout.nodes.size).toBe(visible.nodes.length);
      expect(layout.edges.size).toBe(visible.edges.length);

      // data flows bottom → top
      for (const e of spec.edges.filter(isDataEdge)) {
        const a = layout.nodes.get(e.from);
        const b = layout.nodes.get(e.to);
        if (a && b) expect(b.pos[1], `${e.from} → ${e.to}`).toBeGreaterThan(a.pos[1]);
      }

      const ns = [...layout.nodes.values()];
      for (let i = 0; i < ns.length; i++)
        for (let j = i + 1; j < ns.length; j++)
          expect(overlaps(ns[i], ns[j]), `${ns[i].id} overlaps ${ns[j].id}`).toBe(false);

      // every node sits inside its group frame
      for (const n of visible.nodes) {
        if (!n.parent) continue;
        const g = layout.groups.get(n.parent)!;
        const p = layout.nodes.get(n.id)!.pos;
        expect(Math.abs(p[0] - g.pos[0])).toBeLessThan(g.w / 2);
        expect(Math.abs(p[1] - g.pos[1])).toBeLessThan(g.h / 2);
      }
    });
  }

  it('collapsing a group replaces its children with one summary node', async () => {
    const spec = GRAPHS.transformer;
    const v = buildVisibleGraph(spec, new Set(['block']));
    expect(v.nodes.find((n) => n.id === 'block')?.kind).toBe('group');
    expect(v.nodes.some((n) => n.id === 'qkv')).toBe(false);
    expect(v.rep.get('qkv')).toBe('block');
    expect(v.edges.map((e) => `${e.from}->${e.to}`)).toEqual(expect.arrayContaining(['rope->block', 'block->normf']));
    const { layout } = await buildScene(spec, inferGraph(spec), new Set(['block']));
    expect(layout.nodes.has('block')).toBe(true);
  });
});
