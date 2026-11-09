import { FOUNDATIONS } from './foundations';
import { ADVANCED } from './advanced';
import type { Basic } from './types';

export * from './types';

/** The full Deep Learning Basics course, in learning order. */
export const BASICS: Basic[] = [...FOUNDATIONS, ...ADVANCED];
