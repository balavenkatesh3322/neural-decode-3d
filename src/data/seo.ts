import { ALL_ARCHITECTURES } from './architectures';
import { trackOfArch } from './tracks';

/** Plain data for build-time page generation (no React, no three.js). */
export const SEO_ARCHITECTURES = ALL_ARCHITECTURES.map((a) => ({
  id: a.id,
  name: a.name,
  description: a.tagline || a.description,
  track: trackOfArch(a.id)?.name ?? a.categoryName,
  keywords: [a.name, a.badge, a.categoryName, ...a.components.map((c) => c.name)].filter(Boolean).slice(0, 12) as string[],
}));
