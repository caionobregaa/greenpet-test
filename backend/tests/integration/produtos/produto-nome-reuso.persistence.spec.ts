import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'
import { DeleteProdutoUseCase } from '@/modules/produtos/application/use-cases/delete-produto.use-case'

// Cobertura de specs/produtos/rules.md: nome é único só entre produtos ativos. O índice
// único global antigo contava excluídos e o banco rejeitava (P2002) um nome que a
// checagem do use case — que já ignora excluídos — tinha deixado passar.
describe('Produto — reuso do nome de produto excluído', () => {
  const NOME = 'FN Fresh Meat Cão Adulto PORTE Mini e Pequeno SABOR Frango 10.1kg'

  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('renomeia um produto para o nome de um produto excluído', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const excluido = await createUC.execute({ nome: NOME, categoria: 'Ração', valorVenda: 366 })
    await new DeleteProdutoUseCase(repo).execute({ id: excluido.id })

    const outro = await createUC.execute({ nome: 'FN Fresh Meat Cão Adulto 10.1kg', categoria: 'Ração', valorVenda: 366 })
    await new UpdateProdutoUseCase(repo).execute({ id: outro.id, nome: NOME })

    const row = await prismaTest.produto.findUnique({ where: { id: outro.id } })
    expect(row!.nome).toBe(NOME)
  })

  it('cria um produto novo com o nome de um produto excluído', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const excluido = await createUC.execute({ nome: NOME, categoria: 'Ração', valorVenda: 366 })
    await new DeleteProdutoUseCase(repo).execute({ id: excluido.id })

    const novo = await createUC.execute({ nome: NOME, categoria: 'Ração', valorVenda: 366 })

    expect(novo.id).not.toBe(excluido.id)
    expect(await prismaTest.produto.count({ where: { nome: NOME } })).toBe(2)
  })

  it('continua bloqueando dois produtos ativos com o mesmo nome no banco', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    await new CreateProdutoUseCase(repo).execute({ nome: NOME, categoria: 'Ração', valorVenda: 366 })

    await expect(
      prismaTest.produto.create({ data: { nome: NOME, sku: 'RAC-9999', categoria: 'Ração', valorVenda: 366 } }),
    ).rejects.toMatchObject({ code: 'P2002' })
  })
})
