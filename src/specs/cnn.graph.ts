import type { GraphSpec } from '../engine/spec/schema';

/**
 * ResNet-50 (v1.5). Stage 1's first bottleneck block is shown op-by-op so the
 * residual shortcut is visible; the rest of each stage is a composite node.
 */
export const cnnGraph: GraphSpec = {
  config: {
    B: 1,
    H: 224,
    W: 224,
    classes: 1000,
  },
  controls: [
    { key: 'H', label: 'Image height', min: 64, max: 512, options: [64, 128, 224, 320, 448, 512] },
    { key: 'W', label: 'Image width', min: 64, max: 512, options: [64, 128, 224, 320, 448, 512] },
    { key: 'classes', label: 'Classes', min: 2, max: 21843, options: [2, 10, 100, 1000, 21843] },
  ],
  groups: [
    { id: 'stem', label: 'Stem', color: '#6C9BD2' },
    { id: 'stage1', label: 'Stage 1 · 3 blocks', color: '#5C86C4' },
    { id: 'block1', label: 'Bottleneck block (expanded)', parent: 'stage1', color: '#5C86C4' },
  ],
  nodes: [
    { id: 'img', op: 'input', label: 'RGB image', params: { shape: ['B', 3, 'H', 'W'] }, content: 'cnn-input-image' },
    { id: 'conv1', op: 'conv2d', label: 'Conv 7×7 /2', params: { out: 64, k: 7, stride: 2, pad: 3, bn: true }, group: 'stem', content: 'cnn-conv1-stem' },
    { id: 'relu1', op: 'activation', label: 'ReLU', group: 'stem' },
    { id: 'maxpool', op: 'pool', label: 'MaxPool 3×3 /2', params: { kind: 'max', k: 3, stride: 2, pad: 1 }, group: 'stem' },
    { id: 'b_reduce', op: 'conv2d', label: 'Conv 1×1 (reduce)', params: { out: 64, k: 1, bn: true }, group: 'block1' },
    { id: 'b_conv', op: 'conv2d', label: 'Conv 3×3', params: { out: 64, k: 3, bn: true }, group: 'block1', content: 'cnn-bottleneck-block' },
    { id: 'b_expand', op: 'conv2d', label: 'Conv 1×1 (expand)', params: { out: 256, k: 1, bn: true }, group: 'block1' },
    { id: 'b_proj', op: 'conv2d', label: 'Projection 1×1', params: { out: 256, k: 1, bn: true }, group: 'block1' },
    { id: 'b_add', op: 'add', label: 'F(x) + x', group: 'block1', content: 'cnn-residual-skip' },
    { id: 'stage1_rest', op: 'resnet_stage', label: '2 more blocks', params: { mid: 64, out: 256, blocks: 2 }, group: 'stage1' },
    { id: 'stage2', op: 'resnet_stage', label: 'Stage 2 · 4 blocks', params: { mid: 128, out: 512, blocks: 4, stride: 2 } },
    { id: 'stage3', op: 'resnet_stage', label: 'Stage 3 · 6 blocks', params: { mid: 256, out: 1024, blocks: 6, stride: 2 } },
    { id: 'stage4', op: 'resnet_stage', label: 'Stage 4 · 3 blocks', params: { mid: 512, out: 2048, blocks: 3, stride: 2 } },
    { id: 'gap', op: 'pool', label: 'Global Avg Pool', params: { kind: 'global' }, content: 'cnn-global-pool' },
    { id: 'flatten', op: 'flatten', label: 'Flatten' },
    { id: 'fc', op: 'linear', label: 'FC → classes', params: { out: 'classes', bias: true }, content: 'cnn-fc-classifier' },
    { id: 'probs', op: 'softmax', label: 'Class probabilities' },
  ],
  edges: [
    { from: 'img', to: 'conv1' },
    { from: 'conv1', to: 'relu1' },
    { from: 'relu1', to: 'maxpool' },
    { from: 'maxpool', to: 'b_reduce' },
    { from: 'b_reduce', to: 'b_conv' },
    { from: 'b_conv', to: 'b_expand' },
    { from: 'maxpool', to: 'b_proj', kind: 'residual' },
    { from: 'b_expand', to: 'b_add' },
    { from: 'b_proj', to: 'b_add', kind: 'residual' },
    { from: 'b_add', to: 'stage1_rest' },
    { from: 'stage1_rest', to: 'stage2' },
    { from: 'stage2', to: 'stage3' },
    { from: 'stage3', to: 'stage4' },
    { from: 'stage4', to: 'gap' },
    { from: 'gap', to: 'flatten' },
    { from: 'flatten', to: 'fc' },
    { from: 'fc', to: 'probs' },
  ],
};
