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
    // Todos os specs de integração compartilham o mesmo banco Postgres de teste
    // (docker-compose.test.yml) e cada arquivo faz truncateAll() no beforeEach.
    // Com múltiplos forks, dois arquivos podem rodar ao mesmo tempo e um
    // truncateAll() de um arquivo apaga dados que o outro está usando no meio
    // do teste (FK violations, "registro não encontrado" intermitentes).
    // singleFork força todos os specs a rodar em série, num processo só.
    poolOptions: {
      forks: { singleFork: true },
    },
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
