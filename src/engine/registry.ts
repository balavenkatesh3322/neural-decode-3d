import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Architecture } from '../types/architecture';
import { ALL_ARCHITECTURES, ARCHITECTURES_BY_ID } from '../data/architectures';
import { GRAPHS } from '../specs';
import { GraphSpec, GraphSpecSchema } from './spec/schema';
import { architectureFromSpec } from './autoContent';

const customCache = new WeakMap<GraphSpec, Architecture>();

/** Resolve an architecture id (built-in or user-made) to its lesson data and graph spec. */
export function resolveArchitecture(id: string, custom: Record<string, GraphSpec>): { architecture: Architecture; spec: GraphSpec } {
  const spec = custom[id];
  if (spec) {
    let arch = customCache.get(spec);
    if (!arch) {
      arch = architectureFromSpec(id, spec);
      customCache.set(spec, arch);
    }
    return { architecture: arch, spec };
  }
  const architecture = ARCHITECTURES_BY_ID[id] ?? ALL_ARCHITECTURES[0];
  return { architecture, spec: GRAPHS[architecture.id] ?? GRAPHS.transformer };
}

export function listArchitectures(custom: Record<string, GraphSpec>): Architecture[] {
  return [...ALL_ARCHITECTURES, ...Object.keys(custom).map((id) => resolveArchitecture(id, custom).architecture)];
}

/** Validate a spec from an untrusted source (editor, file, URL). Returns readable errors. */
export function parseSpec(input: unknown): { spec?: GraphSpec; errors: string[] } {
  const r = GraphSpecSchema.safeParse(input);
  if (r.success) return { spec: r.data, errors: [] };
  return { errors: r.error.issues.slice(0, 12).map((i) => `${i.path.join('.') || 'spec'}: ${i.message}`) };
}

export const slugify = (name: string) =>
  `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'model'}`;

// --- deep links ---------------------------------------------------------------
// #arch=<id>            open a built-in or saved architecture
// #spec=<lz-compressed> open an architecture contained entirely in the link

export function specToHash(spec: GraphSpec): string {
  return `spec=${compressToEncodedURIComponent(JSON.stringify(spec))}`;
}

export function readHash(hash: string): { archId?: string; spec?: GraphSpec; error?: string } {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const arch = params.get('arch');
  const packed = params.get('spec');
  if (packed) {
    try {
      const json = JSON.parse(decompressFromEncodedURIComponent(packed) ?? '');
      const { spec, errors } = parseSpec(json);
      return spec ? { spec } : { error: errors.join('\n') };
    } catch {
      return { error: 'The shared link is damaged or incomplete.' };
    }
  }
  return arch ? { archId: arch } : {};
}
