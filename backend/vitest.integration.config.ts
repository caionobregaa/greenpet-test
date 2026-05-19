import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'integration',
    include: ['tests/integration/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    globalSetup: ['tests/integration/setup/global-setup.ts'],
    teardownTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: false },
    },
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
