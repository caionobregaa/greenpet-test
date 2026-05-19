import { PrismaClient } from '@prisma/client'

const testDb = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL

if (!testDb) {
  throw new Error('TEST_DATABASE_URL não está definida')
}

export const prismaTest = new PrismaClient({ datasources: { db: { url: testDb } } })

export async function truncateAll(): Promise<void> {
  // Delete in reverse FK dependency order
  await prismaTest.$transaction([
    prismaTest.orcamentoItem.deleteMany(),
    prismaTest.orcamento.deleteMany(),
    prismaTest.vendaItem.deleteMany(),
    prismaTest.venda.deleteMany(),
    prismaTest.compraItem.deleteMany(),
    prismaTest.compra.deleteMany(),
    prismaTest.animal.deleteMany(),
    prismaTest.produto.deleteMany(),
    prismaTest.cliente.deleteMany(),
    prismaTest.refreshToken.deleteMany(),
    prismaTest.user.deleteMany(),
  ])
}
