import { defineConfig } from 'vitest/config'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts']
  }
}) 