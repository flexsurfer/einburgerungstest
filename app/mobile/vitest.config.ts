import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../../packages/shared/src'),
      'react-native': path.resolve(__dirname, './test/mocks/react-native.ts'),
    },
  },
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts']
  }
}) 