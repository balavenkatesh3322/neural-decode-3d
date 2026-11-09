export type BasicsUnit = 'data' | 'neuron' | 'learning' | 'training' | 'representation' | 'output';

export type SandboxKind = 'weight-bias' | 'activation' | 'gradient' | 'softmax' | 'convolution' | 'dropout' | 'attention';

/** One concept in the "Deep Learning Basics" course. */
export interface Basic {
  id: string;
  unit: BasicsUnit;
  name: string;
  /** Explain-like-I'm-five, one sentence. */
  eli5: string;
  whatIsIt: string;
  whyNeeded: string;
  analogy: { title: string; text: string };
  /** A small worked example with real numbers. */
  example: string;
  formula?: string;
  code?: string;
  /** The single thing to remember. */
  takeaway: string;
  pitfall?: string;
  /** Op names (src/engine/ops) where this concept appears → "used in" links into the 3D models. */
  relatedOps?: string[];
  sandbox?: SandboxKind;
  check: { q: string; options: string[]; answer: number; why: string };
}

export const UNITS: { id: BasicsUnit; title: string; blurb: string }[] = [
  { id: 'data', title: '1 · Data', blurb: 'What goes in: numbers, tensors and datasets.' },
  { id: 'neuron', title: '2 · The Neuron', blurb: 'How one unit, then a layer, turns inputs into outputs.' },
  { id: 'learning', title: '3 · Learning', blurb: 'How a network measures mistakes and fixes itself.' },
  { id: 'training', title: '4 · Training Well', blurb: 'Tricks that make deep networks train fast and generalise.' },
  { id: 'representation', title: '5 · Representations', blurb: 'The building blocks inside modern architectures.' },
  { id: 'output', title: '6 · Producing Output', blurb: 'How the last layer becomes an answer, and how models are reused.' },
];
