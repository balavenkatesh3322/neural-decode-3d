import { Architecture } from '../../types/architecture';
import { transformerArchitecture } from './transformer';
import { transformerFullArchitecture } from './transformerFull';
import { moeArchitecture } from './moe';
import { cnnArchitecture } from './cnn';
import { mambaArchitecture } from './mamba';
import { diffusionArchitecture } from './diffusion';

export const ALL_ARCHITECTURES: Architecture[] = [
  transformerArchitecture,
  transformerFullArchitecture,
  moeArchitecture,
  cnnArchitecture,
  mambaArchitecture,
  diffusionArchitecture,
];

export const ARCHITECTURES_BY_ID: Record<string, Architecture> = {
  transformer: transformerArchitecture,
  'transformer-full': transformerFullArchitecture,
  moe: moeArchitecture,
  cnn: cnnArchitecture,
  mamba: mambaArchitecture,
  diffusion: diffusionArchitecture,
};
