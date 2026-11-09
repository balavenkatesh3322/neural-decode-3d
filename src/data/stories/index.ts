import type { Story } from './types';
export type { Story } from './types';

/** Hand-written stories for every built-in architecture (custom models get an auto-generated one). */
export const STORIES: Record<string, Story> = {
  transformer: {
    problems: [
      { title: 'Chat assistants', example: 'ChatGPT, Claude and Llama answer questions and write code one token at a time.' },
      { title: 'Code completion', example: 'GitHub Copilot predicts the next lines of your program.' },
      { title: 'Summarising & drafting', example: 'Turning a 20-page report into five bullet points.' },
    ],
    input: { label: 'Prompt', value: '“The cat sat on the”' },
    output: { label: 'Next token', value: '“ mat” — 41%', meaning: 'A probability for every one of 128,256 tokens; the most likely is appended and the model runs again.' },
    journey: [
      'The prompt is split into tokens and each token id becomes a 4,096-number vector.',
      'RoPE rotates each vector by its position so word order is known.',
      'In each of 32 decoder blocks, attention lets every token look back at earlier tokens (“sat” looks at “cat”).',
      'The feed-forward network adds stored knowledge to every token (cats sit on mats).',
      'The last token’s vector is projected onto the whole vocabulary and softmaxed into probabilities.',
    ],
    remember: {
      oneLiner: 'Predict the next word by letting every word look at all the words before it.',
      mnemonic: 'EARN: Embed → Attend → Refine (FFN) → Next-token.',
      keyIdeas: ['Causal attention only looks backwards.', 'Residual stream + norm keep 32+ blocks stable.', 'Text is generated one token at a time (autoregressive).'],
    },
  },
  'transformer-full': {
    problems: [
      { title: 'Machine translation', example: 'Google Translate: English → Spanish.' },
      { title: 'Summarisation', example: 'T5 and BART condense articles into headlines.' },
      { title: 'Speech & captioning', example: 'Whisper and image captioners use the same encoder–decoder idea.' },
    ],
    input: { label: 'English sentence', value: '“Knowledge is power”' },
    output: { label: 'Spanish sentence', value: '“El conocimiento es poder”', meaning: 'Generated one token at a time while cross-attending to the encoded English.' },
    journey: [
      'The encoder reads the whole English sentence at once (no mask) and builds a meaning vector per word.',
      'The decoder starts with a start token and attends to what it has written so far (masked).',
      'Cross-attention lets each Spanish word look up the most relevant English words.',
      'The LM head scores every Spanish token; the best one is written and the decoder runs again.',
    ],
    remember: {
      oneLiner: 'Read the whole source first, then write the target while glancing back at it.',
      mnemonic: 'Listen fully, then speak: Encoder listens, Decoder speaks, Cross-attention glances back.',
      keyIdeas: ['Encoder = bidirectional, decoder = causal.', 'Cross-attention: Q from decoder, K/V from encoder.', 'Input and output can be different languages or even modalities.'],
    },
  },
  moe: {
    problems: [
      { title: 'Huge models at low cost', example: 'Mixtral 8×7B has 47B parameters but uses only ~13B per token.' },
      { title: 'Multilingual & multi-domain', example: 'Different experts specialise in code, maths or languages.' },
      { title: 'Fast inference serving', example: 'DeepSeek-V3 serves a 671B model at the cost of a ~37B one.' },
    ],
    input: { label: 'Token', value: '“def” in “def fibonacci(n):”' },
    output: { label: 'Updated token vector', value: '0.7 × Expert 1 (code) + 0.3 × Expert 2 + shared', meaning: 'Only the 2 chosen experts did any work for this token.' },
    journey: [
      'A token’s hidden vector arrives from the attention layer.',
      'The router scores all experts and picks the top-2 (here: code and language).',
      'Only those experts run; the always-on shared expert runs too.',
      'Outputs are blended with the router’s weights and added back to the residual stream.',
    ],
    remember: {
      oneLiner: 'Many specialist networks, but each token only visits the few it needs.',
      mnemonic: 'Hospital: reception (router) sends you to 2 doctors (experts), not all 8.',
      keyIdeas: ['Total parameters ≫ active parameters.', 'Router = small softmax classifier over experts.', 'Load balancing keeps all experts useful.'],
    },
  },
  cnn: {
    problems: [
      { title: 'Image classification', example: 'Sorting photos: cat, dog, car — ImageNet’s 1,000 classes.' },
      { title: 'Medical imaging', example: 'Spotting diabetic retinopathy in eye scans.' },
      { title: 'Quality control', example: 'Finding scratches on products on a factory line.' },
    ],
    input: { label: 'Photo', value: '224×224 photo of a golden retriever' },
    output: { label: 'Class', value: '“golden retriever” — 92%', meaning: 'Softmax over 1,000 ImageNet classes.' },
    journey: [
      'The 7×7 stem convolution finds edges and colour blobs and shrinks the image to 112×112.',
      'Stage 1 bottleneck blocks combine edges into textures (fur!).',
      'Stages 2–4 halve the resolution and double the channels: textures → ears, eyes → whole dogs.',
      'Global average pooling turns the 7×7×2048 map into one 2,048-number summary.',
      'The fully-connected head scores 1,000 classes.',
    ],
    remember: {
      oneLiner: 'Slide small pattern detectors over the image, layer by layer, from edges to objects.',
      mnemonic: 'Edges → Textures → Parts → Objects (ETPO).',
      keyIdeas: ['Convolutions share weights across positions.', 'Resolution ↓, channels ↑ as you go deeper.', 'Residual shortcuts make 50+ layers trainable.'],
    },
  },
  mamba: {
    problems: [
      { title: 'Very long documents', example: 'Reading a whole book or codebase in linear time.' },
      { title: 'Genomics', example: 'Modelling DNA sequences of a million base pairs.' },
      { title: 'Audio & time series', example: 'Raw waveforms and sensor streams.' },
    ],
    input: { label: 'Long sequence', value: '1,024 tokens of source code' },
    output: { label: 'Per-token outputs', value: '1,024 updated vectors', meaning: 'Each depends on all earlier tokens via the recurrent state — computed in linear time.' },
    journey: [
      'Each token is projected up and lightly mixed with its neighbours by a short convolution.',
      'The token itself decides Δ, B and C — how much to remember and how much to read out.',
      'A parallel scan updates a compact state h as it moves along the sequence.',
      'A gate (SiLU(z)) filters the result, and it is projected back and added to the residual.',
    ],
    remember: {
      oneLiner: 'A smart conveyor-belt memory that each token can write to or erase — linear time, no attention matrix.',
      mnemonic: 'SCAN: Select (Δ,B,C) → Compress into state → Advance → Narrate (y = Ch).',
      keyIdeas: ['Selectivity = input-dependent Δ, B, C.', 'Cost grows linearly with length.', 'Constant-size state at inference (no KV cache).'],
    },
  },
  diffusion: {
    problems: [
      { title: 'Text-to-image', example: 'Stable Diffusion, Midjourney, DALL·E.' },
      { title: 'Image editing', example: 'Inpainting: erase a person, fill the background.' },
      { title: 'Design & concept art', example: 'Generating product mock-ups from a prompt.' },
    ],
    input: { label: 'Prompt + noise', value: '“a golden retriever puppy in snow” + random 64×64×4 latent' },
    output: { label: 'Predicted noise → image', value: 'ε̂ (64×64×4), repeated ~30× → a clean 512×512 image', meaning: 'Each step removes a bit of noise; the VAE decoder turns the final latent into pixels.' },
    journey: [
      'Start from pure noise in a small latent space (64×64×4).',
      'The text encoder turns the prompt into 77 context vectors; the timestep says how noisy we are.',
      'The U-Net downsamples, attends to the text, and upsamples with skip connections.',
      'It predicts the noise; the scheduler subtracts a portion of it.',
      'Repeat ~30 steps, then decode the latent into an image.',
    ],
    remember: {
      oneLiner: 'Learn to remove noise; to create, start from noise and remove it step by step, guided by text.',
      mnemonic: 'Fog → Sculpt → Picture: each step clears a little fog.',
      keyIdeas: ['Trained to predict the added noise.', 'Text steers via cross-attention.', 'Works in a compressed latent space for speed.'],
    },
  },
  mlp: {
    problems: [
      { title: 'Handwritten digits', example: 'Reading postcodes on envelopes (MNIST).' },
      { title: 'Tabular predictions', example: 'Credit risk, churn or house-price models.' },
      { title: 'The head of bigger models', example: 'Almost every network ends in a small MLP.' },
    ],
    input: { label: 'Image', value: '28×28 handwritten “7” (784 pixels)' },
    output: { label: 'Digit', value: '“7” — 97%', meaning: 'Softmax over the 10 digits.' },
    journey: [
      'The image is flattened into 784 numbers.',
      'Layer 1 (512 neurons) detects stroke fragments.',
      'Layer 2 (256 neurons) combines them into shapes.',
      'The output layer scores the 10 digits; softmax makes probabilities.',
    ],
    remember: {
      oneLiner: 'Stacked weighted sums with non-linearities in between.',
      mnemonic: 'Weigh, Add, Squash, Repeat (WASR).',
      keyIdeas: ['Every input connects to every neuron.', 'Activations make depth useful.', 'Trained with backprop + gradient descent.'],
    },
  },
  lstm: {
    problems: [
      { title: 'Sentiment analysis', example: 'Is this product review positive or negative?' },
      { title: 'Time-series forecasting', example: 'Tomorrow’s electricity demand.' },
      { title: 'Keyboard prediction', example: 'Early smartphone next-word suggestions.' },
    ],
    input: { label: 'Review', value: '“this movie was not bad at all — I loved it!”' },
    output: { label: 'Sentiment', value: 'Positive — 94%', meaning: 'Two probabilities: negative vs positive.' },
    journey: [
      'Each word becomes a 128-number embedding.',
      'LSTM 1 reads word by word, updating its memory cell; gates keep “not” around until “bad” arrives.',
      'LSTM 2 reads those states; its final hidden state summarises the whole review.',
      'A linear layer + softmax gives positive/negative.',
    ],
    remember: {
      oneLiner: 'Read in order, keep a gated memory, decide at the end.',
      mnemonic: 'FIO gates: Forget, Input, Output.',
      keyIdeas: ['Hidden state carries context forward.', 'Gates fight vanishing gradients.', 'Sequential → slower to train than transformers.'],
    },
  },
  gpt2: {
    problems: [
      { title: 'Text generation', example: 'Writing stories, emails and dialogue.' },
      { title: 'Autocomplete', example: 'Finishing sentences and code.' },
      { title: 'A teaching model', example: 'Small enough (124M) to train and inspect on a laptop.' },
    ],
    input: { label: 'Prompt', value: '“The cat sat on the”' },
    output: { label: 'Next token', value: '“ floor” 9%, “ bed” 6%, “ edge” 5%…', meaning: 'Real DistilGPT-2 probabilities can be computed in the Playground → Real GPT-2 tab.' },
    journey: [
      'BPE splits the text into tokens: ["The", " cat", " sat", " on", " the"].',
      'Token + learned position embeddings give 768 numbers per token.',
      '12 blocks of masked self-attention + GELU MLP refine every token.',
      'The final vector is multiplied by the (tied) embedding matrix → 50,257 scores → softmax.',
    ],
    remember: {
      oneLiner: 'A decoder-only transformer trained only to predict the next token — and that is enough.',
      mnemonic: 'Tokens → 12 × (Attend + MLP) → Tied head.',
      keyIdeas: ['Pre-LayerNorm blocks.', 'Learned positions up to 1,024.', 'Weight tying shares the embedding with the output.'],
    },
  },
  bert: {
    problems: [
      { title: 'Search ranking', example: 'Google Search used BERT to understand queries.' },
      { title: 'Classification', example: 'Spam, sentiment, topic labelling.' },
      { title: 'Question answering', example: 'Finding the answer span in a paragraph (SQuAD).' },
    ],
    input: { label: 'Masked sentence', value: '“[CLS] the cat [MASK] on the mat [SEP]”' },
    output: { label: 'Prediction / embedding', value: '[MASK] → “sat” — 87%', meaning: 'Pre-training fills blanks; fine-tuning uses the [CLS] vector for tasks.' },
    journey: [
      'Token, position and segment embeddings are summed.',
      '12 encoder layers with bidirectional attention: every word sees both sides.',
      'The vector at [MASK] is used to guess the hidden word during pre-training.',
      'For tasks, the [CLS] vector goes through a pooler and a small classifier.',
    ],
    remember: {
      oneLiner: 'Understand text by filling in blanks using context from both directions.',
      mnemonic: 'Bidirectional Encoder = Both sides, Every word.',
      keyIdeas: ['Encoder-only, no causal mask.', 'Masked-language-model pre-training.', 'Fine-tune with a tiny head.'],
    },
  },
  vit: {
    problems: [
      { title: 'Image classification', example: 'State of the art on ImageNet with enough data.' },
      { title: 'Vision for multimodal LLMs', example: 'The image encoder inside GPT-4V-style models and CLIP.' },
      { title: 'Satellite & medical images', example: 'Global context helps with large scenes.' },
    ],
    input: { label: 'Photo', value: '224×224 photo of a teapot' },
    output: { label: 'Class', value: '“teapot” — 89%', meaning: 'The [CLS] token’s final vector → 1,000 classes.' },
    journey: [
      'The image is cut into 14×14 = 196 patches of 16×16 pixels.',
      'Each patch becomes a 768-number token; a [CLS] token is prepended and positions added.',
      '12 transformer blocks let every patch attend to every other patch.',
      'The [CLS] vector is classified into 1,000 classes.',
    ],
    remember: {
      oneLiner: 'Treat an image as a sentence of patches and run a transformer.',
      mnemonic: 'Patch, Embed, Attend, Classify (PEAC).',
      keyIdeas: ['No convolutions after patchify.', 'Global attention from layer 1.', 'Needs lots of data (or pre-training).'],
    },
  },
  unet: {
    problems: [
      { title: 'Medical segmentation', example: 'Outlining tumours or cells pixel by pixel.' },
      { title: 'Self-driving perception', example: 'Labelling road, car and pedestrian pixels.' },
      { title: 'Denoising backbone', example: 'Inside every Stable Diffusion model.' },
    ],
    input: { label: 'Scan', value: '256×256 microscope image' },
    output: { label: 'Mask', value: '256×256 map: cell / background', meaning: 'One class score per pixel.' },
    journey: [
      'The contracting path convolves and pools: 256 → 128 → 64 → 32 → 16 pixels, gaining channels.',
      'The bottleneck knows WHAT is in the image, but only roughly WHERE.',
      'The expanding path up-samples step by step.',
      'Skip connections paste in the sharp details from the matching encoder level.',
      'A 1×1 conv gives a class for every pixel.',
    ],
    remember: {
      oneLiner: 'Zoom out to understand, zoom back in to draw precise boundaries — with skip bridges across the U.',
      mnemonic: 'Down for What, Up for Where, Skips for Sharpness.',
      keyIdeas: ['Symmetric encoder/decoder.', 'Concatenated skip connections.', 'Output resolution = input resolution.'],
    },
  },
  vae: {
    problems: [
      { title: 'Image compression', example: 'Stable Diffusion’s VAE compresses 512×512 images 48×.' },
      { title: 'Generating variations', example: 'New faces or molecules by sampling the latent space.' },
      { title: 'Anomaly detection', example: 'Parts that reconstruct badly are unusual.' },
    ],
    input: { label: 'Image', value: '28×28 digit “3”' },
    output: { label: 'Reconstruction', value: 'A slightly blurry “3” rebuilt from 20 numbers', meaning: 'Sample a different z to get a new, similar digit.' },
    journey: [
      'The encoder compresses 784 pixels into a mean μ and spread σ for 20 latent numbers.',
      'A latent code z is sampled near μ (reparameterisation trick).',
      'The decoder expands z back into 784 pixels.',
      'Loss = reconstruction error + KL term that keeps the latent space smooth.',
    ],
    remember: {
      oneLiner: 'Squeeze data into a smooth cloud of codes, then decode any point of the cloud.',
      mnemonic: 'Encode a Cloud, Sample a Point, Decode a Picture.',
      keyIdeas: ['Latent is a distribution, not a point.', 'Reparameterisation lets gradients through sampling.', 'KL keeps codes near N(0, 1).'],
    },
  },
  gan: {
    problems: [
      { title: 'Photorealistic faces', example: 'StyleGAN’s “this person does not exist”.' },
      { title: 'Super-resolution', example: 'Upscaling old photos and games.' },
      { title: 'Data augmentation', example: 'Synthetic medical images for rare conditions.' },
    ],
    input: { label: 'Noise', value: '100 random numbers' },
    output: { label: 'Fake image + verdict', value: 'A new digit; discriminator says “real: 48%”', meaning: 'At equilibrium the discriminator can only guess 50/50.' },
    journey: [
      'The generator turns random noise into a fake image.',
      'Fake and real images are mixed into one batch.',
      'The discriminator scores each image: real or fake?',
      'The discriminator learns to catch fakes; its gradients teach the generator to fool it.',
    ],
    remember: {
      oneLiner: 'A forger and a detective improve by competing.',
      mnemonic: 'G fakes, D judges, both get better.',
      keyIdeas: ['Two networks, one min–max game.', 'Generator never sees real images directly.', 'Training can be unstable (mode collapse).'],
    },
  },
  gcn: {
    problems: [
      { title: 'Drug discovery', example: 'Predicting molecule properties from atom–bond graphs.' },
      { title: 'Recommendations', example: 'Pinterest’s PinSage over billions of user–item links.' },
      { title: 'Traffic & fraud', example: 'Road networks; suspicious transaction rings.' },
    ],
    input: { label: 'Citation graph', value: '2,708 papers, 5,429 citations, 1,433 word features each' },
    output: { label: 'Topic per paper', value: '“Neural Networks” — 88%', meaning: 'One of 7 topics for every node.' },
    journey: [
      'Each paper starts with a bag-of-words feature vector.',
      'GCN layer 1: every paper averages its neighbours’ features and compresses to 16 numbers.',
      'GCN layer 2: information from friends-of-friends arrives.',
      'Softmax gives a topic for each paper.',
    ],
    remember: {
      oneLiner: 'Each node learns from its neighbours, layer by layer.',
      mnemonic: 'Ask friends, then friends of friends.',
      keyIdeas: ['Message passing along edges.', 'Same weights for every node.', 'k layers = k-hop neighbourhood.'],
    },
  },
  clip: {
    problems: [
      { title: 'Zero-shot classification', example: 'Classify images using just class names as text.' },
      { title: 'Image search', example: '“red shoes on a beach” over millions of photos.' },
      { title: 'Guiding image generation', example: 'The text encoder of Stable Diffusion.' },
    ],
    input: { label: 'Images + captions', value: '4 photos and 4 captions (“a dog on grass”, …)' },
    output: { label: 'Similarity matrix', value: '4×4 scores, brightest on the diagonal', meaning: 'Each photo matches its own caption.' },
    journey: [
      'The image transformer turns each photo into a 512-number embedding.',
      'The text transformer turns each caption into a 512-number embedding.',
      'Both are normalised and compared: every image with every caption.',
      'Training pushes true pairs together and mismatched pairs apart.',
    ],
    remember: {
      oneLiner: 'Put pictures and words on the same map so matching ones sit together.',
      mnemonic: 'Two towers, one space, match the pairs.',
      keyIdeas: ['Contrastive loss over a batch.', 'Shared embedding space.', 'Zero-shot via text prompts.'],
    },
  },
  whisper: {
    problems: [
      { title: 'Transcription', example: 'Meeting notes, podcasts, subtitles.' },
      { title: 'Speech translation', example: 'French audio → English text.' },
      { title: 'Voice interfaces', example: 'Dictation and voice assistants.' },
    ],
    input: { label: 'Audio', value: '30 s of speech: “Hello world, how are you?”' },
    output: { label: 'Text', value: '“Hello world, how are you?”', meaning: 'Written token by token.' },
    journey: [
      'Audio becomes a log-mel spectrogram: 80 frequency bands × 3,000 frames.',
      'Two convolutions halve the time axis to 1,500 frames.',
      'The audio encoder lets every frame attend to every other frame.',
      'The text decoder writes tokens, cross-attending to the audio at each step.',
    ],
    remember: {
      oneLiner: 'An encoder listens, a decoder writes — glancing back at the sound.',
      mnemonic: 'Mel → Encode → Cross-attend → Write.',
      keyIdeas: ['Spectrogram input.', 'Encoder–decoder transformer.', 'Trained on 680k hours of weakly labelled audio.'],
    },
  },
  deepseek: {
    problems: [
      { title: 'Frontier reasoning cheaply', example: 'GPT-4-class answers at a fraction of the serving cost.' },
      { title: 'Long-context chat', example: '128k-token contexts with a small KV cache.' },
      { title: 'Code & maths', example: 'Competitive programming and olympiad maths.' },
    ],
    input: { label: 'Prompt', value: '“Prove that √2 is irrational.”' },
    output: { label: 'Next token', value: '“ Suppose” — 63%', meaning: 'Only ~37B of 671B parameters were used to produce it.' },
    journey: [
      'Tokens are embedded into 7,168-number vectors.',
      'MLA compresses keys and values into a 512-number latent — that is all that gets cached.',
      'Attention runs over keys/values rebuilt from the latent.',
      'The router sends each token to 8 of 256 experts plus a shared expert.',
      'After 61 layers, the LM head scores 129,280 tokens.',
    ],
    remember: {
      oneLiner: 'Small memory (latent KV) + sparse compute (8 of 256 experts) = a giant model that is cheap to run.',
      mnemonic: 'Zip the cache, pick the experts.',
      keyIdeas: ['Multi-head Latent Attention shrinks the KV cache.', 'Fine-grained MoE: 671B total, 37B active.', 'Shared expert handles common knowledge.'],
    },
  },
};
