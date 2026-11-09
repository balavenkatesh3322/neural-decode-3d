import { STORIES, type Story } from '../data/stories';
import type { ArchitectureModel } from './useArchitectureModel';
import { getOp } from './ops';
import { fmtNum, fmtSym } from './graph/shape';

/** Where the real input enters and the final answer leaves the graph. */
export function ioNodes(model: ArchitectureModel): { inputId?: string; outputId?: string } {
  const { infer } = model;
  const order = infer.order;
  const inputId = order.find((id) => infer.nodes.get(id)!.node.op === 'input');
  // the output is the deepest node that nothing else consumes
  const consumed = new Set(model.spec.edges.map((e) => e.from));
  const sinks = order.filter((id) => !consumed.has(id));
  const outputId = sinks.sort((a, b) => infer.nodes.get(b)!.level - infer.nodes.get(a)!.level)[0];
  return { inputId, outputId };
}

/** Hand-written story when we have one; otherwise one generated from the graph itself. */
export function storyFor(model: ArchitectureModel): Story {
  const known = STORIES[model.architecture.id];
  if (known) return known;
  const { architecture, infer } = model;
  const { inputId, outputId } = ioNodes(model);
  const inInfo = inputId ? infer.nodes.get(inputId) : undefined;
  const outInfo = outputId ? infer.nodes.get(outputId) : undefined;
  const steps = architecture.dataFlowSteps;
  const initials = steps
    .slice(0, 6)
    .map((s) => s.title.replace(/[^A-Za-z]/g, '')[0]?.toUpperCase() ?? '')
    .join('');
  return {
    problems: [
      { title: architecture.keyFacts.primaryUse !== '—' ? architecture.keyFacts.primaryUse : 'Your task', example: architecture.description },
    ],
    input: { label: inInfo?.node.label ?? 'Input', value: inInfo ? `a tensor of shape ${fmtNum(inInfo.out)}` : 'model input' },
    output: {
      label: outInfo?.node.label ?? 'Output',
      value: outInfo ? `shape ${fmtNum(outInfo.out)}` : 'model output',
      meaning: outInfo ? `${getOp(outInfo.node.op).describe} Symbolically ${fmtSym(outInfo.out)}.` : '',
    },
    journey: steps.map((s) => `${s.title}: ${s.realWorldCalculation}`),
    remember: {
      oneLiner: architecture.description,
      mnemonic: initials ? `${initials} — the first letters of each stop on the tour.` : 'Follow the tour stops in order.',
      keyIdeas: architecture.components.slice(0, 3).map((c) => `${c.name}: ${c.fiveYearOldWhy}`),
    },
  };
}
