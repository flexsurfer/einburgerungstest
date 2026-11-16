import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@ebtest/shared': path.resolve(__dirname, '../shared/src'),
      'react-native': path.resolve(__dirname, './test/mocks/react-native.ts'),
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname, './test/mocks/async-storage.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
