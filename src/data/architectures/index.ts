import { Architecture } from '../../types/architecture';
import { transformerArchitecture } from './transformer';
import { moeArchitecture } from './moe';
import { cnnArchitecture } from './cnn';
import { mambaArchitecture } from './mamba';
import { diffusionArchitecture } from './diffusion';

export const ALL_ARCHITECTURES: Architecture[] = [
  transformerArchitecture,
  moeArchitecture,
  cnnArchitecture,
  mambaArchitecture,
  diffusionArchitecture,
];

export const ARCHITECTURES_BY_ID: Record<string, Architecture> = {
  transformer: transformerArchitecture,
  moe: moeArchitecture,
  cnn: cnnArchitecture,
  mamba: mambaArchitecture,
  diffusion: diffusionArchitecture,
};
