/**
 * Tiny, safe arithmetic evaluator for symbolic dimensions.
 * Supports numbers, identifiers (looked up in `scope`), + - * / ( ) and unary minus.
 * No `eval`, so user-supplied specs cannot run code.
 */
export type Scope = Record<string, number>;

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9._e]/i.test(src[j])) j++;
      out.push({ t: 'num', v: Number(src.slice(i, j).replace(/_/g, '')) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      out.push({ t: 'id', v: src.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*/()'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    throw new Error(`Unexpected character "${c}" in "${src}"`);
  }
  return out;
}

export function evalExpr(src: string | number, scope: Scope): number {
  if (typeof src === 'number') return src;
  const toks = tokenize(src);
  let pos = 0;
  const peek = () => toks[pos];
  const take = () => toks[pos++];

  const primary = (): number => {
    const tk = take();
    if (!tk) throw new Error(`Unexpected end of "${src}"`);
    if (tk.t === 'num') return tk.v;
    if (tk.t === 'id') {
      if (!(tk.v in scope)) throw new Error(`Unknown symbol "${tk.v}"`);
      return scope[tk.v];
    }
    if (tk.v === '(') {
      const v = additive();
      const close = take();
      if (!close || close.v !== ')') throw new Error(`Missing ")" in "${src}"`);
      return v;
    }
    if (tk.v === '-') return -primary();
    throw new Error(`Unexpected "${tk.v}" in "${src}"`);
  };
  const multiplicative = (): number => {
    let v = primary();
    while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
      const op = take().v;
      const r = primary();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const additive = (): number => {
    let v = multiplicative();
    while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = take().v;
      const r = multiplicative();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };

  const result = additive();
  if (pos < toks.length) throw new Error(`Trailing input in "${src}"`);
  return result;
}

/** Evaluate an ordered config where later keys may reference earlier ones. */
export function resolveConfig(config: Record<string, number | string>, overrides: Record<string, number> = {}): Scope {
  const scope: Scope = {};
  for (const [k, v] of Object.entries(config)) {
    scope[k] = k in overrides ? overrides[k] : evalExpr(v, scope);
  }
  return scope;
}
