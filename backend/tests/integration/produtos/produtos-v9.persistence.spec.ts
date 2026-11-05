import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'
import { PrismaCatalogoRepository } from '@/modules/catalogo/infrastructure/repositories/prisma-catalogo.repository'
import { ListarCatalogoUseCase } from '@/modules/catalogo/application/use-cases/listar-catalogo.use-case'

// specs/produtos/spec-v9.md e specs/catalogo/spec-v2.md no banco real
describe('Produtos v9 — persistência', () => {
  const repo = new PrismaProdutoRepository(prismaTest)
  const criar = new CreateProdutoUseCase(repo)
  const atualizar = new UpdateProdutoUseCase(repo)
  const nomes = async (f: Parameters<typeof repo.findMany>[0]) => (await repo.findMany(f)).produtos.map((p) => p.nome).sort()

  beforeEach(truncateAll)
  afterAll(() => prismaTest.$disconnect())

  it('Ração Úmida gera SKU RUM pela sequence própria', async () => {
    const p = await criar.execute({ nome: 'Sachê Gato 85g', categoria: 'Ração Úmida', valorVenda: 5 })
    expect(p.sku).toMatch(/^RUM-\d{4}$/)
  })

  it('cadastro e edição trocam FN por Fórmula Natural e acusam nome repetido', async () => {
    const p = await criar.execute({ nome: 'FN Fresh Meat 12kg', categoria: 'Ração', valorVenda: 300 })
    expect(p.nome).toBe('Fórmula Natural Fresh Meat 12kg')
    await expect(criar.execute({ nome: 'Fórmula Natural Fresh Meat 12kg', categoria: 'Ração', valorVenda: 1 })).rejects.toThrow('já existe')
    const petisco = await criar.execute({ nome: 'FN Life Petisco', categoria: 'Petisco', valorVenda: 10 })
    expect(petisco.nome).toBe('FN Life Petisco')
    const editado = await atualizar.execute({ id: petisco.id, categoria: 'Ração' })
    expect(editado.nome).toBe('Fórmula Natural Life Petisco')
    const mesmo = await atualizar.execute({ id: p.id, nome: 'FN Fresh Meat 12kg', valorVenda: 310 })
    expect(mesmo.nome).toBe('Fórmula Natural Fresh Meat 12kg')
  })

  it('filtro de categoria inclui as adicionais, com e sem busca, e grava a lista', async () => {
    await criar.execute({ nome: 'Ração Mista', categoria: 'Ração', valorVenda: 10, categoriasAdicionais: ['Ração Úmida'] })
    await criar.execute({ nome: 'Sachê Puro', categoria: 'Ração Úmida', valorVenda: 5 })
    await criar.execute({ nome: 'Ração Seca', categoria: 'Ração', valorVenda: 10 })
    expect(await nomes({ categoria: 'Ração Úmida', page: 1, limit: 10 })).toEqual(['Ração Mista', 'Sachê Puro'])
    expect(await nomes({ categoria: 'Ração Úmida', q: 'mista', page: 1, limit: 10 })).toEqual(['Ração Mista'])
    const salvo = (await repo.findMany({ q: 'Mista', page: 1, limit: 1 })).produtos[0]
    expect(salvo.categoriasAdicionais).toEqual(['Ração Úmida'])
  })

  it('filtro de ocultos mostra só os ocultos, com e sem busca', async () => {
    const a = await criar.execute({ nome: 'Oculto A', categoria: 'Higiene', valorVenda: 10 })
    await criar.execute({ nome: 'Visível B', categoria: 'Higiene', valorVenda: 10 })
    await atualizar.execute({ id: a.id, ocultarCatalogo: true })
    expect(await nomes({ ocultos: true, page: 1, limit: 10 })).toEqual(['Oculto A'])
    expect(await nomes({ ocultos: true, q: 'oculto', page: 1, limit: 10 })).toEqual(['Oculto A'])
    expect(await nomes({ ocultos: false, page: 1, limit: 10 })).toEqual(['Visível B'])
  })

  it('catálogo traz marca e as categorias publicadas', async () => {
    await criar.execute({ nome: 'Ração Mista', categoria: 'Ração', marca: 'Golden', valorVenda: 10, categoriasAdicionais: ['Ração Úmida', 'Serviço'] })
    const [p] = await new ListarCatalogoUseCase(new PrismaCatalogoRepository(prismaTest)).execute()
    expect(p).toMatchObject({ marca: 'Golden', categorias: ['Ração', 'Ração Úmida'] })
  })
})
