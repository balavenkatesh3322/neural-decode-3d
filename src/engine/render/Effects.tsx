import React from 'react';
import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing';
import { effectsState } from './Lens';

/**
 * Post-processing tuned for a light "specimen board" background:
 * - N8AO adds soft contact shading so stacked blocks read as 3D
 * - Bloom only catches un-tone-mapped emissive > 1 (selected / active parts),
 *   never the cream background
 */
export const Effects: React.FC<{ quality: 'high' | 'low' }> = ({ quality }) => {
  React.useEffect(() => {
    effectsState.mounted = true;
    return () => {
      effectsState.mounted = false;
    };
  }, []);
  if (quality === 'low') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={1} luminanceSmoothing={0.1} mipmapBlur intensity={0.5} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={1.1} intensity={2.2} distanceFalloff={0.6} halfRes quality="medium" color="#3b2f27" />
      <Bloom luminanceThreshold={1} luminanceSmoothing={0.1} mipmapBlur intensity={0.65} />
      <Vignette offset={0.28} darkness={0.32} />
    </EffectComposer>
  );
};
