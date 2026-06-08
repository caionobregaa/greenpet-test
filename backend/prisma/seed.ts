import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedProdutos } from './seed-produtos'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Seeding banco de dados...')

  const senhaHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@greenpet.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@greenpet.com',
      senhaHash,
      papel: 'admin',
    },
  })
  console.log('✅ Usuário admin criado: admin@greenpet.com / admin123')

  await seedProdutos(prisma)
  console.log('✅ Seed concluído.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
