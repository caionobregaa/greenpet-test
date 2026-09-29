import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { DeleteProdutoUseCase } from '@/modules/produtos/application/use-cases/delete-produto.use-case'

// Cobertura de specs/produtos/spec-v4.md: busca `q` por palavras em qualquer ordem e
// posição, sem acento/caixa, em nome, marca, subCategoria, SKU (hífen opcional) e
// código de barras.
describe('Produto — busca por SKU e por palavras em qualquer ordem', () => {
  const FRANGO = 'FN Fresh Meat Cão Adulto PORTE Mini e Pequeno SABOR Frango 10.1kg'
  let repo: PrismaProdutoRepository
  let skuFrango: string

  async function buscar(q: string): Promise<string[]> {
    const { produtos } = await repo.findMany({ q, page: 1, limit: 50 })
    return produtos.map((p) => p.nome)
  }

  beforeEach(async () => {
    await truncateAll()
    repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)
    const frango = await createUC.execute({
      nome: FRANGO, categoria: 'Ração', marca: 'Fórmula Natural', valorVenda: 366,
      codigoBarras: '7896183312345',
    })
    skuFrango = frango.sku
    await createUC.execute({ nome: 'FN Fresh Meat Cão Adulto SABOR Salmão 10.1kg', categoria: 'Ração', valorVenda: 366 })
    await createUC.execute({ nome: 'Tapete Higiênico 100% absorvente', categoria: 'Higiene', valorVenda: 50 })
    await createUC.execute({ nome: 'Tapete Higiênico 1000 unidades', categoria: 'Higiene', valorVenda: 80 })
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('encontra pelo SKU completo, sem hífen e por parte do número', async () => {
    const numero = skuFrango.split('-')[1]
    expect(await buscar(skuFrango)).toEqual([FRANGO])
    expect(await buscar(skuFrango.replace('-', '').toLowerCase())).toEqual([FRANGO])
    expect(await buscar(numero)).toContain(FRANGO)
  })

  it('encontra por palavras fora de ordem e exige todas elas', async () => {
    expect(await buscar('fresh frango')).toEqual([FRANGO])
    expect(await buscar('frango fresh')).toEqual([FRANGO])
    expect(await buscar('fresh salmao')).not.toContain(FRANGO)
  })

  it('encontra por palavra no meio do nome, sem acento e sem diferenciar caixa', async () => {
    expect(await buscar('meat')).toContain(FRANGO)
    expect(await buscar('CAO pequeno')).toEqual([FRANGO])
  })

  it('combina palavra do nome com a marca', async () => {
    expect(await buscar('formula frango')).toEqual([FRANGO])
  })

  it('encontra por parte do código de barras', async () => {
    expect(await buscar('312345')).toEqual([FRANGO])
  })

  it('trata % digitado como texto, não como curinga', async () => {
    expect(await buscar('100%')).toEqual(['Tapete Higiênico 100% absorvente'])
  })

  it('não retorna produto excluído', async () => {
    const [frango] = (await repo.findMany({ q: skuFrango, page: 1, limit: 1 })).produtos
    await new DeleteProdutoUseCase(repo).execute({ id: frango.id })
    expect(await buscar(skuFrango)).toEqual([])
  })
})
