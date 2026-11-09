import type { GraphSpec } from '../engine/spec/schema';
import { transformerGraph } from './transformer.graph';
import { transformerFullGraph } from './transformerFull.graph';
import { moeGraph } from './moe.graph';
import { cnnGraph } from './cnn.graph';
import { mambaGraph } from './mamba.graph';
import { diffusionGraph } from './diffusion.graph';
import { LIBRARY } from './library';

/** Graph specs keyed by architecture id (matches src/data/architectures). */
export const GRAPHS: Record<string, GraphSpec> = {
  transformer: transformerGraph,
  'transformer-full': transformerFullGraph,
  moe: moeGraph,
  cnn: cnnGraph,
  mamba: mambaGraph,
  diffusion: diffusionGraph,
  ...LIBRARY,
};
