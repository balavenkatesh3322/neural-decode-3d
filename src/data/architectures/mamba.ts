import { Architecture } from '../../types/architecture';

export const mambaArchitecture: Architecture = {
  id: 'mamba',
  name: 'Mamba (Selective SSM)',
  subtitle: 'Sub-Quadratic Linear Sequence Engine',
  category: 'ssm',
  categoryName: 'State Space Models',
  badge: 'Mamba-2 / Falcon-Mamba',
  tagline: 'Linear time complexity O(N) context processing with input-selective state transitions and recurrent GPU hardware acceleration.',
  description: 'Mamba replaces quadratic O(N²) attention matrices with input-dependent Selective State Space Models.',
  thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop',
  defaultCameraPosition: [0, 4, 18],
  defaultCameraTarget: [0, 0, 0],
  realWorldSampleInput: {
    type: 'text',
    label: 'Real Input Long Context Document',
    value: 'A 1,000,000-word book text stream processing in linear time O(N).'
  },
  keyFacts: {
    paramCount: '1.4B - 13B Parameters',
    contextLength: '1,000,000+ Tokens (Linear Scaling)',
    primaryUse: 'Ultra-Long Sequence Modeling & Real-Time Audio/Text',
    inventedYear: '2023 / 2024 (Gu & Dao)',
    keyInnovations: 'Input-Selective Discretization Δ(x), Hardware-Aware Parallel Scan, Zero KV-Cache Growth',
  },
  components: [
    {
      id: 'mb-input-proj',
      name: 'Linear Input Expansion & 1D Conv',
      subName: 'Token Projection Stem',
      category: 'Input Stem',
      position: [0, -6, 0],
      color: '#06B6D4',
      glowColor: '#67E8F9',
      description: 'Expands token model dimension d_model into 2 parallel branches (x branch and z gating branch).',
      fiveYearOldWhy: 'Splits long book sentences into two paths: story content and gate control!',
      componentImpact: 'IF MISSING: Input tokens cannot be split into memory content and gating control paths!',
      mathFormula: 'X = \\text{SiLU}(\\text{Conv1D}(W_x \\cdot T)), \\quad Z = W_z \\cdot T',
      explanation: 'Splits sequence path into content processing and multiplicative residual gating paths.',
      keyMetrics: [
        { label: 'Expanded Dim (d_inner)', value: '2 × d_model (8192)' }
      ],
      inputTensor: { name: 'Token Vectors', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 1024, 4096)' },
      outputTensor: { name: 'Expanded State', expression: '(Batch, SeqLen, 2 × D_model)', numericalExample: '(1, 1024, 8192)' },
      connectedTo: ['mb-selective-params']
    },
    {
      id: 'mb-selective-params',
      name: 'Input-Selective Parameter Generators B(x), C(x), Δ(x)',
      subName: 'Dynamic Context Gate',
      category: 'Selection Engine',
      position: [0, -3.5, 0],
      color: '#F59E0B',
      glowColor: '#FBBF24',
      description: 'Generates dynamic parameters B, C, and step size Δ as linear functions of input token x.',
      fiveYearOldWhy: 'A dynamic memory knob! Important words make the knob big (remember); boring words make it small (ignore).',
      componentImpact: 'IF MISSING: Mamba degrades back to a fixed linear system that remembers filler words ("the", "and") equally with critical keywords!',
      mathFormula: 'B(x) = s_B(x), \\quad C(x) = s_C(x), \\quad \\Delta(x) = \\text{Softplus}(W_{\\Delta} x)',
      explanation: 'Standard SSMs use fixed matrices. Mamba dynamically adjusts how much past state to remember.',
      keyMetrics: [
        { label: 'State Dim (N)', value: '16' }
      ],
      inputTensor: { name: 'Conv Output', expression: '(Batch, SeqLen, d_inner)', numericalExample: '(1, 1024, 8192)' },
      outputTensor: { name: 'Dynamic B, C, Δ Matrices', expression: 'Selective per token', numericalExample: 'Dynamic per token' },
      connectedTo: ['mb-ssm-discretize']
    },
    {
      id: 'mb-ssm-discretize',
      name: 'Continuous-to-Discrete Matrix Transformation',
      subName: 'ZOH Discretizer',
      category: 'SSM Core',
      position: [0, -1, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Converts continuous differential state matrices (A, B) into discrete step updates (Ā, B̄).',
      fiveYearOldWhy: 'Converts continuous smooth signals into discrete computer steps!',
      componentImpact: 'IF MISSING: Continuous mathematical physics differential equations cannot be executed on digital computers!',
      mathFormula: '\\bar{A} = \\exp(\\Delta A), \\quad \\bar{B} = (\\Delta A)^{-1} (\\bar{A} - I) (\\Delta B)',
      explanation: 'Discretization allows continuous physical state equations to run as computer updates.',
      keyMetrics: [
        { label: 'Discretization Rule', value: 'Zero-Order Hold (ZOH)' }
      ],
      inputTensor: { name: 'Continuous A, B, Δ', expression: 'State Parameters', numericalExample: 'Continuous space' },
      outputTensor: { name: 'Discrete Ā, B̄ Matrices', expression: '(Batch, SeqLen, d_inner, N)', numericalExample: 'Discrete step values' },
      connectedTo: ['mb-parallel-scan']
    },
    {
      id: 'mb-parallel-scan',
      name: 'Hardware-Aware Associative Parallel Scan',
      subName: '3D Memory Recurrence',
      category: 'Parallel Scan',
      position: [0, 1.5, 0],
      color: '#10B981',
      glowColor: '#34D399',
      description: 'Executes recurrent state update h_t = Ā h_{t-1} + B̄ x_t in parallel across GPU SRAM.',
      fiveYearOldWhy: 'A 3D double-helix memory spiral! It stores 1,000,000 words without running out of memory!',
      componentImpact: 'CRITICAL FAIL: Without parallel scan, processing 1,000,000 tokens sequentially takes hours instead of seconds on GPU!',
      mathFormula: 'h_t = \\bar{A}_t h_{t-1} + \\bar{B}_t x_t, \\quad y_t = C_t h_t',
      explanation: 'Enables parallel training speed while keeping constant O(1) memory during inference.',
      keyMetrics: [
        { label: 'Inference Memory', value: 'Constant O(1) No KV Cache' }
      ],
      inputTensor: { name: 'Discrete Matrices + Input x', expression: '(Batch, SeqLen, d_inner, N)', numericalExample: '(1, 1024, 8192, 16)' },
      outputTensor: { name: 'Recurrent State Trajectory', expression: '(Batch, SeqLen, d_inner)', numericalExample: '(1, 1024, 8192)' },
      connectedTo: ['mb-gated-out']
    },
    {
      id: 'mb-gated-out',
      name: 'Multiplicative Gating & Projection Out',
      subName: 'SiLU Multiplication',
      category: 'Output Layer',
      position: [0, 4.5, 0],
      color: '#F43F5E',
      glowColor: '#FB7185',
      description: 'Multiplies state response y_t element-wise with parallel SiLU branch z.',
      fiveYearOldWhy: 'Combines the memory spiral output with the gate branch to produce the clean final answer!',
      componentImpact: 'IF MISSING: Recurrent state responses cannot be filtered by gating signals, yielding un-modulated outputs.',
      mathFormula: 'Y_{\\text{out}} = W_{\\text{out}} \\left( y_t \\odot \\text{SiLU}(Z) \\right)',
      explanation: 'Gating branch filters and modulates state outputs.',
      keyMetrics: [
        { label: 'Gating Function', value: 'Element-wise Hadamard' }
      ],
      inputTensor: { name: 'SSM Output y_t & Gate Z', expression: 'Two (Batch, SeqLen, d_inner)', numericalExample: 'Two (1, 1024, 8192)' },
      outputTensor: { name: 'Mamba Layer Output', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 1024, 4096)' },
    }
  ],
  dataFlowSteps: [
    {
      stepIndex: 1,
      title: 'Long Context Token Expansion',
      activeNodeId: 'mb-input-proj',
      description: 'Tokens expand into parallel paths x and z, passing through 1D causal convolution.',
      realWorldCalculation: 'X = Conv1D(W_x * T) (1, 1024, 8192), Z = W_z * T',
      whyItHappened5yo: '📖 WHY IT HAPPENED: Long book sentences expand into 2 parallel paths for story and memory control.',
      cameraTarget: [0, -6, 0],
      cameraPosition: [0, -4, 12]
    },
    {
      stepIndex: 2,
      title: 'Dynamic Selection Parameters B(x), C(x), Δ(x)',
      activeNodeId: 'mb-selective-params',
      description: 'Context-dependent parameter generator calculates step size Δ. Significant tokens increase Δ to store memories.',
      realWorldCalculation: 'Δ = Softplus( W_Δ * X ) -> Step size Δ controls memory retention',
      whyItHappened5yo: '🎛️ WHY IT HAPPENED: Important words make the memory knob bigger so they get remembered!',
      cameraTarget: [0, -3.5, 0],
      cameraPosition: [0, -1.5, 10]
    },
    {
      stepIndex: 3,
      title: 'Zero-Order Hold (ZOH) Discretization',
      activeNodeId: 'mb-ssm-discretize',
      description: 'Continuous state matrices A and B are converted into discrete steps Ā and B̄.',
      realWorldCalculation: 'A_bar = exp(Δ * A), B_bar = (Δ * A)^(-1) * (A_bar - I) * (Δ * B)',
      whyItHappened5yo: '⚙️ WHY IT HAPPENED: Converts continuous smooth signals into discrete computer steps.',
      cameraTarget: [0, -1, 0],
      cameraPosition: [0, 1, 10]
    },
    {
      stepIndex: 4,
      title: 'GPU Fused Double-Helix Parallel Scan',
      activeNodeId: 'mb-parallel-scan',
      description: 'Recurrent state trajectory h_t is evaluated in parallel across GPU SRAM with O(1) memory footprint.',
      realWorldCalculation: 'h_t = A_bar * h_t-1 + B_bar * x_t -> Parallel Scan Trajectory',
      whyItHappened5yo: '🌀 WHY IT HAPPENED: A 3D double-helix memory spiral stores 1,000,000 words without running out of RAM!',
      cameraTarget: [0, 1.5, 0],
      cameraPosition: [0, 3.5, 10]
    },
    {
      stepIndex: 5,
      title: 'Multiplicative Gating & Down-Projection',
      activeNodeId: 'mb-gated-out',
      description: 'State trajectory output is multiplied with SiLU gate branch z and projected back to d_model output.',
      realWorldCalculation: 'Y = W_out * ( y_t * SiLU(Z) ) -> Output (1, 1024, 4096)',
      whyItHappened5yo: '🏁 WHY IT HAPPENED: Combines memory spiral output with gate control for clean text generation!',
      cameraTarget: [0, 4.5, 0],
      cameraPosition: [0, 6.5, 12]
    }
  ],
  quizQuestions: [
    {
      id: 'mb-q1',
      question: 'How does Mamba achieve linear O(N) sequence scaling compared to Transformer O(N²)?',
      options: [
        'By storing past tokens in an external MySQL database',
        'By compressing sequence context into a continuous 3D state memory vector (h_t) using selective state space updates',
        'By ignoring all words past token position 512',
        'By running on quantum processing units'
      ],
      correctOptionIndex: 1,
      targetNodeId: 'mb-parallel-scan',
      explanation: 'Mamba maintains a fixed-size recurrent state vector h_t updated per step, eliminating the growing O(N²) KV cache.'
    }
  ]
};
