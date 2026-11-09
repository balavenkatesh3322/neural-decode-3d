import type { Architecture, DataFlowStep, NodeComponent, QuizQuestion, SystemCategory } from '../types/architecture';
import type { GraphSpec } from './spec/schema';
import { getOp } from './ops';
import { inferGraph, InferResult } from './graph/infer';
import { fmtCount, fmtNum, fmtSym, numel } from './graph/shape';
import { seeded } from './render/style';
import { specThumbnail } from './thumbnail';

/**
 * Turns any graph spec — built-in, hand-written, shared by link or imported
 * from ONNX — into a full lesson: numbered components, a guided tour and a quiz.
 * Hand-written `lesson` / `tour` / `quiz` entries are used when present; the rest
 * is generated from the inferred shapes and parameter counts.
 */

const MAX_AUTO_STOPS = 10;

/** Nodes that become numbered lesson stops. */
export function lessonNodeIds(spec: GraphSpec, infer: InferResult): string[] {
  const authored = spec.nodes.filter((n) => n.lesson).map((n) => n.id);
  if (authored.length) return authored;
  // no hand-written lessons: pick the input, the heaviest / most distinctive ops, and the output
  const order = infer.order;
  const interesting = order.filter((id) => {
    const info = infer.nodes.get(id)!;
    const op = getOp(info.node.op);
    return info.params > 0 || op.family === 'attention' || op.family === 'routing' || op.family === 'ssm' || op.family === 'io';
  });
  const distinct = interesting;
  if (distinct.length <= MAX_AUTO_STOPS) return distinct;
  const step = (distinct.length - 1) / (MAX_AUTO_STOPS - 1);
  return Array.from({ length: MAX_AUTO_STOPS }, (_, i) => distinct[Math.round(i * step)]);
}

function componentFor(spec: GraphSpec, infer: InferResult, id: string): NodeComponent {
  const info = infer.nodes.get(id)!;
  const node = info.node;
  const op = getOp(node.op);
  const l = node.lesson;
  const inShape = info.inputs[0];
  const total = info.params * info.multiplicity;
  return {
    id,
    name: l?.title ?? node.label ?? op.label,
    subName: op.label,
    category: op.family,
    position: [0, 0, 0],
    color: op.color,
    description: l?.description ?? op.describe,
    fiveYearOldWhy: l?.eli5 ?? op.eli5 ?? op.describe,
    componentImpact: l?.impact,
    mathFormula: l?.formula ?? op.formula ?? '',
    explanation: op.describe,
    keyMetrics: [
      { label: 'Operation', value: op.label },
      { label: 'Parameters', value: info.multiplicity > 1 ? `${fmtCount(info.params)} × ${info.multiplicity} = ${fmtCount(total)}` : fmtCount(info.params) },
      { label: 'Output elements', value: fmtCount(numel(info.out)) },
    ],
    inputTensor: inShape
      ? { name: 'Input', expression: fmtSym(inShape), numericalExample: fmtNum(inShape) }
      : { name: 'Input', expression: '—', numericalExample: '—' },
    outputTensor: { name: 'Output', expression: fmtSym(info.out), numericalExample: fmtNum(info.out) },
    connectedTo: spec.edges.filter((e) => e.from === id).map((e) => e.to),
  };
}

