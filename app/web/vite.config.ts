/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/app/web',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  publicDir: path.resolve(__dirname, '../../app/mobile/assets'),
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.jsx']
  },
}));
