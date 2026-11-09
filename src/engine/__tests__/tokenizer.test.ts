import { describe, expect, it } from 'vitest';
import { tokenizeGPT2 } from '../../features/realmodel/useRealLM';

describe('local GPT-2 tokenizer', () => {
  it('produces the same ids as GPT-2 (no network needed)', async () => {
    expect((await tokenizeGPT2('Hello world')).ids).toEqual([15496, 995]);
    const r = await tokenizeGPT2('The cat sat on the');
    expect(r.ids).toEqual([464, 3797, 3332, 319, 262]);
    expect(r.pieces).toEqual(['The', ' cat', ' sat', ' on', ' the']);
  });
});