function autoTour(spec: GraphSpec, infer: InferResult, stops: string[]): DataFlowStep[] {
  if (spec.tour?.length) {
    return spec.tour.map((t, i) => {
      const info = infer.nodes.get(t.node);
      return {
        stepIndex: i + 1,
        title: t.title,
        activeNodeId: t.node,
        description: t.text,
        realWorldCalculation: t.calc ?? (info ? `${info.inputs.map(fmtNum).join(' + ') || 'input'} → ${getOp(info.node.op).label} → ${fmtNum(info.out)}` : ''),
        whyItHappened5yo: t.why ?? (info ? getOp(info.node.op).eli5 ?? '' : ''),
        cameraTarget: [0, 0, 0],
        cameraPosition: [0, 0, 10],
      };
    });
  }
  return stops.map((id, i) => {
    const info = infer.nodes.get(id)!;
    const op = getOp(info.node.op);
    const l = info.node.lesson;
    return {
      stepIndex: i + 1,
      title: l?.title ?? info.node.label ?? op.label,
      activeNodeId: id,
      description: l?.description ?? op.describe,
      realWorldCalculation: `${info.inputs.map(fmtNum).join(' + ') || 'data'} → ${op.label} → ${fmtNum(info.out)}`,
      whyItHappened5yo: l?.eli5 ?? op.eli5 ?? `This ${op.label.toLowerCase()} step reshapes the data into ${fmtSym(info.out)}.`,
      cameraTarget: [0, 0, 0],
      cameraPosition: [0, 0, 10],
    };
  });
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(id: string, question: string, correct: string, wrong: string[], explanation: string, rand: () => number, target?: string): QuizQuestion | null {
  const uniqueWrong = [...new Set(wrong.filter((w) => w !== correct))].slice(0, 3);
  if (uniqueWrong.length < 2) return null;
  const options = shuffle([correct, ...uniqueWrong], rand);
  return { id, question, options, correctOptionIndex: options.indexOf(correct), explanation, targetNodeId: target };
}

/** Quiz questions generated from the model's actual shapes and parameter counts. */
export function autoQuiz(spec: GraphSpec, infer: InferResult, stops: string[], archId: string): QuizQuestion[] {
  const rand = seeded(`quiz:${archId}`);
  const out: QuizQuestion[] = [];

  (spec.quiz ?? []).forEach((q, i) =>
    out.push({ id: `${archId}-q${i}`, question: q.question, options: q.options, correctOptionIndex: q.answer, explanation: q.explanation, targetNodeId: q.node }),
  );

  const nameOf = (id: string) => infer.nodes.get(id)!.node.label ?? getOp(infer.nodes.get(id)!.node.op).label;

  // 1) shape question on a node whose output shape differs from its input
  const reshaping = stops.filter((id) => {
    const info = infer.nodes.get(id)!;
    return info.inputs[0] && fmtSym(info.inputs[0]) !== fmtSym(info.out);
  });
  if (reshaping.length) {
    const id = reshaping[Math.floor(rand() * reshaping.length)];
    const info = infer.nodes.get(id)!;
    const correct = fmtNum(info.out);
    const wrong = [fmtNum(info.inputs[0]), ...stops.map((s) => fmtNum(infer.nodes.get(s)!.out))];
    const q = makeQuestion(`${archId}-auto-shape`, `What shape comes out of “${nameOf(id)}”?`, correct, wrong, `${getOp(info.node.op).label} turns ${fmtSym(info.inputs[0])} into ${fmtSym(info.out)} — here that is ${correct}.`, rand, id);
    if (q) out.push(q);
  }

  // 2) where do the parameters live?
  const withParams = stops.filter((id) => infer.nodes.get(id)!.params > 0);
  if (withParams.length >= 3) {
    const heaviest = [...withParams].sort((a, b) => {
      const A = infer.nodes.get(a)!;
      const B = infer.nodes.get(b)!;
      return B.params * B.multiplicity - A.params * A.multiplicity;
    })[0];
    const info = infer.nodes.get(heaviest)!;
    const q = makeQuestion(
      `${archId}-auto-params`,
      'Which of these parts holds the most learned parameters in the full model?',
      nameOf(heaviest),
      shuffle(withParams.filter((x) => x !== heaviest), rand).map(nameOf),
      `${nameOf(heaviest)} has ${fmtCount(info.params * info.multiplicity)} parameters${info.multiplicity > 1 ? ` (${fmtCount(info.params)} per copy × ${info.multiplicity})` : ''}.`,
      rand,
      heaviest,
    );
    if (q) out.push(q);
  }

  // 3) what does this op do?
  const opsUsed = [...new Set(stops.map((id) => infer.nodes.get(id)!.node.op))].filter((o) => o !== 'input' && o !== 'output');
  if (opsUsed.length) {
    const op = opsUsed[Math.floor(rand() * opsUsed.length)];
    const target = stops.find((id) => infer.nodes.get(id)!.node.op === op);
    const others = ['linear', 'conv2d', 'norm', 'attention', 'pool', 'add', 'embedding', 'softmax', 'router', 'ssm_scan'].filter((o) => o !== op);
    const q = makeQuestion(
      `${archId}-auto-op`,
      `What does a ${getOp(op).label} layer do?`,
      getOp(op).describe,
      shuffle(others, rand).map((o) => getOp(o).describe),
      getOp(op).describe,
      rand,
      target,
    );
    if (q) out.push(q);
  }

  // 4) total size
  const total = infer.totalParams;
  const q = makeQuestion(
    `${archId}-auto-total`,
    'Roughly how many parameters does this whole model have?',
    fmtCount(total),
    [fmtCount(total * 10), fmtCount(total / 10), fmtCount(total * 100)],
    `Adding up every layer (and every repeat of repeated blocks) gives ${fmtCount(total)} parameters.`,
    rand,
  );
  if (q) out.push(q);

  return out;
}

const CATEGORY_NAMES: Record<SystemCategory, string> = {
  llm: 'Large Language Models',
  vision: 'Computer Vision',
  ssm: 'Sequence Models',
  generative: 'Generative Models',
  classic: 'Classic Neural Networks',
  multimodal: 'Multimodal Models',
  custom: 'Your Models',
};

/** Build a complete Architecture (as consumed by the UI) from a self-describing spec. */
export function architectureFromSpec(id: string, spec: GraphSpec): Architecture {
  const infer = inferGraph(spec);
  const stops = lessonNodeIds(spec, infer);
  const meta = spec.meta ?? { name: id };
  const category = (meta.category ?? 'custom') as SystemCategory;
  return {
    id,
    name: meta.name,
    subtitle: meta.subtitle ?? `${spec.nodes.length} operations · ${fmtCount(infer.totalParams)} parameters`,
    category,
    categoryName: CATEGORY_NAMES[category],
    badge: meta.badge ?? CATEGORY_NAMES[category],
    description: meta.description ?? `A ${spec.nodes.length}-operation network with ${fmtCount(infer.totalParams)} parameters.`,
    tagline: meta.tagline ?? meta.description ?? '',
    realWorldSampleInput: { type: 'text', label: 'Sample input', value: meta.sampleInput ?? fmtNum(infer.nodes.get(infer.order[0])!.out) },
    keyFacts: {
      paramCount: `${fmtCount(infer.totalParams)} parameters`,
      primaryUse: meta.primaryUse ?? '—',
      inventedYear: meta.year ?? '—',
      keyInnovations: meta.innovations ?? '—',
    },
    paperUrl: meta.paperUrl,
    paperTitle: meta.paperTitle,
    components: stops.map((s) => componentFor(spec, infer, s)),
    dataFlowSteps: autoTour(spec, infer, stops),
    quizQuestions: autoQuiz(spec, infer, stops, id),
    thumbnail: specThumbnail(spec, id),
    defaultCameraPosition: [0, 0, 20],
    defaultCameraTarget: [0, 0, 0],
  };
}
