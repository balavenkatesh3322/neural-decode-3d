import { Architecture } from '../../types/architecture';

export const cnnArchitecture: Architecture = {
  id: 'cnn',
  name: 'CNN (ResNet-50)',
  subtitle: 'Spatial Feature Hierarchy & Residual Nets',
  category: 'vision',
  categoryName: 'Computer Vision',
  badge: 'ResNet-50 / ConvNeXt',
  tagline: 'Extract spatial hierarchical visual features using 2D/3D sliding convolution kernels and bottleneck residual identity bridges.',
  description: 'Convolutional Neural Networks preserve spatial geometry by sliding small parameterized filter kernels across receptive fields, extracting low-level edges, mid-level textures, and high-level object semantics across downsampled feature maps.',
  thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop',
  defaultCameraPosition: [0, 4, 18],
  defaultCameraTarget: [0, 0, 0],
  realWorldSampleInput: {
    type: 'image',
    label: 'Real Input Photo',
    value: 'Golden Retriever Dog (224 × 224 RGB Pixels)'
  },
  keyFacts: {
    paramCount: '25.6 Million Parameters',
    contextLength: '224 × 224 RGB Pixels',
    primaryUse: 'Image Classification & Object Detection',
    inventedYear: '2015 (He et al. - ILSVRC Champion)',
    keyInnovations: 'Identity Shortcut Residual Mapping, 1x1 Bottleneck Convolutions',
  },
  components: [
    {
      id: 'cnn-input-image',
      name: 'RGB Input Image Spatial Grid',
      subName: 'Raw Pixel Tensor',
      category: 'Input Tensor',
      position: [0, -6, 0],
      color: '#3B82F6',
      glowColor: '#60A5FA',
      description: 'Raw 3-channel (Red, Green, Blue) image spatial grid input normalized between [-1, 1].',
      fiveYearOldWhy: 'The computer looks at a picture of a dog split into 224x224 tiny color dots!',
      componentImpact: 'IF MISSING: No image data enters the network! The computer has zero visual pixels to analyze.',
      mathFormula: 'I_{in} \\in \\mathbb{R}^{B \\times 3 \\times 224 \\times 224}',
      explanation: 'Pixels represent raw spatial color intensities across 224 height and width grid locations.',
      keyMetrics: [
        { label: 'Spatial Resolution', value: '224 × 224' },
        { label: 'Channels', value: '3 (RGB)' },
        { label: 'Total Pixels', value: '150,528 values' }
      ],
      inputTensor: { name: 'Raw Image File', expression: '(Batch, Channels, Height, Width)', numericalExample: '(1, 3, 224, 224)' },
      outputTensor: { name: 'Normalized Input Grid', expression: '(Batch, 3, 224, 224)', numericalExample: '(1, 3, 224, 224)' },
      connectedTo: ['cnn-conv1-stem']
    },
    {
      id: 'cnn-conv1-stem',
      name: 'Conv1 Stem (7x7, stride 2)',
      subName: 'Edge & Corner Extractor',
      category: 'Stem Layer',
      position: [0, -3.5, 0],
      color: '#F59E0B',
      glowColor: '#FBBF24',
      description: 'Initial stem layer sliding 64 kernels of size 7x7 with stride 2, followed by BatchNorm and Max Pooling to capture primary Gabor-like edge features.',
      fiveYearOldWhy: 'A 3x3 sliding magnifying glass slides over the photo to spot sharp lines, dark corners, and dog fur edges!',
      componentImpact: 'IF MISSING: High-resolution pixels overwhelm compute memory! Without stem downsampling, 50 layers would take days to process 1 image.',
      mathFormula: 'Y_{c,i,j} = \\sum_{k,m,n} X_{k, i \\cdot s + m, j \\cdot s + n} W_{c,k,m,n} + b_c',
      explanation: 'Reduces spatial grid height and width by 4x while expanding channel depth from 3 RGB channels to 64 low-level visual feature maps.',
      keyMetrics: [
        { label: 'Kernel Size', value: '7 × 7, Stride 2' },
        { label: 'Output Channels', value: '64' },
        { label: 'Spatial Dim after Pool', value: '56 × 56' }
      ],
      inputTensor: { name: 'RGB Tensor', expression: '(1, 3, 224, 224)', numericalExample: '(1, 3, 224, 224)' },
      outputTensor: { name: 'Stem Feature Map', expression: '(1, 64, 56, 56)', numericalExample: '(1, 64, 56, 56)' },
      connectedTo: ['cnn-bottleneck-block']
    },
    {
      id: 'cnn-bottleneck-block',
      name: 'Bottleneck Residual Block (1x1 -> 3x3 -> 1x1)',
      subName: '3-Stage Projection Block',
      category: 'ResNet Block',
      position: [0, -1, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Standard ResNet bottleneck structure: 1x1 Conv reduces channels, 3x3 spatial Conv extracts textures, and 1x1 Conv restores high channel capacity.',
      fiveYearOldWhy: 'Combines simple lines into complex shapes: floppy ears, black nose, and golden fur textures!',
      componentImpact: 'IF MISSING: Network loses 3D spatial feature abstraction, unable to combine simple lines into complex object shapes (floppy ears, snout)!',
      mathFormula: 'F(x) = W_3 \\cdot \\text{ReLU}\\left( \\text{BN}(W_2 \\cdot \\text{ReLU}(\\text{BN}(W_1 x))) \\right)',
      explanation: 'Bottleneck architecture saves 50% FLOPS compared to standard 3x3 stacks while enabling deeper feature abstraction.',
      keyMetrics: [
        { label: 'Channel Expansion', value: '64 → 256' },
        { label: 'Convolutions per Block', value: '3 (1x1, 3x3, 1x1)' },
        { label: 'Non-Linearity', value: 'Post-BN ReLU' }
      ],
      inputTensor: { name: 'Pre-Block Map', expression: '(1, 64, 56, 56)', numericalExample: '(1, 64, 56, 56)' },
      outputTensor: { name: 'Bottleneck Map', expression: '(1, 256, 56, 56)', numericalExample: '(1, 256, 56, 56)' },
      connectedTo: ['cnn-residual-skip']
    },
    {
      id: 'cnn-residual-skip',
      name: 'Identity Shortcut Addition (F(x) + x)',
      subName: 'Gradient Highway',
      category: 'Skip Connection',
      position: [0, 1.5, 0],
      color: '#10B981',
      glowColor: '#34D399',
      description: 'Core ResNet breakthrough: Adds input shortcut tensor x directly to residual transformation output F(x) before final ReLU activation.',
      fiveYearOldWhy: 'A 3D shortcut bridge! It keeps a copy of the original dog photo so deep layers don\'t forget what the dog looked like.',
      componentImpact: 'CRITICAL FAIL: Without identity skip bridges, gradients shrink by 99% in deep layers (vanishing gradient), causing deep networks to perform WORSE than shallow 10-layer networks!',
      mathFormula: 'H(x) = \\text{ReLU}\\left( F(x) + x \\right)',
      explanation: 'Identity mapping guarantees that a deeper network can perform at least as well as a shallow network.',
      keyMetrics: [
        { label: 'Shortcut Type', value: 'Identity' },
        { label: 'Gradient Flow', value: 'Unobstructed dL/dx = dL/dF + 1' },
        { label: 'Max Depth Supported', value: '1000+ Layers' }
      ],
      inputTensor: { name: 'F(x) & x Tensors', expression: 'Two (1, 256, 56, 56)', numericalExample: 'Two (1, 256, 56, 56)' },
      outputTensor: { name: 'Residual Sum Map', expression: '(1, 256, 56, 56)', numericalExample: '(1, 256, 56, 56)' },
      connectedTo: ['cnn-global-pool']
    },
    {
      id: 'cnn-global-pool',
      name: 'Global Average Pooling (GAP)',
      subName: 'Spatial Grid Aggregator',
      category: 'Pooling Layer',
      position: [0, 4, 0],
      color: '#F43F5E',
      glowColor: '#FB7185',
      description: 'Averages spatial values across entire height x width dimensions of each feature map channel, converting 2D maps into 1D feature vector.',
      fiveYearOldWhy: 'Averages all tiny feature squares into 1 summary list of dog clues!',
      componentImpact: 'IF MISSING: Fully-connected layers require 100M+ fragile weights that memorize pixel positions and overfit severely!',
      mathFormula: 'v_c = \\frac{1}{H \\times W} \\sum_{i=1}^H \\sum_{j=1}^W X_{c,i,j}',
      explanation: 'Replaces millions of fragile fully-connected weights with spatial averaging.',
      keyMetrics: [
        { label: 'Spatial Reduction', value: '7 × 7 → 1 × 1' },
        { label: 'Feature Vector Dim', value: '2048' },
        { label: 'Parameter Count', value: '0 Params' }
      ],
      inputTensor: { name: 'Final Stage Map', expression: '(1, 2048, 7, 7)', numericalExample: '(1, 2048, 7, 7)' },
      outputTensor: { name: 'Global Feature Vector', expression: '(1, 2048, 1, 1)', numericalExample: '(1, 2048, 1, 1)' },
      connectedTo: ['cnn-fc-classifier']
    },
    {
      id: 'cnn-fc-classifier',
      name: '1000-Class Softmax Classifier',
      subName: 'ImageNet Category Output',
      category: 'Output Layer',
      position: [0, 6.5, 0],
      color: '#06B6D4',
      glowColor: '#67E8F9',
      description: 'Linear dense layer projecting 2048-dim feature vector to 1000 ImageNet category logits.',
      fiveYearOldWhy: 'The final answer board! It checks 1,000 animal names and shouts: "94.2% Golden Retriever!"',
      componentImpact: 'IF MISSING: The network extracts rich dog features but cannot output a human-readable animal class prediction!',
      mathFormula: 'P(\\text{class}_k) = \\text{Softmax}(W_{fc} \\cdot v_{\\text{GAP}} + b)',
      explanation: 'Computes class probabilities summing to 1.0 for image recognition tasks.',
      keyMetrics: [
        { label: 'Classes', value: '1000 (ImageNet)' },
        { label: 'Top-1 Accuracy', value: '76.1%' },
        { label: 'Top-5 Accuracy', value: '93.0%' }
      ],
      inputTensor: { name: 'Global Vector', expression: '(1, 2048)', numericalExample: '(1, 2048)' },
      outputTensor: { name: 'Class Logits', expression: '(1, 1000)', numericalExample: '(1, 1000)' },
    }
  ],
  dataFlowSteps: [
    {
      stepIndex: 1,
      title: 'Raw 224x224 RGB Image Ingestion',
      activeNodeId: 'cnn-input-image',
      description: 'Golden Retriever input photo is normalized into a 3-channel (Red, Green, Blue) spatial pixel grid (224 x 224 pixels).',
      realWorldCalculation: 'RGB Image (224x224x3) -> Normalization (x - mean)/std -> Tensor (1, 3, 224, 224)',
      whyItHappened5yo: '🐶 WHY IT HAPPENED: The computer loads the Golden Retriever photo as 150,000 tiny colored pixel dots.',
      cameraTarget: [0, -6, 0],
      cameraPosition: [0, -4, 12]
    },
    {
      stepIndex: 2,
      title: '7x7 Conv Stem & Sliding Filter Multiplication',
      activeNodeId: 'cnn-conv1-stem',
      description: '64 sliding filter kernels slide across pixel grid with stride 2, computing dot-product multiplications to detect edges, lines, and fur outlines.',
      realWorldCalculation: 'Conv2d(3 -> 64, kernel=7x7, stride=2) -> MaxPool(3x3, s=2) -> Feature Map (1, 64, 56, 56)',
      whyItHappened5yo: '🔍 WHY IT HAPPENED: A 3x3 sliding magnifying glass slides across the dog photo to detect sharp fur lines and eye shapes!',
      cameraTarget: [0, -3.5, 0],
      cameraPosition: [0, -1.5, 10]
    },
    {
      stepIndex: 3,
      title: '3-Stage Bottleneck Convolutions',
      activeNodeId: 'cnn-bottleneck-block',
      description: '1x1 channel compression, 3x3 spatial pattern extraction, and 1x1 channel expansion refine complex dog textures (floppy ears, nose).',
      realWorldCalculation: '1x1 Conv(64->64) * 3x3 Conv(64->64) * 1x1 Conv(64->256) -> Bottleneck Map (1, 256, 56, 56)',
      whyItHappened5yo: '🦮 WHY IT HAPPENED: Combines simple lines into complex dog parts: floppy ears, black snout, and golden fur patterns!',
      cameraTarget: [0, -1, 0],
      cameraPosition: [0, 1, 10]
    },
    {
      stepIndex: 4,
      title: 'Identity Skip Addition F(x) + x',
      activeNodeId: 'cnn-residual-skip',
      description: 'The raw input shortcut x is added element-wise to the output map F(x), preserving unmodified signal flow across deep layers.',
      realWorldCalculation: 'H(x) = ReLU( F(x) + x ) -> Output Map (1, 256, 56, 56)',
      whyItHappened5yo: '🌉 WHY IT HAPPENED: A 3D shortcut bridge carries the original photo features forward so deep layers don\'t forget what the dog looks like!',
      cameraTarget: [0, 1.5, 0],
      cameraPosition: [0, 3.5, 10]
    },
    {
      stepIndex: 5,
      title: 'Global Average Pooling (7x7 -> 1x1)',
      activeNodeId: 'cnn-global-pool',
      description: 'Spatial maps are collapsed into a compact 2048-dimensional visual feature descriptor by averaging 7x7 spatial values.',
      realWorldCalculation: 'GAP(2048, 7, 7) = mean(height, width) -> Output Vector (1, 2048, 1, 1)',
      whyItHappened5yo: '📊 WHY IT HAPPENED: Squishes all tiny feature maps into 1 summary list of dog clues!',
      cameraTarget: [0, 4, 0],
      cameraPosition: [0, 6, 10]
    },
    {
      stepIndex: 6,
      title: '1000-Class Softmax Classification',
      activeNodeId: 'cnn-fc-classifier',
      description: 'Dense linear layer computes class logits: 94.2% probability "Golden Retriever".',
      realWorldCalculation: 'Softmax( W_fc * v_GAP + b ) -> Class #207: "Golden Retriever" (94.2% Confidence)',
      whyItHappened5yo: '🏆 WHY IT HAPPENED: The answer board checks 1,000 animal names and declares: 94.2% Golden Retriever!',
      cameraTarget: [0, 6.5, 0],
      cameraPosition: [0, 8.5, 12]
    }
  ],
  quizQuestions: [
    {
      id: 'cnn-q1',
      question: 'What fundamental issue in deep neural networks did the ResNet residual skip connection solve?',
      options: [
        'High GPU memory usage in 1x1 convolutions',
        'The vanishing/degrading gradient problem in very deep architectures (50-152 layers)',
        'The inability to process text tokens',
        'Slow disk read speeds'
      ],
      correctOptionIndex: 1,
      targetNodeId: 'cnn-residual-skip',
      explanation: 'Identity skip connections allow gradients to flow backwards directly through addition operators without multiplying by fractional weights.'
    }
  ]
};
