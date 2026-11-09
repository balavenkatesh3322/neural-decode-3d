import { z } from 'zod';

/**
 * A dimension is either a literal number or a symbolic expression evaluated
 * against the graph config, e.g. `'d_model'`, `'d_model / n_heads'`, `'2 * d_inner'`.
 */
export const DimSchema = z.union([z.number(), z.string().min(1)]);
export type Dim = z.infer<typeof DimSchema>;

export const EdgeKindSchema = z.enum(['data', 'residual', 'skip', 'control', 'condition']);
export type EdgeKind = z.infer<typeof EdgeKindSchema>;

/** Inline teaching notes for a node (used when there is no separate lesson file). */
export const LessonSchema = z.object({
  title: z.string().optional(),
  description: z.string(),
  eli5: z.string().optional(),
  impact: z.string().optional(),
  formula: z.string().optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const OpNodeSchema = z.object({
  id: z.string().min(1),
  /** Key into the op registry (src/engine/ops). */
  op: z.string().min(1),
  label: z.string().optional(),
  params: z.record(z.any()).optional(),
  /** Group this node belongs to. */
  group: z.string().optional(),
  /** id of a rich NodeComponent (lesson content) in the architecture data. */
  content: z.string().optional(),
  /** Inline lesson; makes this node a numbered stop in the auto-generated tour. */
  lesson: LessonSchema.optional(),
});
export type OpNode = z.infer<typeof OpNodeSchema>;

export const EdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  kind: EdgeKindSchema.optional(),
  label: z.string().optional(),
});
export type GraphEdge = z.infer<typeof EdgeSchema>;

export const GroupSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  /** How many times this block is stacked in the real model (e.g. 32 decoder layers). */
  repeat: DimSchema.optional(),
  parent: z.string().optional(),
  content: z.string().optional(),
  collapsed: z.boolean().optional(),
  color: z.string().optional(),
});
export type GraphGroup = z.infer<typeof GroupSchema>;

export const ControlSchema = z.object({
  key: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number().optional(),
  /** Restrict to a discrete set of values (e.g. powers of two). */
  options: z.array(z.number()).optional(),
});
export type ConfigControl = z.infer<typeof ControlSchema>;

export const MetaSchema = z.object({
  name: z.string(),
  subtitle: z.string().optional(),
  category: z.enum(['llm', 'vision', 'ssm', 'generative', 'classic', 'multimodal', 'custom']).optional(),
  badge: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  year: z.string().optional(),
  primaryUse: z.string().optional(),
  innovations: z.string().optional(),
  paperTitle: z.string().optional(),
  paperUrl: z.string().optional(),
  sampleInput: z.string().optional(),
});
export type SpecMeta = z.infer<typeof MetaSchema>;

export const TourStepSchema = z.object({
  node: z.string(),
  title: z.string(),
  text: z.string(),
  why: z.string().optional(),
  calc: z.string().optional(),
});

export const QuizSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explanation: z.string(),
  node: z.string().optional(),
});

export const GraphSpecSchema = z
  .object({
    meta: MetaSchema.optional(),
    tour: z.array(TourStepSchema).optional(),
    quiz: z.array(QuizSchema).optional(),
    /** Ordered: later entries may reference earlier ones (`head_dim: 'd_model / n_heads'`). */
    config: z.record(z.union([z.number(), z.string()])),
    controls: z.array(ControlSchema).optional(),
    /** Human-readable tokens/labels used by visuals (e.g. the prompt tokens). */
    sampleTokens: z.array(z.string()).optional(),
    nodes: z.array(OpNodeSchema).min(1),
    edges: z.array(EdgeSchema),
    groups: z.array(GroupSchema).optional(),
  })
  .superRefine((spec, ctx) => {
    const nodeIds = new Set<string>();
    for (const n of spec.nodes) {
      if (nodeIds.has(n.id)) ctx.addIssue({ code: 'custom', message: `Duplicate node id "${n.id}"` });
      nodeIds.add(n.id);
    }
    const groupIds = new Set((spec.groups ?? []).map((g) => g.id));
    for (const g of groupIds) {
      if (nodeIds.has(g)) ctx.addIssue({ code: 'custom', message: `Group id "${g}" collides with a node id` });
    }
    for (const n of spec.nodes) {
      if (n.group && !groupIds.has(n.group)) {
        ctx.addIssue({ code: 'custom', message: `Node "${n.id}" references unknown group "${n.group}"` });
      }
    }
    for (const g of spec.groups ?? []) {
      if (g.parent && !groupIds.has(g.parent)) {
        ctx.addIssue({ code: 'custom', message: `Group "${g.id}" references unknown parent "${g.parent}"` });
      }
    }
    for (const e of spec.edges) {
      for (const end of [e.from, e.to]) {
        if (!nodeIds.has(end) && !groupIds.has(end)) {
          ctx.addIssue({ code: 'custom', message: `Edge ${e.from} → ${e.to} references unknown id "${end}"` });
        }
      }
    }
  });
export type GraphSpec = z.infer<typeof GraphSpecSchema>;
