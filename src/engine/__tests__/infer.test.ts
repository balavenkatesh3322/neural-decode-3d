import { describe, expect, it } from 'vitest';
import { inferGraph } from '../graph/infer';
import { evalExpr, resolveConfig } from '../graph/expr';
import { fmtSym } from '../graph/shape';
import { GraphSpecSchema } from '../spec/schema';
import { GRAPHS } from '../../specs';

describe('expression evaluator', () => {
  it('handles precedence, parens and symbols', () => {
    expect(evalExpr('2 + 3 * 4', {})).toBe(14);
    expect(evalExpr('(2 + 3) * 4', {})).toBe(20);
    expect(evalExpr('d_model / n_heads', { d_model: 4096, n_heads: 32 })).toBe(128);
    expect(evalExpr('-x + 1', { x: 3 })).toBe(-2);
  });
  it('rejects unknown symbols and code', () => {
    expect(() => evalExpr('foo', {})).toThrow(/Unknown symbol/);
    expect(() => evalExpr('alert(1)', {})).toThrow();
    expect(() => evalExpr('a;b', { a: 1, b: 2 })).toThrow();
  });
  it('resolves ordered config with overrides', () => {
    const s = resolveConfig({ d: 4096, h: 32, hd: 'd / h' }, { h: 64 });
    expect(s.hd).toBe(64);
  });
});

describe('built-in specs', () => {
  for (const [id, spec] of Object.entries(GRAPHS)) {
    it(`${id}: validates and infers without errors`, () => {
      const parsed = GraphSpecSchema.safeParse(spec);
      expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true);
      const r = inferGraph(spec);
      expect(r.errors).toEqual([]);
      expect(r.totalParams).toBeGreaterThan(0);
    });
  }

  it('Llama-3-8B decoder ≈ 8.03B params with correct shapes', () => {
    const r = inferGraph(GRAPHS.transformer);
    expect(r.totalParams / 1e9).toBeCloseTo(8.03, 2);
    expect(fmtSym(r.nodes.get('qkv')!.out)).toBe('(B, n_heads, T, head_dim)');
    expect(r.nodes.get('qkv')!.out.num).toEqual([1, 32, 8, 128]);
    expect(r.nodes.get('head')!.out.num).toEqual([1, 8, 128256]);
  });

  it('changing config recomputes shapes and params', () => {
    const r = inferGraph(GRAPHS.transformer, { d_model: 2048, n_layers: 16 });
    expect(r.nodes.get('qkv')!.out.num).toEqual([1, 32, 8, 64]);
    expect(r.totalParams).toBeLessThan(inferGraph(GRAPHS.transformer).totalParams / 2);
  });

  it('ResNet-50 has exactly 25,557,032 params and 1000 logits', () => {
    const r = inferGraph(GRAPHS.cnn);
    expect(r.totalParams).toBe(25_557_032);
    expect(r.nodes.get('maxpool')!.out.num).toEqual([1, 64, 56, 56]);
    expect(r.nodes.get('stage4')!.out.num).toEqual([1, 2048, 7, 7]);
    expect(r.nodes.get('fc')!.out.num).toEqual([1, 1000]);
  });

  it('U-Net skip connections line up and output matches the latent', () => {
    const r = inferGraph(GRAPHS.diffusion);
    expect(r.nodes.get('u1')!.inputs.map((s) => s.num[2])).toEqual([8, 8]);
    expect(r.nodes.get('conv_out')!.out.num).toEqual([1, 4, 64, 64]);
    // SD-1.5's UNet is ~860M across 4 resolutions; our teaching spec keeps 3 of
    // them (no 8×8 attention-free level), so it should land at roughly 70% of that.
    const unet = r.totalParams - r.nodes.get('text')!.params;
    expect(unet / 1e6).toBeGreaterThan(500);
    expect(unet / 1e6).toBeLessThan(860);
  });

  it('MoE router emits top-k weights and the combine restores d_model', () => {
    const r = inferGraph(GRAPHS.moe);
    expect(r.nodes.get('router')!.out.num).toEqual([1, 16, 2]);
    expect(r.nodes.get('combine')!.out.num).toEqual([1, 16, 7168]);
  });
});

describe('schema validation', () => {
  it('rejects dangling edges and duplicate ids', () => {
    const bad = {
      config: {},
      nodes: [
        { id: 'a', op: 'input' },
        { id: 'a', op: 'linear' },
      ],
      edges: [{ from: 'a', to: 'missing' }],
    };
    const r = GraphSpecSchema.safeParse(bad);
    expect(r.success).toBe(false);
    const msgs = r.success ? [] : r.error.issues.map((i) => i.message).join(' | ');
    expect(msgs).toMatch(/Duplicate node id/);
    expect(msgs).toMatch(/unknown id "missing"/);
  });
});

describe('library architectures match published parameter counts', () => {
  const total = (id: string) => inferGraph(GRAPHS[id]).totalParams;
  it('GPT-2 small = 124,439,808', () => expect(total('gpt2')).toBe(124_439_808));
  it('BERT-base = 109,482,240', () => expect(total('bert')).toBe(109_482_240));
  it('ViT-B/16 = 86,567,656', () => expect(total('vit')).toBe(86_567_656));
  it('CLIP ViT-B/32 = 151,277,313', () => expect(total('clip')).toBe(151_277_313));
  it('U-Net (BN, 3-channel) = 31,037,698', () => expect(total('unet')).toBe(31_037_698));
  it('GCN on Cora = 23,063', () => expect(total('gcn')).toBe(23_063));
  it('MLP 784-512-256-10 = 535,818', () => expect(total('mlp')).toBe(535_818));
  it('Whisper base = 72,593,920 (HF count)', () => expect(total('whisper')).toBe(72_593_920));
  it('DeepSeek-V3 ≈ 671B', () => {
    const t = total('deepseek') / 1e9;
    expect(t).toBeGreaterThan(640);
    expect(t).toBeLessThan(700);
  });
  it('ViT turns a 224² image into 197 tokens', () => {
    expect(inferGraph(GRAPHS.vit).nodes.get('pos')!.out.num).toEqual([1, 197, 768]);
  });
  it('U-Net returns a full-resolution mask', () => {
    expect(inferGraph(GRAPHS.unet).nodes.get('outc')!.out.num).toEqual([1, 2, 256, 256]);
  });
});
