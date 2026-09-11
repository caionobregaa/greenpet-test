import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'
import { GetProdutoUseCase } from '@/modules/produtos/application/use-cases/get-produto.use-case'

// Regression coverage for a bug reported in produção: ao editar um produto mais de
// uma vez, a UI voltava a mostrar um valor antigo em vez da última alteração salva.
// Este teste vai direto no banco de dados real (Postgres de teste), sem mocks e sem
// nenhum cache do frontend no caminho, para garantir que a camada de persistência
// em si guarda de fato a ÚLTIMA alteração feita — não uma anterior.
describe('Produto — persistência da última alteração', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('mantém os valores da última edição após múltiplas alterações em sequência', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)
    const updateUC = new UpdateProdutoUseCase(repo)
    const getUC = new GetProdutoUseCase(repo)

    const criado = await createUC.execute({
      nome: 'Ração Golden Adulto',
      categoria: 'Ração',
      valorCusto: 80,
      valorVenda: 120,
      descricao: 'Versão original',
    })

    // 1ª edição
    await updateUC.execute({
      id: criado.id,
      valorVenda: 135,
      descricao: 'Primeira edição',
    })

    // 2ª edição (deveria prevalecer sobre a primeira)
    await updateUC.execute({
      id: criado.id,
      valorVenda: 150,
      descricao: 'Segunda edição',
    })

    // 3ª edição — a última — mudando também nome e categoria
    await updateUC.execute({
      id: criado.id,
      nome: 'Ração Golden Adulto 15kg',
      categoria: 'Ração',
      valorCusto: 95,
      valorVenda: 179.9,
      descricao: 'Edição final',
    })

    // Relê usando uma NOVA instância de repositório (sem nenhum estado em memória
    // compartilhado com o use case que fez o update) para provar que o dado
    // persistiu de fato no banco, e não apenas no objeto em memória.
    const repoIndependente = new PrismaProdutoRepository(prismaTest)
    const getIndependente = new GetProdutoUseCase(repoIndependente)
    const final = await getIndependente.execute({ id: criado.id })

    expect(final.nome).toBe('Ração Golden Adulto 15kg')
    expect(final.valorCusto).toBe(95)
    expect(final.valorVenda).toBe(179.9)
    expect(final.descricao).toBe('Edição final')

    // Garante que nenhum valor das edições intermediárias "vazou" de volta
    expect(final.valorVenda).not.toBe(135)
    expect(final.valorVenda).not.toBe(150)
    expect(final.descricao).not.toBe('Primeira edição')
    expect(final.descricao).not.toBe('Segunda edição')

    // O caminho do use case original também deve refletir o mesmo estado final
    const viaUseCaseOriginal = await getUC.execute({ id: criado.id })
    expect(viaUseCaseOriginal.valorVenda).toBe(179.9)
    expect(viaUseCaseOriginal.descricao).toBe('Edição final')
  })

  it('persiste a última alteração mesmo lendo direto da tabela via Prisma (sem passar pelo domínio)', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)
    const updateUC = new UpdateProdutoUseCase(repo)

    const criado = await createUC.execute({
      nome: 'Petisco Bifinho',
      categoria: 'Petisco',
      valorVenda: 10,
    })

    await updateUC.execute({ id: criado.id, valorVenda: 12 })
    await updateUC.execute({ id: criado.id, valorVenda: 14.5 })

    const row = await prismaTest.produto.findUnique({ where: { id: criado.id } })

    expect(row).not.toBeNull()
    expect(Number(row!.valorVenda)).toBe(14.5)
    expect(row!.updatedAt.getTime()).toBeGreaterThan(row!.createdAt.getTime())
  })
})
