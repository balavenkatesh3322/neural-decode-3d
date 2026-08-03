export type ComponentCategory =
  | 'fundamentals'
  | 'activations'
  | 'optimization'
  | 'regularization'
  | 'representation';

export interface TrainingPhaseInfo {
  beforeTraining: {
    status: string;
    whatHappens: string;
    explanation5yo: string;
  };
  whileTraining: {
    status: string;
    whatHappens: string;
    explanation5yo: string;
  };
  afterTraining: {
    status: string;
    whatHappens: string;
    explanation5yo: string;
  };
}

export interface NeuralComponentDetail {
  id: string;
  name: string;
  category: ComponentCategory;
  categoryName: string;
  badge: string;
  shortDefinition: string;
  fiveYearOldSummary: string; // Simple 5-year-old high-level sentence
  whatIsIt: string;
  whyIsItNeeded: string;
  realWorldAnalogy: {
    title: string;
    description: string;
    iconName: string;
  };
  trainingPhases: TrainingPhaseInfo;
  mathFormula: string;
  codeSnippet: string;
  keyTakeaway: string;
  sandboxType?: 'weight-bias' | 'activation' | 'loss' | 'dropout';
}
