import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'
import { GetProdutoUseCase } from '@/modules/produtos/application/use-cases/get-produto.use-case'

// Cobertura de specs/produtos/spec-v2.md: faseDaVida/porte/sabor são campos novos,
// opcionais, aceitos pelo backend para qualquer categoria (a restrição a "Ração" é
// só de UX no frontend), e precisam sobreviver a um round-trip real via Prisma.
describe('Produto — persistência de faseDaVida/porte/sabor', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('persiste e recupera os 3 campos via save()/toDomain() (round-trip real no Postgres)', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const criado = await createUC.execute({
      nome: 'Golden Fórmula Cão Adulto PORTE Pequeno SABOR Frango e Arroz 15kg',
      categoria: 'Ração',
      especie: 'Cão',
      faseDaVida: 'Adulto',
      porte: 'Pequeno',
      sabor: 'Frango e Arroz',
      valorVenda: 140,
    })

    expect(criado.faseDaVida).toBe('Adulto')
    expect(criado.porte).toBe('Pequeno')
    expect(criado.sabor).toBe('Frango e Arroz')

    // Relê com uma instância independente, sem estado em memória compartilhado,
    // pra provar que persistiu de fato no banco.
    const repoIndependente = new PrismaProdutoRepository(prismaTest)
    const getIndependente = new GetProdutoUseCase(repoIndependente)
    const relido = await getIndependente.execute({ id: criado.id })

    expect(relido.faseDaVida).toBe('Adulto')
    expect(relido.porte).toBe('Pequeno')
    expect(relido.sabor).toBe('Frango e Arroz')

    const row = await prismaTest.produto.findUnique({ where: { id: criado.id } })
    expect(row!.faseDaVida).toBe('Adulto')
    expect(row!.porte).toBe('Pequeno')
    expect(row!.sabor).toBe('Frango e Arroz')
  })

  it('ficam null quando não enviados no create', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const criado = await createUC.execute({ nome: 'Petisco Simples', categoria: 'Petisco', valorVenda: 20 })

    const row = await prismaTest.produto.findUnique({ where: { id: criado.id } })
    expect(row!.faseDaVida).toBeNull()
    expect(row!.porte).toBeNull()
    expect(row!.sabor).toBeNull()
  })

  it('update() altera um dos campos sem afetar os outros já salvos', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)
    const updateUC = new UpdateProdutoUseCase(repo)

    const criado = await createUC.execute({
      nome: 'Ração X', categoria: 'Ração', valorVenda: 100,
      faseDaVida: 'Filhote', porte: 'Médio', sabor: 'Carne',
    })

    await updateUC.execute({ id: criado.id, porte: 'Grande' })

    const row = await prismaTest.produto.findUnique({ where: { id: criado.id } })
    expect(row!.porte).toBe('Grande')
    expect(row!.faseDaVida).toBe('Filhote')
    expect(row!.sabor).toBe('Carne')
  })
})
