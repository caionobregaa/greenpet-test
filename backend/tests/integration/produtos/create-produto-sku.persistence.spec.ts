import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'

// Cobertura da regra de negócio: todo produto ganha um SKU único gerado pelo
// backend a partir da categoria (migration add_produto_sku), sequencial dentro
// de cada categoria, e o SKU nunca muda depois de atribuído.
describe('Produto — geração de SKU por categoria', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('gera SKUs sequenciais dentro da mesma categoria', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const p1 = await createUC.execute({ nome: 'Ração A', categoria: 'Ração', valorVenda: 100 })
    const p2 = await createUC.execute({ nome: 'Ração B', categoria: 'Ração', valorVenda: 100 })
    const p3 = await createUC.execute({ nome: 'Ração C', categoria: 'Ração', valorVenda: 100 })

    expect(p1.sku).toMatch(/^RAC-\d{4}$/)
    expect(p2.sku).toMatch(/^RAC-\d{4}$/)
    expect(p3.sku).toMatch(/^RAC-\d{4}$/)
    expect(new Set([p1.sku, p2.sku, p3.sku]).size).toBe(3)
  })

  it('categorias diferentes têm sequências independentes e prefixos distintos', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)

    const racao = await createUC.execute({ nome: 'Ração X', categoria: 'Ração', valorVenda: 100 })
    const petisco = await createUC.execute({ nome: 'Petisco X', categoria: 'Petisco', valorVenda: 20 })
    const medicamento = await createUC.execute({ nome: 'Medicamento X', categoria: 'Medicamento', valorVenda: 50 })

    expect(racao.sku.startsWith('RAC-')).toBe(true)
    expect(petisco.sku.startsWith('PET-')).toBe(true)
    expect(medicamento.sku.startsWith('MED-')).toBe(true)
  })

  it('o SKU não muda quando a categoria do produto é atualizada depois', async () => {
    const repo = new PrismaProdutoRepository(prismaTest)
    const createUC = new CreateProdutoUseCase(repo)
    const updateUC = new UpdateProdutoUseCase(repo)

    const criado = await createUC.execute({ nome: 'Item Versátil', categoria: 'Petisco', valorVenda: 20 })
    const skuOriginal = criado.sku

    const atualizado = await updateUC.execute({ id: criado.id, categoria: 'Suplemento' })

    expect(atualizado.categoria).toBe('Suplemento')
    expect(atualizado.sku).toBe(skuOriginal)

    const row = await prismaTest.produto.findUnique({ where: { id: criado.id } })
    expect(row!.sku).toBe(skuOriginal)
  })
})
