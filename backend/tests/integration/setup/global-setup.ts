import { execSync } from 'node:child_process'

export async function setup(): Promise<void> {
  const testDb = process.env.TEST_DATABASE_URL
  if (!testDb) {
    throw new Error('TEST_DATABASE_URL não está definida. Configure o .env.test antes de rodar os testes de integração.')
  }

  console.log('🔧 Aplicando migrations no banco de teste...')
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDb },
    stdio: 'inherit',
  })
  console.log('✅ Banco de teste pronto.')
}

export async function teardown(): Promise<void> {
  // Nothing to tear down — Docker container lifecycle handles DB reset
}
