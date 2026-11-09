import { Architecture } from '../../types/architecture';
import { transformerArchitecture } from './transformer';
import { transformerFullArchitecture } from './transformerFull';
import { moeArchitecture } from './moe';
import { cnnArchitecture } from './cnn';
import { mambaArchitecture } from './mamba';
import { diffusionArchitecture } from './diffusion';
import { architectureFromSpec } from '../../engine/autoContent';
import { LIBRARY } from '../../specs/library';
import { specThumbnail } from '../../engine/thumbnail';
import { transformerGraph } from '../../specs/transformer.graph';
import { transformerFullGraph } from '../../specs/transformerFull.graph';
import { moeGraph } from '../../specs/moe.graph';
import { cnnGraph } from '../../specs/cnn.graph';
import { mambaGraph } from '../../specs/mamba.graph';
import { diffusionGraph } from '../../specs/diffusion.graph';

/** Architectures generated entirely from self-describing specs (lessons, tour and quiz included). */
export const LIBRARY_ARCHITECTURES: Architecture[] = Object.entries(LIBRARY).map(([id, spec]) => architectureFromSpec(id, spec));

/** Hand-written lessons, with a generated schematic thumbnail (no image downloads). */
const HANDWRITTEN: Architecture[] = (
  [
    [transformerArchitecture, transformerGraph],
    [transformerFullArchitecture, transformerFullGraph],
    [moeArchitecture, moeGraph],
    [cnnArchitecture, cnnGraph],
    [mambaArchitecture, mambaGraph],
    [diffusionArchitecture, diffusionGraph],
  ] as const
).map(([a, g]) => ({ ...a, thumbnail: specThumbnail(g, a.id) }));

export const ALL_ARCHITECTURES: Architecture[] = [...HANDWRITTEN, ...LIBRARY_ARCHITECTURES];

export const ARCHITECTURES_BY_ID: Record<string, Architecture> = Object.fromEntries(ALL_ARCHITECTURES.map((a) => [a.id, a]));
