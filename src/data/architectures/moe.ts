import { Architecture } from '../../types/architecture';

export const moeArchitecture: Architecture = {
  id: 'moe',
  name: 'Mixture of Experts (MoE)',
  subtitle: 'Sparse Dynamic Routing Architecture',
  category: 'llm',
  categoryName: 'Large Language Models',
  badge: 'DeepSeek-V3 / Mixtral 8x22B',
  tagline: 'Achieve trillion-parameter capacity at a fraction of active compute by sparsely routing tokens to specialized expert sub-networks.',
  description: 'MoE models replace standard dense feed-forward blocks with a Top-K Gating Router and multiple specialized Expert FFN networks.',
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  defaultCameraPosition: [0, 4, 20],
  defaultCameraTarget: [0, 0, 0],
  realWorldSampleInput: {
    type: 'code',
    label: 'Real Input Python Code',
    value: 'def fibonacci(n): return n if n <= 1 else fibonacci(n-1)'
  },
  keyFacts: {
    paramCount: '671B Total / 37B Active',
    contextLength: '128,000 Tokens',
    primaryUse: 'High-Efficiency Frontier LLMs',
    inventedYear: '2021 / 2024 (Shazeer, DeepSeek)',
    keyInnovations: 'Sparse Top-K Router, Shared Experts, Auxiliary Loss-Free Balancing',
  },
  components: [
    {
      id: 'moe-input-repr',
      name: 'Shared Self-Attention Output',
      subName: 'Pre-Router Context',
      category: 'Input Layer',
      position: [0, -6, 0],
      color: '#06B6D4',
      glowColor: '#67E8F9',
      description: 'Incoming token representations after multi-head self-attention and normalization.',
      fiveYearOldWhy: 'The python code words "def fibonacci" arrive at the routing station!',
      componentImpact: 'IF MISSING: Routing station receives un-contextualized raw tokens and cannot determine which expert is needed!',
      mathFormula: 'H_{in} = \\text{AttentionNorm}(X)',
      explanation: 'Each token carries contextual information determining which specialized expert domain it needs.',
      keyMetrics: [
        { label: 'Token Hidden Dim', value: '7168' },
        { label: 'Batch Size', value: '1, 16, 128' },
        { label: 'Routing Frequency', value: 'Every 2 Layers' }
      ],
      inputTensor: { name: 'Post-Attn Hidden', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
      outputTensor: { name: 'Pre-Routing Representation', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
      connectedTo: ['moe-router-gate', 'moe-shared-expert']
    },
    {
      id: 'moe-router-gate',
      name: 'Gating Router & Top-K Softmax',
      subName: 'Sparse Classifier',
      category: 'Router',
      position: [0, -2.5, 0],
      color: '#F59E0B',
      glowColor: '#FBBF24',
      description: 'Calculates routing logits across all available experts, selecting top-K highest affinity scores.',
      fiveYearOldWhy: 'A smart traffic cop! It sees math & code words and chooses Expert #1 (Coding) & Expert #2 (Grammar).',
      componentImpact: 'IF MISSING: All 8 experts are forced to run simultaneously on every single word, burning 4x more GPU electricity!',
      mathFormula: 'G(x) = \\text{Softmax}\\left( \\text{TopK}(x W_g, k=2) \\right)',
      explanation: 'Acts as an intelligent dispatcher sending code tokens to code experts.',
      keyMetrics: [
        { label: 'Total Experts (N)', value: '8' },
        { label: 'Active Experts per Token (K)', value: '2' },
        { label: 'Routing Mechanism', value: 'Top-2 Softmax Gating' }
      ],
      inputTensor: { name: 'Hidden Vector', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
      outputTensor: { name: 'Routing Weights & Indices', expression: '(Batch, SeqLen, K)', numericalExample: '(1, 16, 2)' },
      connectedTo: ['moe-expert-1', 'moe-expert-2', 'moe-expert-3', 'moe-expert-4']
    },
    {
      id: 'moe-expert-1',
      name: 'Expert FFN Block #1 (Math & Code)',
      subName: 'Sparse Sub-Network',
      category: 'Expert FFN',
      position: [-5, 1.5, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Specialized feed-forward network trained on math and programming syntax.',
      fiveYearOldWhy: 'The coding expert helper lights up and processes the python function!',
      componentImpact: 'IF MISSING: Code tokens lose specialized programming syntax knowledge and struggle to generate valid code!',
      mathFormula: 'E_1(x) = \\text{SwiGLU}_1(x)',
      explanation: 'Operates sparsely so inactive experts consume 0 compute FLOPs.',
      keyMetrics: [
        { label: 'Expert Hidden Dim', value: '2048' },
        { label: 'Status', value: 'ACTIVE (Selected)' },
        { label: 'Weight Footprint', value: '4.2B params' }
      ],
      inputTensor: { name: 'Routed Sub-Batch', expression: '(Tokens_routed, D_model)', numericalExample: '(4, 7168)' },
      outputTensor: { name: 'Expert 1 Output', expression: '(Tokens_routed, D_model)', numericalExample: '(4, 7168)' },
      connectedTo: ['moe-aggregator']
    },
    {
      id: 'moe-expert-2',
      name: 'Expert FFN Block #2 (Language & Grammar)',
      subName: 'Sparse Sub-Network',
      category: 'Expert FFN',
      position: [-1.8, 2, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Specialized FFN tuned for linguistic nuances and stylistic text generation.',
      fiveYearOldWhy: 'The grammar expert helper lights up to check python syntax rules!',
      componentImpact: 'IF MISSING: Sentences lose linguistic fluency and proper grammar structure.',
      mathFormula: 'E_2(x) = \\text{SwiGLU}_2(x)',
      explanation: 'Activated when text generation requires language fluency.',
      keyMetrics: [
        { label: 'Expert Hidden Dim', value: '2048' },
        { label: 'Status', value: 'ACTIVE (Selected)' },
        { label: 'Weight Footprint', value: '4.2B params' }
      ],
      inputTensor: { name: 'Routed Sub-Batch', expression: '(Tokens_routed, D_model)', numericalExample: '(6, 7168)' },
      outputTensor: { name: 'Expert 2 Output', expression: '(Tokens_routed, D_model)', numericalExample: '(6, 7168)' },
      connectedTo: ['moe-aggregator']
    },
    {
      id: 'moe-expert-3',
      name: 'Expert FFN Block #3 (Reasoning)',
      subName: 'Sparse Sub-Network',
      category: 'Expert FFN',
      position: [1.8, 2, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Specialized FFN focusing on step-by-step chain of thought reasoning.',
      fiveYearOldWhy: 'Stays asleep (0 FLOPs) because code tokens don\'t need history reasoning!',
      componentImpact: 'IF MISSING: Logic puzzles and multi-step math problems lose dedicated reasoning pathways.',
      mathFormula: 'E_3(x) = \\text{SwiGLU}_3(x)',
      explanation: 'Idle for code tokens, saving compute.',
      keyMetrics: [
        { label: 'Status', value: 'IDLE (Bypassed)' }
      ],
      inputTensor: { name: 'Routed Sub-Batch', expression: '(0, D_model)', numericalExample: '(0, 7168)' },
      outputTensor: { name: 'Expert 3 Output', expression: '(0, D_model)', numericalExample: '(0, 7168)' },
      connectedTo: ['moe-aggregator']
    },
    {
      id: 'moe-expert-4',
      name: 'Expert FFN Block #4 (General Facts)',
      subName: 'Sparse Sub-Network',
      category: 'Expert FFN',
      position: [5, 1.5, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'General-purpose knowledge retrieval expert.',
      fiveYearOldWhy: 'Stays asleep (0 FLOPs) to save power!',
      componentImpact: 'IF MISSING: Model loses general world encyclopedia knowledge retrieval capacity.',
      mathFormula: 'E_4(x) = \\text{SwiGLU}_4(x)',
      explanation: 'Idle for code tokens.',
      keyMetrics: [
        { label: 'Status', value: 'IDLE (Bypassed)' }
      ],
      inputTensor: { name: 'Routed Sub-Batch', expression: '(0, D_model)', numericalExample: '(0, 7168)' },
      outputTensor: { name: 'Expert 4 Output', expression: '(0, D_model)', numericalExample: '(0, 7168)' },
      connectedTo: ['moe-aggregator']
    },
    {
      id: 'moe-shared-expert',
      name: 'Always-Active Shared Expert',
      subName: 'Common Knowledge Core',
      category: 'Shared Layer',
      position: [0, 0.5, -2],
      color: '#10B981',
      glowColor: '#34D399',
      description: 'Non-routed shared expert that processes 100% of tokens to capture common features.',
      fiveYearOldWhy: 'The main helper that works on EVERY word so no basic grammar is forgotten!',
      componentImpact: 'IF MISSING: Dynamic routed experts over-specialize, losing universal baseline language representation!',
      mathFormula: '\\text{Output}_{shared} = \\text{SwiGLU}_{shared}(x)',
      explanation: 'Ensures basic grammar and core language features are consistently processed.',
      keyMetrics: [
        { label: 'Coverage', value: '100% All Tokens' }
      ],
      inputTensor: { name: 'Full Input State', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
      outputTensor: { name: 'Shared Features', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
      connectedTo: ['moe-aggregator']
    },
    {
      id: 'moe-aggregator',
      name: 'Weighted Expert Combination Node',
      subName: 'Weighted Linear Aggregation',
      category: 'Output Layer',
      position: [0, 5.5, 0],
      color: '#F43F5E',
      glowColor: '#FB7185',
      description: 'Recombines the sparse outputs of the active Top-K experts.',
      fiveYearOldWhy: 'Combines the answers from the active helpers back into 1 perfect response!',
      componentImpact: 'IF MISSING: Outputs from separate experts remain fragmented and cannot be merged into a single hidden vector!',
      mathFormula: 'Y = \\text{Output}_{shared} + \\sum G(x)_i E_i(x)',
      explanation: 'Combines specialized outputs back into a single unified tensor representation.',
      keyMetrics: [
        { label: 'Recombination Mode', value: 'Weighted Linear Sum' }
      ],
      inputTensor: { name: 'Sparse + Shared Outputs', expression: 'List of Expert Vectors', numericalExample: 'K=2 + 1 Shared' },
      outputTensor: { name: 'Unified Layer Output', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 16, 7168)' },
    }
  ],
  dataFlowSteps: [
    {
      stepIndex: 1,
      title: 'Python Code Token Ingestion',
      activeNodeId: 'moe-input-repr',
      description: 'Input python snippet "def fibonacci(n):" is converted to hidden state vectors ready for dynamic expert routing.',
      realWorldCalculation: 'Input: "def fibonacci(n):" -> Post-Attn State (1, 16, 7168)',
      whyItHappened5yo: '💻 WHY IT HAPPENED: Python code tokens arrive at the MoE router station.',
      cameraTarget: [0, -6, 0],
      cameraPosition: [0, -4, 14]
    },
    {
      stepIndex: 2,
      title: 'Top-2 Gating Router Classification',
      activeNodeId: 'moe-router-gate',
      description: 'Router evaluates token vector features and assigns probability scores across all 8 experts, choosing Top 2 highest scoring experts (Coding & Grammar).',
      realWorldCalculation: 'Softmax( Top2( X * W_g ) ) -> Picks Expert #1 (0.91) & Expert #2 (0.88)',
      whyItHappened5yo: '👮 WHY IT HAPPENED: The traffic cop router sees python code words and picks the coding & grammar helpers!',
      cameraTarget: [0, -2.5, 0],
      cameraPosition: [0, -0.5, 12]
    },
    {
      stepIndex: 3,
      title: 'Sparse Laser Dispatch to Active Experts',
      activeNodeId: 'moe-expert-1',
      description: 'Laser conduits shoot tokens ONLY to selected experts (Expert #1 Coding & Expert #2 Grammar). Inactive experts stay dark.',
      realWorldCalculation: 'Dispatch -> Expert 1 (Math/Code) & Expert 2 (Grammar). Experts 3-8 consumption = 0 FLOPs!',
      whyItHappened5yo: '⚡ WHY IT HAPPENED: Laser beams shoot data ONLY to the active coding helpers, keeping other helpers sleeping to save battery!',
      cameraTarget: [-3.4, 1.7, 0],
      cameraPosition: [-3.4, 3.5, 10]
    },
    {
      stepIndex: 4,
      title: 'Always-Active Shared Core Processing',
      activeNodeId: 'moe-shared-expert',
      description: 'DeepSeek Shared Expert processes all tokens to capture base linguistic and syntax rules.',
      realWorldCalculation: 'Shared FFN(X) -> Process 100% tokens in parallel',
      whyItHappened5yo: '🛡️ WHY IT HAPPENED: The main helper processes all words so basic syntax is never lost.',
      cameraTarget: [0, 0.5, -2],
      cameraPosition: [0, 2.5, 8]
    },
    {
      stepIndex: 5,
      title: 'Weighted Output Summation & Aggregation',
      activeNodeId: 'moe-aggregator',
      description: 'Outputs from active experts are scaled by router probabilities, added to shared expert output, and forwarded to the next layer.',
      realWorldCalculation: 'Y = Shared_Output + 0.91 * Expert1_Output + 0.88 * Expert2_Output -> (1, 16, 7168)',
      whyItHappened5yo: '🧩 WHY IT HAPPENED: Adds all answers together into 1 super smart final code representation!',
      cameraTarget: [0, 5.5, 0],
      cameraPosition: [0, 7.5, 14]
    }
  ],
  quizQuestions: [
    {
      id: 'moe-q1',
      question: 'What is the primary advantage of a Mixture of Experts (MoE) architecture over a dense model?',
      options: [
        'It reduces token vocabulary size',
        'It allows scaling total parameter count dramatically without increasing compute FLOPs per token proportionally',
        'It eliminates the need for self-attention matrices',
        'It forces all experts to run on a single CPU core'
      ],
      correctOptionIndex: 1,
      targetNodeId: 'moe-router-gate',
      explanation: 'Because only a small subset of experts (Top-K) is activated for each token, total model capacity grows huge while compute cost per token remains low.'
    }
  ]
};
