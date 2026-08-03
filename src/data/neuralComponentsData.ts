import { NeuralComponentDetail } from '../types/components';

export const NEURAL_COMPONENTS_DATA: NeuralComponentDetail[] = [
  {
    id: 'weights',
    name: 'Weights (W)',
    category: 'fundamentals',
    categoryName: 'Foundational Math',
    badge: 'Multiplicative Strength',
    shortDefinition: 'Learned scalar coefficients that scale input feature signals by importance.',
    fiveYearOldSummary: 'Volume knobs that turn up important clues and turn down silly noise!',
    whatIsIt: 'Weights are numerical values attached to every connection between neurons. During forward propagation, input feature x is multiplied by its weight W (i.e. W × x).',
    whyIsItNeeded: 'Without weights, a neural network cannot prioritize important clues from useless noise. Weights represent the stored knowledge of the model learned from experience.',
    realWorldAnalogy: {
      title: 'Master Chef Recipe Ratio Dials',
      description: 'Imagine baking a chocolate cake. Flour, sugar, and cocoa powder are clues. Weights are how much of each ingredient you add. Too much cocoa turns it bitter; zero sugar ruins the cake. Weights tweak ingredient dials until the cake is delicious!',
      iconName: 'Sliders'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Random Noise (W ~ N(0, 1))',
        whatHappens: 'Weights are set to random numbers. Input signals get multiplied by garbage values.',
        explanation5yo: 'Like a baby guessing animal sounds — calling a dog "moo" and a cat "quack"!'
      },
      whileTraining: {
        status: 'Backpropagation Gradient Updates',
        whatHappens: 'Error flows BACKWARDS from the output. Gradients nudge weights: W_new = W_old - lr * dL/dW.',
        explanation5yo: 'Like playing "hot and cold"! Each guess gets a hint: "turn knob slightly left to get warmer!"'
      },
      afterTraining: {
        status: 'Optimal Learned Parameters',
        whatHappens: 'Weights settle at ideal numerical values. Important features pass through cleanly.',
        explanation5yo: 'Like a grandmaster chef who bakes the perfect cake blindfolded because every knob is set!'
      }
    },
    mathFormula: 'y = \\sum_{i=1}^n (w_i \\cdot x_i), \\quad W_{new} = W_{old} - \\eta \\frac{\\partial L}{\\partial W}',
    codeSnippet: `linear = nn.Linear(512, 1024)
# Backward pass computes gradients: dL/dW
loss.backward()
# Optimizer nudges weights: W = W - lr * grad
optimizer.step()`,
    keyTakeaway: 'Weights determine HOW MUCH influence an input feature has on the final prediction.',
    sandboxType: 'weight-bias'
  },
  {
    id: 'bias',
    name: 'Bias (b)',
    category: 'fundamentals',
    categoryName: 'Foundational Math',
    badge: 'Additive Threshold',
    shortDefinition: 'An independent scalar offset added to the weighted sum, shifting the activation boundary.',
    fiveYearOldSummary: 'A starting head-start bump so the neuron can wake up even when input is zero!',
    whatIsIt: 'Bias is a constant value added to the product of inputs and weights: (W × x) + b. Unlike weights which multiply inputs, bias is added independently of input magnitude.',
    whyIsItNeeded: 'If all inputs x equal zero, W × 0 equals zero! Without bias, a neuron can NEVER fire unless input features are non-zero. Bias shifts decision boundaries.',
    realWorldAnalogy: {
      title: 'Taxicab Starting Meter Base Fee',
      description: 'When you step into a taxicab, even before traveling 1 meter, the meter starts at a base fee (e.g. $3.50). That base fee is the Bias. It sets the baseline before distance miles are calculated.',
      iconName: 'PlusCircle'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Zero or Fixed Offset (b = 0)',
        whatHappens: 'Bias starts at zero or small constant offset.',
        explanation5yo: 'The entry gate is locked shut, so no signal can get through.'
      },
      whileTraining: {
        status: 'Additive Offset Shift',
        whatHappens: 'Backpropagation adjusts bias offset: b_new = b_old - lr * dL/db.',
        explanation5yo: 'Raising or lowering the entry gate height so signals pass through when needed.'
      },
      afterTraining: {
        status: 'Calibrated Threshold Offset',
        whatHappens: 'Bias is tuned so the neuron activates at the exact right confidence threshold.',
        explanation5yo: 'The gate opens at the perfect height every single time!'
      }
    },
    mathFormula: 'z = (w_1 x_1 + w_2 x_2) + b, \\quad b_{new} = b_{old} - \\eta \\frac{\\partial L}{\\partial b}',
    codeSnippet: `linear = nn.Linear(4096, 4096, bias=True)
print(linear.bias.grad) # Gradient w.r.t bias term`,
    keyTakeaway: 'Bias shifts decision boundaries, enabling neurons to fire even when input feature values are zero.',
    sandboxType: 'weight-bias'
  },
  {
    id: 'activation-functions',
    name: 'Activation Functions (ReLU, Sigmoid, Softmax, SwiGLU)',
    category: 'activations',
    categoryName: 'Non-Linearity',
    badge: 'Non-Linear Gate',
    shortDefinition: 'Mathematical functions applied to neuron outputs enabling deep neural networks to learn complex shapes.',
    fiveYearOldSummary: 'Magic doors that decide whether a signal is strong enough to pass through!',
    whatIsIt: 'An activation function is a non-linear operation applied after (Wx + b). Common types include ReLU, Sigmoid, Softmax, SiLU, and SwiGLU.',
    whyIsItNeeded: 'CRITICAL: Without non-linear activation functions, stacking 100 deep layers is mathematically equivalent to 1 single simple linear regression layer!',
    realWorldAnalogy: {
      title: 'Light Dimmer Switches & Pizza Slicers',
      description: 'ReLU acts like a zero-gate light switch: if voltage is negative, light stays OFF (0); if positive, light intensity grows linearly. Softmax divides a pizza pie into percentage slices so all slices add up to 100%.',
      iconName: 'Zap'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Dormant Gates',
        whatHappens: 'Signals pass through randomly or get blocked completely due to dying ReLU states.',
        explanation5yo: 'Doors opening and closing randomly without checking who is outside.'
      },
      whileTraining: {
        status: 'Gradient Flow & Slope Passing',
        whatHappens: 'Gradients flow back through active non-linear derivatives (e.g. d/dx ReLU = 1 for x>0).',
        explanation5yo: 'Teaching the door guards exactly when to open wide and when to stay shut.'
      },
      afterTraining: {
        status: 'Sharp Feature Discriminator',
        whatHappens: 'Activations fire sharply on relevant domain patterns.',
        explanation5yo: 'Super smart doors that open instantly when seeing the right clue!'
      }
    },
    mathFormula: '\\text{ReLU}(x) = \\max(0, x), \\quad \\text{Softmax}(x_i) = \\frac{e^{x_i}}{\\sum e^{x_j}}',
    codeSnippet: `x = F.relu(torch.tensor([-2.0, 0.5, 3.0])) 
# Output: tensor([0.0, 0.5, 3.0])`,
    keyTakeaway: 'Activation functions introduce non-linearity, allowing neural networks to solve complex non-linear problems.',
    sandboxType: 'activation'
  },
  {
    id: 'neuron-perceptron',
    name: 'Artificial Neuron (Perceptron)',
    category: 'fundamentals',
    categoryName: 'Foundational Math',
    badge: 'Core Unit',
    shortDefinition: 'The fundamental building block node combining inputs, weights, bias, and an activation function.',
    fiveYearOldSummary: 'A little brain cell helper that listens to clues and shouts its answer!',
    whatIsIt: 'An artificial neuron receives multiple numeric inputs, multiplies each by its weight, sums them with a bias term, and passes the result through an activation function.',
    whyIsItNeeded: 'Neurons are the atomic computational cells of AI. Billions of interconnected neurons organized in layers form deep networks capable of vision, speech, and language reasoning.',
    realWorldAnalogy: {
      title: 'Court Jury Member Weighing Evidence',
      description: 'A juror listens to 5 pieces of evidence (inputs x). They assign credibility scores (weights w) to each witness. They add their baseline skepticism (bias b). If total evidence exceeds their certainty threshold, they vote "Guilty" (activation output 1).',
      iconName: 'Cpu'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Untrained Perceptron',
        whatHappens: 'Neuron fires randomly regardless of input features.',
        explanation5yo: 'A confused helper shouting random answers!'
      },
      whileTraining: {
        status: 'Weight & Bias Adjustment',
        whatHappens: 'Incoming synapses adjust weight values based on output error gradient.',
        explanation5yo: 'The helper learns to listen carefully to good clues.'
      },
      afterTraining: {
        status: 'Specialized Feature Detector',
        whatHappens: 'Neuron fires reliably when its target pattern (e.g. a cat ear outline) appears.',
        explanation5yo: 'A super expert helper who spots cat ears instantly!'
      }
    },
    mathFormula: 'a = f\\left( \\sum_{i=1}^n w_i x_i + b \\right)',
    codeSnippet: `output = torch.relu(torch.sum(weights * inputs) + bias)`,
    keyTakeaway: 'An artificial neuron aggregates weighted signals, adds bias, and applies non-linear activation.'
  },
  {
    id: 'loss-functions',
    name: 'Loss & Cost Functions (MSE, Cross-Entropy)',
    category: 'optimization',
    categoryName: 'Optimization & Training',
    badge: 'Error Metric',
    shortDefinition: 'A mathematical formula measuring how far model predictions deviate from ground truth target values.',
    fiveYearOldSummary: 'A scorecard that shows how many points off your guess was from the real answer!',
    whatIsIt: 'Loss functions compute a single penalty score comparing predicted outputs ŷ against true labels y. Common types include Mean Squared Error and Cross-Entropy.',
    whyIsItNeeded: 'Loss functions provide the feedback objective signal. Without a loss metric, the neural network has no feedback on whether its predictions are improving or worsening.',
    realWorldAnalogy: {
      title: 'Archery Target Distance Meter',
      description: 'When practicing archery, Loss is the physical distance (in inches) between where your arrow hit the target and the bullseye center. The smaller the loss, the closer you are to perfect accuracy.',
      iconName: 'Target'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'High Loss (Peak Error)',
        whatHappens: 'Prediction error is high (e.g. Loss = 4.85). Model is guessing randomly.',
        explanation5yo: 'Arrow lands far away off the target board!'
      },
      whileTraining: {
        status: 'Loss Reduction Gradient Descent',
        whatHappens: 'Loss decreases steadily across training epochs as backprop updates weights.',
        explanation5yo: 'Arrow gets closer and closer to the bullseye every try!'
      },
      afterTraining: {
        status: 'Minimization (Near Zero Loss)',
        whatHappens: 'Loss reaches global/local minimum (e.g. Loss = 0.02). Model is highly accurate.',
        explanation5yo: 'Bullseye hit almost every single time!'
      }
    },
    mathFormula: '\\text{MSE} = \\frac{1}{N}\\sum (y - \\hat{y})^2, \\quad \\text{CE} = -\\sum y \\log(\\hat{y})',
    codeSnippet: `criterion = nn.CrossEntropyLoss()
loss = criterion(logits, targets)`,
    keyTakeaway: 'Loss functions quantify model error into a single number that guides backpropagation updates.'
  },
  {
    id: 'gradient-descent',
    name: 'Gradient Descent & Backpropagation',
    category: 'optimization',
    categoryName: 'Optimization & Training',
    badge: 'Learning Algorithm',
    shortDefinition: 'Calculates partial derivatives via calculus chain rule to update weights in the direction of lower loss.',
    fiveYearOldSummary: 'The magic trick that teaches the network by fixing its mistakes backwards!',
    whatIsIt: 'Backpropagation computes the gradient derivative of loss with respect to every weight (∂L / ∂W). Gradient descent then nudges each weight slightly in the opposite direction of the slope.',
    whyIsItNeeded: 'This is the exact mathematical engine of machine learning! It transforms a randomly initialized network into an intelligent model.',
    realWorldAnalogy: {
      title: 'Hiker Descending a Mountain in Dense Fog',
      description: 'Imagine standing on a mountain peak in pitch black fog. You want to reach the valley bottom (minimum loss). You feel the slope beneath your feet with your boots (calculating the gradient) and take a step downward (learning rate step). Repeat until reaching the valley floor.',
      iconName: 'TrendingDown'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Zero Gradients',
        whatHappens: 'No backward pass has occurred yet. Weights remain untouched at initial random values.',
        explanation5yo: 'Standing at the top of the mountain before taking any steps.'
      },
      whileTraining: {
        status: 'Active Backprop Gradient Stream',
        whatHappens: 'Gradients flow BACKWARD through every layer via chain rule: dL/dW = dL/dy * dy/dz * dz/dW.',
        explanation5yo: 'Feeling the slope and taking steps down the hill towards the treasure!'
      },
      afterTraining: {
        status: 'Convergence (Gradient ~ 0)',
        whatHappens: 'Gradients approach zero as the loss surface levels out at the minimum.',
        explanation5yo: 'Safely standing at the flat bottom of the valley!'
      }
    },
    mathFormula: 'W_{\\text{new}} = W_{\\text{old}} - \\eta \\cdot \\frac{\\partial L}{\\partial W}',
    codeSnippet: `loss.backward()      # Backpropagation
optimizer.step()     # Gradient descent weight update`,
    keyTakeaway: 'Backpropagation tells every weight which direction and how far to move to reduce prediction mistakes.'
  },
  {
    id: 'normalization',
    name: 'Normalization (LayerNorm, RMSNorm, BatchNorm)',
    category: 'regularization',
    categoryName: 'Signal Stability',
    badge: 'Variance Stabilizer',
    shortDefinition: 'Rescales layer activations to zero mean and unit variance to prevent vanishing/exploding gradients.',
    fiveYearOldSummary: 'A volume leveler so no voice is too loud or too quiet!',
    whatIsIt: 'Normalization layers compute mean and variance across activations or batches and standardize values: (x - μ) / σ.',
    whyIsItNeeded: 'As neural networks grow deeper (50-100+ layers), activation magnitudes can blow up to infinity or drop to zero. Normalization keeps layer distributions stable.',
    realWorldAnalogy: {
      title: 'Podcast Audio Equalizer & Volume Leveler',
      description: 'When listening to a podcast where one speaker whispers while another shouts, an automatic volume leveler dynamically adjusts gain so all voices stay at a comfortable, consistent volume level.',
      iconName: 'Sliders'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Unscaled Signals',
        whatHappens: 'Layer outputs vary wildly in scale.',
        explanation5yo: 'One person shouting while another whispers quietly.'
      },
      whileTraining: {
        status: 'Dynamic Running Mean/Var Updates',
        whatHappens: 'Calculates mean μ and variance σ² across feature channels to normalize activations.',
        explanation5yo: 'Turning down the shouty voices and boosting the whispers.'
      },
      afterTraining: {
        status: 'Unit Variance Stability',
        whatHappens: 'Activations remain within stable unit variance bounds across hundreds of layers.',
        explanation5yo: 'Everyone speaks at the exact same comfortable volume level!'
      }
    },
    mathFormula: '\\text{RMSNorm}(x) = \\frac{x}{\\sqrt{\\frac{1}{d}\\sum x_i^2 + \\epsilon}} \\odot \\gamma',
    codeSnippet: `norm = nn.LayerNorm(4096)
x_normalized = norm(hidden_states)`,
    keyTakeaway: 'Normalization keeps internal layer signals within stable numerical bounds across deep architectures.'
  },
  {
    id: 'dropout',
    name: 'Dropout & Regularization',
    category: 'regularization',
    categoryName: 'Signal Stability',
    badge: 'Overfitting Prevention',
    shortDefinition: 'Randomly sets a fraction of neuron activations to zero during training to enforce redundant learning.',
    fiveYearOldSummary: 'Benching star players during practice so everyone learns to play well!',
    whatIsIt: 'Dropout is a regularization technique that randomly deactivates a percentage p (e.g. 20% or 50%) of neurons during each training forward pass.',
    whyIsItNeeded: 'Without dropout, neural networks often memorize training data (overfitting) by relying on fragile co-adaptations between specific neurons.',
    realWorldAnalogy: {
      title: 'Soccer Team Bench Rotation',
      description: 'A soccer coach randomly benches 3 star players during practice matches. This forces all remaining players to take initiative and build team resilience, preventing the team from relying single-handedly on one star player.',
      iconName: 'Shuffle'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Inactive (Dropout Disabled)',
        whatHappens: 'All neurons active during initial setup.',
        explanation5yo: 'All players standing on the field together.'
      },
      whileTraining: {
        status: 'Active Random Zeroing (Mask p=0.2)',
        whatHappens: 'Random binary mask zeroes out 20% of neurons on each forward pass.',
        explanation5yo: 'Coach randomly calling players to sit on the bench for a few minutes.'
      },
      afterTraining: {
        status: 'Scaled Inference (Dropout Disabled)',
        whatHappens: 'Dropout is TURNED OFF during evaluation! All neurons participate, scaled by (1 - p).',
        explanation5yo: 'Game day! All players play together as a super resilient team!'
      }
    },
    mathFormula: '\\text{Dropout}(x_i) = \\begin{cases} 0 & \\text{with prob } p \\\\ \\frac{x_i}{1-p} & \\text{with prob } 1-p \\end{cases}',
    codeSnippet: `model.train() # Dropout ACTIVE
output = model(inputs)
model.eval()  # Dropout DISABLED for evaluation!`,
    keyTakeaway: 'Dropout prevents memorization by forcing neural network layers to build redundant, robust representations.'
  },
  {
    id: 'vector-embeddings',
    name: 'Vector Embeddings & Latent Space',
    category: 'representation',
    categoryName: 'Data Representation',
    badge: 'Geometric Coordinate Space',
    shortDefinition: 'Maps discrete symbols into dense continuous vector spaces where semantic similarity equals geometric distance.',
    fiveYearOldSummary: 'Giving every word its own map coordinates so similar words sit close together!',
    whatIsIt: 'Embeddings convert discrete identifiers (e.g. word token ID #3421) into dense multi-dimensional vector arrays (e.g. 4096 floating point numbers).',
    whyIsItNeeded: 'Computers cannot calculate math on raw text words like "king" or "apple". Embeddings translate human concepts into geometric vector space.',
    realWorldAnalogy: {
      title: 'GPS City Coordinates on a Globe',
      description: 'Cities on a map have GPS coordinates (lat, long). Nearby cities like Paris and London have close coordinates, while Paris and Tokyo are far apart. Vector embeddings place semantically similar words ("king", "queen") close together in 4096-dimensional space!',
      iconName: 'Compass'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Random Vector Locations',
        whatHappens: 'Word vectors are placed at random locations in coordinate space.',
        explanation5yo: 'Words scattered randomly all over the map!'
      },
      whileTraining: {
        status: 'Representation Learning Shifts',
        whatHappens: 'Backpropagation pulls semantically related word vectors closer together and pushes unrelated words apart.',
        explanation5yo: 'Pulling "cat" and "dog" together while pushing "banana" away!'
      },
      afterTraining: {
        status: 'Structured Latent Space Galaxy',
        whatHappens: 'Embeddings form clear semantic clusters (e.g. King - Man + Woman = Queen).',
        explanation5yo: 'A beautiful star map where all animal words sit together in one constellation!'
      }
    },
    mathFormula: '\\vec{v}_{King} - \\vec{v}_{Man} + \\vec{v}_{Woman} \\approx \\vec{v}_{Queen}',
    codeSnippet: `embedding = nn.Embedding(128256, 4096)
word_vecs = embedding(token_ids)`,
    keyTakeaway: 'Embeddings project words and images into continuous geometric space where distance represents semantic similarity.'
  },
  {
    id: 'qkv-attention',
    name: 'Query, Key, Value (QKV) Attention',
    category: 'representation',
    categoryName: 'Data Representation',
    badge: 'Context Synthesizer',
    shortDefinition: 'Dynamic weighting mechanism computing relevance scores between sequence tokens.',
    fiveYearOldSummary: 'A smart spotlight that shines light on the most important words in a sentence!',
    whatIsIt: 'Multi-Head Attention splits token embeddings into Queries (what token searches for), Keys (what token contains), and Values (information passed forward).',
    whyIsItNeeded: 'In long text, the word "it" in "The animal didn\'t cross the street because it was too tired" refers to "animal", not "street". QKV attention links context.',
    realWorldAnalogy: {
      title: 'YouTube Search Bar, Video Titles & Video Content',
      description: 'Query (Q) is what you type into YouTube search bar. Key (K) is the title/tags of every video on YouTube. The search engine computes dot-product similarity between Q and K. High matching videos return their Value (V) video playback content to your screen!',
      iconName: 'Search'
    },
    trainingPhases: {
      beforeTraining: {
        status: 'Uniform / Random Attention',
        whatHappens: 'Attention heads assign random weights across all tokens.',
        explanation5yo: 'A noisy spotlight shining everywhere at once without focusing.'
      },
      whileTraining: {
        status: 'Attention Map Specialization',
        whatHappens: 'Projection matrices W_Q, W_K, W_V learn specialized contextual relationships across 32 heads.',
        explanation5yo: 'Teaching the spotlight to follow the main character in the play.'
      },
      afterTraining: {
        status: 'Sharp Contextual Alignment',
        whatHappens: 'Attention maps assign precise affinity weights between dependent tokens.',
        explanation5yo: 'The spotlight shines brightly on the exact word that explains the secret clue!'
      }
    },
    mathFormula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V',
    codeSnippet: `attn_scores = F.softmax((Q @ K.transpose(-2, -1)) / (d_k ** 0.5), dim=-1)
output = attn_scores @ V`,
    keyTakeaway: 'QKV Attention calculates pairwise contextual relevance between every token pair in parallel.'
  }
];
