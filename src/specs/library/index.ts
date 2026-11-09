import type { GraphSpec } from '../../engine/spec/schema';
import { mlpSpec, lstmSpec, vaeSpec, ganSpec, gcnSpec } from './classic';
import { gpt2Spec, bertSpec, vitSpec, clipSpec, whisperSpec } from './transformers';
import { unetSpec, deepseekSpec } from './advanced';

/** Self-describing architectures: lessons, tour and quiz are generated from the spec. */
export const LIBRARY: Record<string, GraphSpec> = {
  mlp: mlpSpec,
  lstm: lstmSpec,
  gpt2: gpt2Spec,
  bert: bertSpec,
  vit: vitSpec,
  unet: unetSpec,
  vae: vaeSpec,
  gan: ganSpec,
  gcn: gcnSpec,
  clip: clipSpec,
  whisper: whisperSpec,
  deepseek: deepseekSpec,
};
