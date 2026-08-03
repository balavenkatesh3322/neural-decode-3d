import { Architecture } from '../../types/architecture';

export const transformerArchitecture: Architecture = {
  id: 'transformer',
  name: 'Transformer (Decoder-Only)',
  subtitle: 'Multi-Head Self-Attention LLM Engine',
  category: 'llm',
  categoryName: 'Large Language Models',
  badge: 'GPT-4 / Llama 3',
  tagline: 'The foundational parallel-attention architecture powering state-of-the-art LLMs.',
  description: 'Transformers process sequence tokens in parallel by calculating dynamic pairwise attention scores between every token pair, transforming input embeddings through multi-head projection layers and non-linear feed-forward projections.',
  thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop',
  defaultCameraPosition: [0, 4, 18],
  defaultCameraTarget: [0, 0, 0],
  realWorldSampleInput: {
    type: 'text',
    label: 'Real Input Text Prompt',
    value: '"The cat sat on the mat"'
  },
  keyFacts: {
    paramCount: '7B - 405B Parameters',
    contextLength: '128,000 Tokens',
    primaryUse: 'Generative AI & Reasoning',
    inventedYear: '2017 (Vaswani et al.)',
    keyInnovations: 'Parallel Self-Attention, Positional Embeddings, Residual Scaled Softmax',
  },
  components: [
    {
      id: 'tf-token-embed',
      name: 'Token & Positional Embedding',
      subName: 'Input Quantization',
      category: 'Embedding',
      position: [0, -6, 0],
      color: '#F59E0B',
      glowColor: '#FBBF24',
      description: 'Converts discrete text tokens (word IDs) into dense continuous vector representations and adds RoPE (Rotary Position Embedding) frequencies to encode spatial sequence ordering.',
      fiveYearOldWhy: 'Words like "cat" and "sat" are converted into a list of numbers (coordinates) so the computer can do math on them!',
      componentImpact: 'IF MISSING: Computers cannot process letters! Without embeddings, the model receives raw text strings and crashes with zero math capability.',
      mathFormula: 'X_{0} = \\text{Embedding}(T) + \\text{RoPE}(pos)',
      explanation: 'Every word token is mapped to a high-dimensional vector. Rotary embeddings apply a complex rotation matrix in 2D vector slices to maintain relative distance encoding.',
      keyMetrics: [
        { label: 'Vocab Size', value: '128,256' },
        { label: 'Hidden Dim (d_model)', value: '4096' },
        { label: 'RoPE Theta', value: '500,000' }
      ],
      inputTensor: { name: 'Token IDs', expression: '(Batch, SeqLen)', numericalExample: '[464, 3797, 3318]' },
      outputTensor: { name: 'Embedded Matrix', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      connectedTo: ['tf-qkv-proj']
    },
    {
      id: 'tf-qkv-proj',
      name: 'Query, Key, Value Projections',
      subName: 'Linear Head Splitting',
      category: 'Attention Projections',
      position: [0, -3.5, 0],
      color: '#06B6D4',
      glowColor: '#67E8F9',
      description: 'Projects hidden input vectors into 3 distinct subspace matrices: Query (what tokens look for), Key (what tokens contain), and Value (information tokens pass forward).',
      fiveYearOldWhy: 'Splits each word into 3 helpers: Query (what clue am I looking for?), Key (what clue do I hold?), and Value (my story content)!',
      componentImpact: 'IF MISSING: Words cannot distinguish what context they need vs what information they carry, destroying sequence reasoning!',
      mathFormula: 'Q = X W_Q, \\quad K = X W_K, \\quad V = X W_V',
      explanation: 'Multiplying the input representation by weight matrices W_Q, W_K, W_V creates specific query, key, and value vectors for each of the 32 parallel attention heads.',
      keyMetrics: [
        { label: 'Attention Heads (H)', value: '32' },
        { label: 'Head Dimension (d_k)', value: '128' },
        { label: 'Projection Weights', value: '4096 × 4096' }
      ],
      inputTensor: { name: 'Hidden State', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      outputTensor: { name: 'Q, K, V Tensors', expression: '(Batch, Heads, SeqLen, d_k)', numericalExample: '(1, 32, 8, 128)' },
      connectedTo: ['tf-attn-matrix']
    },
    {
      id: 'tf-attn-matrix',
      name: 'Scaled Dot-Product Attention',
      subName: 'Pairwise Token Correlation',
      category: 'Attention',
      position: [0, -1, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Computes affinity matrix between all Queries and Keys using scaled dot-product and applies a causal triangle mask so tokens can only attend to past tokens.',
      fiveYearOldWhy: 'A smart spotlight! The word "sat" shines its spotlight back on "cat" to understand WHO sat down on the mat.',
      componentImpact: 'IF MISSING: The word "sat" becomes completely blind to surrounding words, failing to link pronouns ("it", "he") to their subjects!',
      mathFormula: 'A = \\text{Softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} + M \\right) V',
      explanation: 'Dot product between Query and Key measures similarity. Division by sqrt(d_k) prevents vanishing gradients during softmax normalization.',
      keyMetrics: [
        { label: 'Causal Mask', value: 'Upper Triangular -inf' },
        { label: 'Scaling Factor', value: '1 / sqrt(128) = 0.088' },
        { label: 'Attention Density', value: 'Dynamic Sparse' }
      ],
      inputTensor: { name: 'Q & K Tensors', expression: '(Batch, Heads, SeqLen, d_k)', numericalExample: '(1, 32, 8, 128)' },
      outputTensor: { name: 'Attention Context', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      connectedTo: ['tf-norm-1']
    },
    {
      id: 'tf-norm-1',
      name: 'RMSNorm & Residual Connection',
      subName: 'Gradient Stabilizer',
      category: 'Normalization',
      position: [0, 1.5, 0],
      color: '#10B981',
      glowColor: '#34D399',
      description: 'Adds the original input residual shortcut and normalizes variance using Root Mean Square Layer Normalization without mean subtraction for speed.',
      fiveYearOldWhy: 'Keeps the signal volume perfectly level so deep layers don\'t get too loud or too quiet!',
      componentImpact: 'IF MISSING: Signals blow up to infinity or collapse to zero after 5 layers, causing model calculations to explode and crash!',
      mathFormula: '\\text{RMSNorm}(X) = \\frac{X}{\\sqrt{\\frac{1}{d}\\sum X_i^2 + \\epsilon}} \\odot \\gamma + X_{\\text{residual}}',
      explanation: 'Residual connections allow gradients to flow directly back across hundreds of layers during backpropagation.',
      keyMetrics: [
        { label: 'Epsilon (ε)', value: '1e-5' },
        { label: 'Learnable Scale (γ)', value: '4096 params' },
        { label: 'Normalized Var', value: 'Unit Variance' }
      ],
      inputTensor: { name: 'Context + Residual', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      outputTensor: { name: 'Normalized State', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      connectedTo: ['tf-ffn-swiglu']
    },
    {
      id: 'tf-ffn-swiglu',
      name: 'SwiGLU Feed-Forward Network',
      subName: 'Non-Linear Knowledge Recall',
      category: 'FFN Block',
      position: [0, 4, 0],
      color: '#F43F5E',
      glowColor: '#FB7185',
      description: 'Dual projection non-linear block with Swish-Gated Linear Unit (SwiGLU) that expands hidden dimension by 3.5x to retrieve factual associations.',
      fiveYearOldWhy: 'A giant memory library! It remembers facts learned during training (e.g. cats sit on mats) and filters out wrong answers.',
      componentImpact: 'CRITICAL FAIL: Without non-linear activation gates (SwiGLU), 100 deep layers collapse into 1 simple flat line! Complex facts become impossible to store!',
      mathFormula: '\\text{SwiGLU}(X) = \\left( \\text{Swish}(X W_{\\text{gate}}) \\odot (X W_{\\text{up}}) \\right) W_{\\text{down}}',
      explanation: 'The FFN serves as a key-value store for world knowledge acquired during pretraining.',
      keyMetrics: [
        { label: 'Intermediate Dim', value: '14,336' },
        { label: 'Activation', value: 'SiLU / Swish' },
        { label: 'Gating Mechanism', value: 'Element-wise Hadamard' }
      ],
      inputTensor: { name: 'Normalized Input', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      outputTensor: { name: 'FFN Output', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      connectedTo: ['tf-head-logits']
    },
    {
      id: 'tf-head-logits',
      name: 'LM Output Head & Softmax',
      subName: 'Token Probability Generator',
      category: 'Output Layer',
      position: [0, 6.5, 0],
      color: '#3B82F6',
      glowColor: '#60A5FA',
      description: 'Final RMSNorm followed by linear projection to vocabulary size to compute next-token probability logits.',
      fiveYearOldWhy: 'The final guessing wheel! It ranks all 128,000 words and picks "on" as the winner with 94% confidence!',
      componentImpact: 'IF MISSING: Hidden vectors cannot be converted back into human words, leaving the AI unable to output text!',
      mathFormula: 'P(w_{t+1}) = \\text{Softmax}\\left( \\frac{X_{\\text{final}} W_{\\text{vocab}}^T}{T} \\right)',
      explanation: 'Converts final hidden vectors into probability distributions over all 128k vocabulary tokens.',
      keyMetrics: [
        { label: 'Vocab Dimension', value: '128,256' },
        { label: 'Sampling Strategy', value: 'Top-p (0.9), Temp (0.7)' },
        { label: 'Loss Function', value: 'Cross Entropy' }
      ],
      inputTensor: { name: 'Final Layer Output', expression: '(Batch, SeqLen, D_model)', numericalExample: '(1, 8, 4096)' },
      outputTensor: { name: 'Next Token Logits', expression: '(Batch, SeqLen, VocabSize)', numericalExample: '(1, 8, 128256)' },
    }
  ],
  dataFlowSteps: [
    {
      stepIndex: 1,
      title: 'Tokenization & Rotary Embeddings',
      activeNodeId: 'tf-token-embed',
      description: 'Raw input prompt "The cat sat" is mapped to token integer IDs [464, 3797, 3318] and converted to dense 4096-dim vectors with RoPE rotational position encoding.',
      realWorldCalculation: 'T = [464, 3797, 3318] -> Embedding Table Lookup -> (1, 3, 4096) + RoPE(pos)',
      whyItHappened5yo: '👶 WHY IT HAPPENED: Computers cannot do math on letters! We turn "The cat sat" into a list of 4,096 numbers so our brain cells can calculate.',
      cameraTarget: [0, -6, 0],
      cameraPosition: [0, -4, 12]
    },
    {
      stepIndex: 2,
      title: 'Linear Q, K, V Projections',
      activeNodeId: 'tf-qkv-proj',
      description: 'Token vectors pass through linear weight matrices W_Q, W_K, W_V to generate Query (what I seek), Key (what I hold), and Value (my content) for 32 attention heads.',
      realWorldCalculation: 'Q = X * W_Q (4096x4096), K = X * W_K, V = X * W_V -> Output (1, 32, 3, 128)',
      whyItHappened5yo: '🔍 WHY IT HAPPENED: Every word needs 3 helper tools: Query (what clue do I search for?), Key (what clue do I carry?), and Value (my story detail).',
      cameraTarget: [0, -3.5, 0],
      cameraPosition: [0, -1.5, 10]
    },
    {
      stepIndex: 3,
      title: 'Multi-Head Causal Self-Attention',
      activeNodeId: 'tf-attn-matrix',
      description: 'Dot-product Q * K^T / sqrt(d_k) computes pairwise similarity. Causal masking blocks future tokens so "sat" only looks at "The" and "cat".',
      realWorldCalculation: 'Softmax( (Q * K^T) / 11.31 + Mask ) * V -> Attention Matrix (3x3 dot product)',
      whyItHappened5yo: '💡 WHY IT HAPPENED: The word "sat" shines its attention spotlight back on "cat" so it knows WHO sat down!',
      cameraTarget: [0, -1, 0],
      cameraPosition: [0, 1, 10]
    },
    {
      stepIndex: 4,
      title: 'RMSNorm & Skip Arc Connection',
      activeNodeId: 'tf-norm-1',
      description: 'Input state is preserved via residual addition X + Attn(X) while RMSNorm normalizes layer variance to 1.0 for deep stacking.',
      realWorldCalculation: 'RMSNorm(X + Attn) = (X + Attn) / sqrt( mean((X+Attn)^2) + 1e-5 ) * gamma',
      whyItHappened5yo: '⚖️ WHY IT HAPPENED: We add the original word clue back and keep the volume level perfectly even so deep layers don\'t get too loud.',
      cameraTarget: [0, 1.5, 0],
      cameraPosition: [0, 3.5, 10]
    },
    {
      stepIndex: 5,
      title: 'SwiGLU FFN Knowledge Lookup',
      activeNodeId: 'tf-ffn-swiglu',
      description: 'Intermediate dimension expands from 4096 to 14,336 parameters. Swish gating filters relevant factual memories.',
      realWorldCalculation: 'SwiGLU(X) = ( SiLU(X * W_gate) * (X * W_up) ) * W_down -> Output (1, 3, 4096)',
      whyItHappened5yo: '📚 WHY IT HAPPENED: The network searches its giant memory library of facts learned during training (cats sit on mats)!',
      cameraTarget: [0, 4, 0],
      cameraPosition: [0, 6, 10]
    },
    {
      stepIndex: 6,
      title: 'Vocabulary Head Logits & Next-Token Sampling',
      activeNodeId: 'tf-head-logits',
      description: 'Linear projection to 128,256 token vocabulary size. Softmax computes next token probabilities: P("on") = 94.2%.',
      realWorldCalculation: 'Logits = X * W_vocab^T (4096x128256) -> Softmax -> Top-1 Token: "on" (94.2%)',
      whyItHappened5yo: '🎯 WHY IT HAPPENED: The final prediction wheel spins through all 128,000 words and picks "on" as the winner to continue "The cat sat on"!',
      cameraTarget: [0, 6.5, 0],
      cameraPosition: [0, 8.5, 12]
    }
  ],
  quizQuestions: [
    {
      id: 'tf-q1',
      question: 'Why do Transformers scale dot-product attention scores by 1 / sqrt(d_k)?',
      options: [
        'To reduce memory bandwidth on GPU',
        'To prevent large dot products from pushing softmax into small gradient regions',
        'To force causal lower-triangular masking',
        'To equalize token length across batches'
      ],
      correctOptionIndex: 1,
      targetNodeId: 'tf-attn-matrix',
      explanation: 'When d_k is large, dot products grow large in magnitude, causing softmax to yield extremely small gradients (vanishing gradients). Scaling by sqrt(d_k) stabilizes variance.'
    }
  ]
};
