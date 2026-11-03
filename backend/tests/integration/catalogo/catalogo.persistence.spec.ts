import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaCatalogoRepository } from '@/modules/catalogo/infrastructure/repositories/prisma-catalogo.repository'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { UpdateProdutoUseCase } from '@/modules/produtos/application/use-cases/update-produto.use-case'
import { DeleteProdutoUseCase } from '@/modules/produtos/application/use-cases/delete-produto.use-case'

// specs/catalogo/rules.md: quem entra no catálogo. specs/produtos/spec-v7.md: caixa de ocultar.
describe('Catálogo — persistência', () => {
  const JPEG = 'data:image/jpeg;base64,Zm90bw=='
  const catalogo = new PrismaCatalogoRepository(prismaTest)
  const produtos = new PrismaProdutoRepository(prismaTest)
  const criar = new CreateProdutoUseCase(produtos)

  const nomes = async () => (await catalogo.listar()).map((p) => p.nome)

  beforeEach(truncateAll)
  afterAll(() => prismaTest.$disconnect())

  it('produto novo entra sozinho, com o preço como número, e sem depender de estoque', async () => {
    await criar.execute({ nome: 'Ração X', categoria: 'Ração', valorVenda: 189.9, especie: 'Cão' })
    const [produto] = await catalogo.listar()
    expect(produto).toMatchObject({ nome: 'Ração X', categoria: 'Ração', especie: 'Cão', valorVenda: 189.9, temImagem: false })
    expect(produto.atualizadoEm).toBeInstanceOf(Date)
  })

  it('ordena por nome e deixa Serviço de fora', async () => {
    await criar.execute({ nome: 'Banho', categoria: 'Serviço', valorVenda: 50 })
    await criar.execute({ nome: 'Petisco B', categoria: 'Petisco', valorVenda: 10 })
    await criar.execute({ nome: 'Antipulgas A', categoria: 'Medicamento', valorVenda: 30 })
    expect(await nomes()).toEqual(['Antipulgas A', 'Petisco B'])
  })

  it('excluído sai da lista e a foto deixa de ser encontrada', async () => {
    const p = await criar.execute({ nome: 'Ração X', categoria: 'Ração', valorVenda: 10, imagemUrl: JPEG })
    expect(await catalogo.buscarImagem(p.id)).toBe(JPEG)
    await new DeleteProdutoUseCase(produtos).execute({ id: p.id })
    expect(await nomes()).toEqual([])
    expect(await catalogo.buscarImagem(p.id)).toBeNull()
  })

  it('ocultar tira do catálogo, voltar a mostrar devolve e o produto segue nas buscas internas', async () => {
    const p = await criar.execute({ nome: 'Ração X', categoria: 'Ração', valorVenda: 10, imagemUrl: JPEG })
    const atualizar = new UpdateProdutoUseCase(produtos)

    await atualizar.execute({ id: p.id, ocultarCatalogo: true })
    expect(await nomes()).toEqual([])
    expect(await catalogo.buscarImagem(p.id)).toBeNull()
    expect((await produtos.findMany({ q: 'Ração', page: 1, limit: 10 })).total).toBe(1)
    expect((await produtos.findById(p.id))?.ocultarCatalogo).toBe(true)

    await atualizar.execute({ id: p.id, valorVenda: 20 })
    expect((await produtos.findById(p.id))?.ocultarCatalogo).toBe(true)

    await atualizar.execute({ id: p.id, ocultarCatalogo: false })
    expect(await nomes()).toEqual(['Ração X'])
  })

  it('a lista informa se há foto sem trazer o base64', async () => {
    await criar.execute({ nome: 'Com foto', categoria: 'Higiene', valorVenda: 10, imagemUrl: JPEG })
    await criar.execute({ nome: 'Sem foto', categoria: 'Higiene', valorVenda: 10 })
    const lista = await catalogo.listar()
    expect(lista.map((p) => p.temImagem)).toEqual([true, false])
    expect(JSON.stringify(lista)).not.toContain('base64')
  })
})
