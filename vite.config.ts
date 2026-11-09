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
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          postprocessing: ['@react-three/postprocessing'],
          katex: ['katex'],
          ui: ['react', 'react-dom', 'framer-motion', 'zustand', 'zod'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
});
