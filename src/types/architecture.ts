export type SystemCategory = 'llm' | 'vision' | 'ssm' | 'generative' | 'classic' | 'multimodal' | 'custom';

export interface TensorShape {
  name: string;
  expression: string; // e.g. "(Batch, SeqLen, D_model)"
  numericalExample: string; // e.g. "(1, 512, 4096)"
}

export interface NodeComponent {
  id: string;
  name: string;
  subName?: string;
  category: string;
  position: [number, number, number];
  color: string;
  glowColor?: string;
  description: string;
  fiveYearOldWhy: string; // Simple 5-year-old explanation of why this node is needed
  componentImpact?: string; // Plain-language explanation of WHAT BREAKS if this component is missing
  mathFormula: string;
  explanation: string;
  keyMetrics: { label: string; value: string }[];
  inputTensor: TensorShape;
  outputTensor: TensorShape;
  weightMatrixSample?: {
    rows: number;
    cols: number;
    labelsRow: string[];
    labelsCol: string[];
    matrix: number[][];
  };
  connectedTo?: string[];
  sliceAvailable?: boolean;
}

export interface DataFlowStep {
  stepIndex: number;
  title: string;
  activeNodeId: string;
  description: string;
  realWorldCalculation: string; // Step-by-step real numerical math calculation
  whyItHappened5yo: string; // 5-year-old explanation of WHY this step happened
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  highlightedConnectionPath?: [number, number, number][];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  targetNodeId?: string;
  explanation: string;
}

export interface Architecture {
  id: string;
  name: string;
  subtitle: string;
  category: SystemCategory;
  categoryName: string;
  badge: string;
  description: string;
  tagline: string;
  realWorldSampleInput: {
    type: 'text' | 'image' | 'code';
    label: string;
    value: string;
  };
  keyFacts: {
    paramCount: string;
    contextLength?: string;
    primaryUse: string;
    inventedYear: string;
    keyInnovations: string;
  };
  paperUrl?: string;
  paperTitle?: string;
  components: NodeComponent[];
  dataFlowSteps: DataFlowStep[];
  quizQuestions: QuizQuestion[];
  thumbnail: string;
  defaultCameraPosition: [number, number, number];
  defaultCameraTarget: [number, number, number];
}
