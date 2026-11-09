import type { GraphSpec } from './spec/schema';
import { getOp } from './ops';
import { seeded } from './render/style';

/**
 * A tiny schematic of the network as an inline SVG data URI: one coloured bar per
 * operation (in order, coloured by op family), on a soft gradient disc.
 * Zero network requests, unique per architecture, and actually informative.
 */
export function specThumbnail(spec: GraphSpec, seed: string): string {
  const rand = seeded(`thumb:${seed}`);
  const ops = spec.nodes.filter((n) => n.op !== 'output').slice(0, 14);
  const n = ops.length;
  const hue = Math.floor(rand() * 360);
  const barH = Math.min(9, 70 / n);
  const gap = barH * 0.35;
  const totalH = n * barH + (n - 1) * gap;
  const top = 50 - totalH / 2;
  const bars = ops
    .map((node, i) => {
      const op = getOp(node.op);
      const w = 26 + ((op.family.length * 7 + i * 13) % 34);
      const y = top + (n - 1 - i) * (barH + gap); // data flows upward, like the 3D view
      return `<rect x="${50 - w / 2}" y="${y.toFixed(1)}" width="${w}" height="${barH.toFixed(1)}" rx="${(barH / 2.4).toFixed(1)}" fill="${op.color}"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="35%" cy="30%"><stop offset="0" stop-color="#fffaf3"/><stop offset="1" stop-color="hsl(${hue},45%,86%)"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/>${bars}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
