/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const projectRoot = import.meta.dirname;

export default defineConfig(() => ({
  root: projectRoot,
  cacheDir: '../../node_modules/.vite/app/web',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(),
  viteStaticCopy({
    targets: [
      {
        src: path.resolve(projectRoot, '../../packages/mobile-app/assets'),
        dest: 'assets',
        rename: {
          stripBase: true
        }
      }
    ]
  })
  ],
  resolve: {
    alias: {
      '@ebtest/shared': path.resolve(projectRoot, '../../packages/shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(projectRoot, 'index.html'),
        app: path.resolve(projectRoot, 'app/index.html'),
      }
    },
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.jsx']
  },
}));
