import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'unit',
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/**/*.schema.ts',
        'src/**/index.ts',
        'src/shared/infrastructure/env/env.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
