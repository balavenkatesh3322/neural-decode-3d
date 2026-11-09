import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: { format: 'es' },
  build: {
    rollupOptions: {
      output: {
        // Vendor chunks with a strict one-way dependency order:
        //   react  ←  three  ←  r3f  ←  postprocessing
        // React and its runtime helpers must live together in a chunk that imports nothing
        // else; otherwise chunks can import each other in a cycle and the 3D renderer may
        // execute before React is initialised ("Cannot read … __SECRET_INTERNALS…").
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const m = (re: RegExp) => re.test(id.replace(/\\/g, '/'));
          if (m(/node_modules\/(react|react-dom|scheduler|use-sync-external-store|zustand)\//)) return 'react';
          if (m(/node_modules\/three\//)) return 'three';
          if (m(/node_modules\/(@react-three\/postprocessing|postprocessing|n8ao)\//)) return 'postprocessing';
          if (m(/node_modules\/(@react-three\/(fiber|drei)|react-reconciler|its-fine|suspend-react|three-stdlib|camera-controls|three-mesh-bvh|troika-[^/]+|bidi-js|webgl-sdf-generator|meshline|maath|@monogrid|stats-gl|stats\.js|detect-gpu|hls\.js|@use-gesture|react-use-measure|debounce|tunnel-rat|zustand-r3f|glsl-noise|@mediapipe)\//)) return 'r3f';
          if (m(/node_modules\/katex\//)) return 'katex';
          if (m(/node_modules\/(framer-motion|motion-dom|motion-utils)\//)) return 'motion';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
});
