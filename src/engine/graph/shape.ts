import type { Dim } from '../spec/schema';
import { evalExpr, Scope } from './expr';

/**
 * A tensor shape tracked two ways at once:
 * - `sym`: the symbolic form a textbook would write, e.g. ['B', 'T', 'd_model']
 * - `num`: the concrete numbers for the current config, e.g. [1, 8, 4096]
 */
export interface Shape {
  sym: string[];
  num: number[];
}

export interface DimValue {
  sym: string;
  num: number;
}

export function dim(d: Dim, scope: Scope): DimValue {
  if (typeof d === 'number') return { sym: String(d), num: d };
  return { sym: d.replace(/\s+/g, ''), num: evalExpr(d, scope) };
}

export function shapeOf(dims: Dim[], scope: Scope): Shape {
  const vals = dims.map((d) => dim(d, scope));
  return { sym: vals.map((v) => v.sym), num: vals.map((v) => v.num) };
}

export function withLast(s: Shape, d: DimValue): Shape {
  return { sym: [...s.sym.slice(0, -1), d.sym], num: [...s.num.slice(0, -1), d.num] };
}

export function numel(s: Shape): number {
  return s.num.reduce((a, b) => a * b, 1);
}

/** Symbolic division that stays readable: 'H' / 2 → 'H/2', '224' / 2 → '112'. */
export function symDiv(sym: string, by: number): string {
  if (by === 1) return sym;
  const n = Number(sym);
  if (!Number.isNaN(n)) return String(Math.floor(n / by));
  const m = sym.match(/^(.*)\/(\d+)$/);
  if (m) return `${m[1]}/${Number(m[2]) * by}`;
  return `${sym}/${by}`;
}

export function symMul(sym: string, by: number): string {
  if (by === 1) return sym;
  const n = Number(sym);
  if (!Number.isNaN(n)) return String(n * by);
  const m = sym.match(/^(.*)\/(\d+)$/);
  if (m && Number(m[2]) % by === 0) {
    const d = Number(m[2]) / by;
    return d === 1 ? m[1] : `${m[1]}/${d}`;
  }
  return `${by}·${sym}`;
}

export const fmtSym = (s: Shape) => `(${s.sym.join(', ')})`;
export const fmtNum = (s: Shape) => `(${s.num.map((n) => n.toLocaleString('en-US')).join(', ')})`;

export function fmtCount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

export function fmtBytes(n: number): string {
  if (n >= 2 ** 30) return `${(n / 2 ** 30).toFixed(2)} GiB`;
  if (n >= 2 ** 20) return `${(n / 2 ** 20).toFixed(1)} MiB`;
  if (n >= 2 ** 10) return `${(n / 2 ** 10).toFixed(1)} KiB`;
  return `${n} B`;
}
