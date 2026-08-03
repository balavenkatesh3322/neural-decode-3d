import { Architecture } from '../../types/architecture';

export const diffusionArchitecture: Architecture = {
  id: 'diffusion',
  name: 'Latent Diffusion (U-Net)',
  subtitle: 'Iterative Stochastic Noise Denoising',
  category: 'generative',
  categoryName: 'Generative AI & Synthesis',
  badge: 'Stable Diffusion 3 / FLUX.1',
  tagline: 'Transform pure Gaussian noise into photorealistic high-resolution imagery through iterative cross-attention score matching.',
  description: 'Latent Diffusion models learn the reverse Markov chain of a Gaussian noise process.',
  paperUrl: 'https://arxiv.org/abs/2112.10752',
  paperTitle: 'High-Resolution Image Synthesis with Latent Diffusion Models (Rombach et al.)',
  thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=400&auto=format&fit=crop',
  defaultCameraPosition: [0, 4, 18],
  defaultCameraTarget: [0, 0, 0],
  realWorldSampleInput: {
    type: 'text',
    label: 'Real Input Image Prompt',
    value: '"A golden retriever puppy in cyberpunk city with neon lights"'
  },
  keyFacts: {
    paramCount: '860M - 12B Parameters',
    contextLength: '64 × 64 Latent Grid (512 × 512 Pixels)',
    primaryUse: 'Text-to-Image & Video Generation',
    inventedYear: '2020 / 2022 (Ho et al. / Rombach et al.)',
    keyInnovations: 'Latent Space Compression, Timestep Sinusoidal Embeddings, Spatial Cross-Attention',
  },
  components: [
    {
      id: 'diff-latent-noise',
      name: 'Noisy Latent Tensor z_t & Time Embedding t',
      subName: 'Gaussian Noise Grid',
      category: 'Input Tensor',
      position: [0, -6, 0],
      color: '#F43F5E',
      glowColor: '#FB7185',
      description: 'Compressed 4-channel VAE latent tensor injected with Gaussian noise at timestep t (e.g. t=800 out of 1000).',
      fiveYearOldWhy: 'A fuzzy TV static screen at step t=800 waiting to be cleaned into a puppy picture!',
      componentImpact: 'IF MISSING: Generating images directly in 512x512 pixel space requires 64x more GPU memory and runs 10x slower!',
      mathFormula: 'z_t = \\sqrt{\\bar{\\alpha}_t} z_0 + \\sqrt{1 - \\bar{\\alpha}_t} \\epsilon, \\quad e_t = \\text{Sinusoidal}(t)',
      explanation: 'Operating in 64x64 latent space reduces compute 64x compared to raw pixel space.',
      keyMetrics: [
        { label: 'Latent Resolution', value: '64 × 64 × 4' },
        { label: 'Diffusion Timesteps', value: '1000 Steps' }
      ],
      inputTensor: { name: 'Latent Grid & Timestep', expression: '(Batch, 4, 64, 64) + Int t', numericalExample: '(1, 4, 64, 64) @ t=800' },
      outputTensor: { name: 'Time-Conditioned Input', expression: '(Batch, 320, 64, 64)', numericalExample: '(1, 320, 64, 64)' },
      connectedTo: ['diff-encoder-down']
    },
    {
      id: 'diff-text-encoder',
      name: 'CLIP / T5 Text Prompt Cross-Conditioner',
      subName: 'Prompt Embedding Engine',
      category: 'Conditioning',
      position: [-5, -3.5, 0],
      color: '#06B6D4',
      glowColor: '#67E8F9',
      description: 'Freezes textual prompt "A golden retriever puppy..." into sequence of token embeddings y.',
      fiveYearOldWhy: 'Reads the story "golden retriever puppy in neon city" and shoots helper rays into the picture grid!',
      componentImpact: 'IF MISSING: The image generator runs completely unguided, generating random noisy objects without following text prompts!',
      mathFormula: 'y = \\text{CLIP}_{Text}(\\text{"A golden retriever puppy..."})',
      explanation: 'Provides semantic text context vectors fed into U-Net Spatial Cross-Attention layers.',
      keyMetrics: [
        { label: 'Text Model', value: 'OpenCLIP ViT-L/14 + T5-XXL' }
      ],
      inputTensor: { name: 'Text String Prompt', expression: 'String', numericalExample: '"A golden retriever puppy..."' },
      outputTensor: { name: 'Text Context Matrix y', expression: '(Batch, 77, 768)', numericalExample: '(1, 77, 768)' },
      connectedTo: ['diff-encoder-down', 'diff-bottleneck', 'diff-decoder-up']
    },
    {
      id: 'diff-encoder-down',
      name: 'Contracting U-Net Encoder Blocks',
      subName: 'Spatial Downsampling',
      category: 'U-Net Encoder',
      position: [0, -3.5, 0],
      color: '#F59E0B',
      glowColor: '#FBBF24',
      description: 'Symmetric encoder hierarchy with ResNet blocks and Spatial Cross-Attention that downsample spatial grid (64x64 -> 32x32 -> 16x16).',
      fiveYearOldWhy: 'Shrinks the image size while injecting text instructions at every step!',
      componentImpact: 'IF MISSING: Multi-scale spatial features are lost, making it impossible to capture both high-level composition and fine details!',
      mathFormula: 'h_{down} = \\text{Downsample}\\left( \\text{ResBlock}(z_t, e_t) + \\text{CrossAttn}(Q=z_t, K=y, V=y) \\right)',
      explanation: 'Extracts multi-scale features while injecting text semantics at every layer.',
      keyMetrics: [
        { label: 'Downsampling Stages', value: '3 Stages' }
      ],
      inputTensor: { name: 'Latent + Context y', expression: '(Batch, 320, 64, 64)', numericalExample: '(1, 320, 64, 64)' },
      outputTensor: { name: 'Encoded Deep Latent', expression: '(Batch, 1280, 16, 16)', numericalExample: '(1, 1280, 16, 16)' },
      connectedTo: ['diff-bottleneck']
    },
    {
      id: 'diff-bottleneck',
      name: 'U-Net Bottleneck Self & Cross Attention',
      subName: 'Global Semantic Core',
      category: 'U-Net Bottleneck',
      position: [0, -0.5, 0],
      color: '#8B5CF6',
      glowColor: '#C084FC',
      description: 'Lowest resolution 16x16 bottleneck layer executing dense global Self-Attention and Cross-Attention with prompt embeddings.',
      fiveYearOldWhy: 'The main art designer! Aligns puppy shapes, glowing neon lights, and city buildings.',
      componentImpact: 'IF MISSING: Subject composition becomes disjointed (e.g. dog ears floating separately from head background)!',
      mathFormula: '\\text{Bottleneck} = \\text{ResBlock}(\\text{SelfAttn}(h) + \\text{CrossAttn}(h, y), e_t)',
      explanation: 'Aligns global image composition, lighting, and subject arrangement.',
      keyMetrics: [
        { label: 'Bottleneck Grid', value: '16 × 16' }
      ],
      inputTensor: { name: 'Deep Latent', expression: '(Batch, 1280, 16, 16)', numericalExample: '(1, 1280, 16, 16)' },
      outputTensor: { name: 'Bottleneck Features', expression: '(Batch, 1280, 16, 16)', numericalExample: '(1, 1280, 16, 16)' },
      connectedTo: ['diff-decoder-up']
    },
    {
      id: 'diff-decoder-up',
      name: 'Expanding U-Net Decoder & Skip Bridges',
      subName: 'Spatial Upsampling',
      category: 'U-Net Decoder',
      position: [0, 2.5, 0],
      color: '#10B981',
      glowColor: '#34D399',
      description: 'Upsamples spatial features back to 64x64 while concatenating high-resolution skip connection tensors.',
      fiveYearOldWhy: 'Grows the image back to big size while keeping sharp fur details from shortcut bridges!',
      componentImpact: 'IF MISSING: Generated images look blurry and lack sharp edge textures like fur, whiskers, and neon highlights!',
      mathFormula: 'h_{up} = \\text{Upsample}\\left( \\text{Concat}(h_{up}, h_{skip}) \\right)',
      explanation: 'Skip connections preserve crisp edge details lost during encoder downsampling.',
      keyMetrics: [
        { label: 'Skip Concatenation', value: 'Encoder Features Combined' }
      ],
      inputTensor: { name: 'Bottleneck + Skip Tensors', expression: 'Concat (1280 + Skip)', numericalExample: '(1, 2560, 16, 16)' },
      outputTensor: { name: 'Decoded Grid', expression: '(Batch, 320, 64, 64)', numericalExample: '(1, 320, 64, 64)' },
      connectedTo: ['diff-noise-predict']
    },
    {
      id: 'diff-noise-predict',
      name: 'Predicted Noise Vector ε_θ & Denoising Step',
      subName: 'Estimated Noise Subtraction',
      category: 'Output Layer',
      position: [0, 6, 0],
      color: '#3B82F6',
      glowColor: '#60A5FA',
      description: 'Predicts exact Gaussian noise ε_θ present in z_t. Sampler subtracts noise to compute cleaner latent z_{t-1}.',
      fiveYearOldWhy: 'Wipes away the noise static, leaving a clean golden retriever puppy picture!',
      componentImpact: 'IF MISSING: No noise can be subtracted, leaving the output stuck forever as pure fuzzy static!',
      mathFormula: 'z_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left( z_t - \\frac{1 - \\alpha_t}{\\sqrt{1 - \\bar{\\alpha}_t}} \\epsilon_\\epsilon \\right)',
      explanation: 'Repeating this process for 20-50 sampler steps removes all noise, producing a pristine image.',
      keyMetrics: [
        { label: 'Predicted Output', value: 'Noise Map (4 × 64 × 64)' }
      ],
      inputTensor: { name: 'Final Layer Output', expression: '(Batch, 320, 64, 64)', numericalExample: '(1, 320, 64, 64)' },
      outputTensor: { name: 'Predicted Noise Map ε_θ', expression: '(Batch, 4, 64, 64)', numericalExample: '(1, 4, 64, 64)' },
    }
  ],
  dataFlowSteps: [
    {
      stepIndex: 1,
      title: 'Noisy Latent z_t Ingestion (t=800)',
      activeNodeId: 'diff-latent-noise',
      description: 'Noisy 4-channel latent tensor z_t and timestep t=800 are loaded into the diffusion engine.',
      realWorldCalculation: 'z_t = sqrt(alpha_bar) * z_0 + sqrt(1 - alpha_bar) * noise @ t=800',
      whyItHappened5yo: '📺 WHY IT HAPPENED: Starts with a fuzzy noisy TV static screen at step 800 of 1000.',
      cameraTarget: [0, -6, 0],
      cameraPosition: [0, -4, 12]
    },
    {
      stepIndex: 2,
      title: 'CLIP Text Conditioning Injection',
      activeNodeId: 'diff-text-encoder',
      description: 'Text prompt "A golden retriever puppy in cyberpunk city" is encoded into semantic context matrix y.',
      realWorldCalculation: 'Prompt -> OpenCLIP Text Encoder -> Conditioning Matrix (1, 77, 768)',
      whyItHappened5yo: '🗣️ WHY IT HAPPENED: Reads the prompt "golden retriever in neon city" and shoots helper rays into the U-Net picture builder!',
      cameraTarget: [-5, -3.5, 0],
      cameraPosition: [-3, -2, 10]
    },
    {
      stepIndex: 3,
      title: 'Contracting Encoder & Spatial Cross-Attention',
      activeNodeId: 'diff-encoder-down',
      description: 'Multi-scale U-Net encoder downsamples latent grid (64x64 -> 16x16) while injecting text prompt tokens into cross-attention.',
      realWorldCalculation: 'Downsample 64x64 -> 32x32 -> 16x16 with Cross-Attention Q=Latent, K=Text, V=Text',
      whyItHappened5yo: '🔻 WHY IT HAPPENED: Shrinks picture grid down while listening to the text prompt instructions at every resolution!',
      cameraTarget: [0, -3.5, 0],
      cameraPosition: [0, -1.5, 10]
    },
    {
      stepIndex: 4,
      title: 'U-Net Bottleneck Self & Cross Attention Core',
      activeNodeId: 'diff-bottleneck',
      description: 'Deepest 16x16 bottleneck layer evaluates global spatial self-attention and text prompt cross-attention.',
      realWorldCalculation: 'SelfAttn(16x16) + CrossAttn(16x16, Text_77) -> Bottleneck Features',
      whyItHappened5yo: '🎨 WHY IT HAPPENED: The main art designer aligns puppy shapes with neon city buildings!',
      cameraTarget: [0, -0.5, 0],
      cameraPosition: [0, 1.5, 10]
    },
    {
      stepIndex: 5,
      title: 'Expanding Decoder & Skip Connection Bridge',
      activeNodeId: 'diff-decoder-up',
      description: 'Decoder upsamples feature maps back to 64x64, concatenating high-res skip tensors saved from encoder.',
      realWorldCalculation: 'Upsample 16x16 -> 32x32 -> 64x64 + Concat(Encoder_Skip_Tensors)',
      whyItHappened5yo: '🔺 WHY IT HAPPENED: Grows the image grid back to 64x64 while preserving sharp fur details from shortcut bridges!',
      cameraTarget: [0, 2.5, 0],
      cameraPosition: [0, 4.5, 10]
    },
    {
      stepIndex: 6,
      title: 'Predicted Noise Subtraction z_t -> z_{t-1}',
      activeNodeId: 'diff-noise-predict',
      description: 'Network outputs estimated noise tensor ε_θ. Sampler subtracts noise, yielding cleaner latent z_{t-1} towards step t=0.',
      realWorldCalculation: 'z_{t-1} = 1/sqrt(alpha) * ( z_t - coeff * epsilon_theta ) -> Cleaner Latent z_799',
      whyItHappened5yo: '✨ WHY IT HAPPENED: Wipes away 1 step of noise static, bringing out a crisp golden retriever puppy picture!',
      cameraTarget: [0, 6, 0],
      cameraPosition: [0, 8, 12]
    }
  ],
  quizQuestions: [
    {
      id: 'diff-q1',
      question: 'What primary breakthrough makes Latent Diffusion drastically faster than pixel-space DDPM diffusion?',
      options: [
        'Running diffusion inside a compressed 64x64 VAE latent space instead of high-resolution pixel space',
        'Skipping all attention layers',
        'Converting RGB images to black and white',
        'Using 8-bit text tokens'
      ],
      correctOptionIndex: 0,
      targetNodeId: 'diff-latent-noise',
      explanation: 'Latent Diffusion operates in a 4-channel 64x64 latent space, preserving visual details while reducing compute.'
    }
  ]
};
