import { CORE_OPS } from './core';
import { SEQUENCE_OPS } from './sequence';
import { VISION_OPS } from './vision';
import { GENERATIVE_OPS } from './generative';
import type { OpDef } from './types';

export const OPS: Record<string, OpDef> = {
  ...CORE_OPS,
  ...SEQUENCE_OPS,
  ...VISION_OPS,
  ...GENERATIVE_OPS,
};

export function getOp(name: string): OpDef {
  return OPS[name] ?? OPS.custom;
}

export * from './types';
