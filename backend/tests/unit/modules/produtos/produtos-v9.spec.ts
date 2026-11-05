import { describe, it, expect } from 'vitest'
import { Produto, normalizarCategoriasAdicionais, SKU_PREFIXES } from '@/modules/produtos/domain/entities/produto.entity'
import { normalizarNomeProduto } from '@/modules/produtos/domain/produto-nome'
import { ListProdutosQuerySchema, UpdateProdutoSchema, CreateProdutoSchema } from '@/modules/produtos/infrastructure/http/produtos.schema'

// specs/produtos/spec-v9.md
describe('Ração Úmida', () => {
  it('é categoria válida com SKU RUM', () => {
    expect(SKU_PREFIXES['Ração Úmida']).toBe('RUM')
    expect(Produto.create({ nome: 'Sachê X', sku: 'RUM-0001', categoria: 'Ração Úmida', valorVenda: 5 }).categoria).toBe('Ração Úmida')
    expect(CreateProdutoSchema.safeParse({ nome: 'A', categoria: 'Ração Úmida', valorVenda: 5 }).success).toBe(true)
  })
})

describe('Categorias adicionais', () => {
  it('normaliza: sem repetir, sem a principal e só categorias válidas', () => {
    expect(normalizarCategoriasAdicionais(['Petisco', 'Ração', 'Petisco', 'Inventada', 'Ração Úmida'], 'Ração')).toEqual(['Petisco', 'Ração Úmida'])
    expect(normalizarCategoriasAdicionais(undefined, 'Ração')).toEqual([])
  })

  it('nasce vazia, aceita lista e se ajusta quando a principal muda', () => {
    const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10, categoriasAdicionais: ['Ração Úmida'] })
    expect(p.categoriasAdicionais).toEqual(['Ração Úmida'])
    p.update({ categoria: 'Ração Úmida' })
    expect(p.categoriasAdicionais).toEqual([])
    p.update({ categoriasAdicionais: ['Petisco', 'Petisco'] })
    expect(p.categoriasAdicionais).toEqual(['Petisco'])
    p.update({ valorVenda: 20 })
    expect(p.categoriasAdicionais).toEqual(['Petisco'])
    expect(Produto.create({ nome: 'B', sku: 'PET-0001', categoria: 'Petisco', valorVenda: 1 }).categoriasAdicionais).toEqual([])
  })

  it('a API recusa categoria adicional inexistente', () => {
    expect(UpdateProdutoSchema.safeParse({ categoriasAdicionais: ['Inventada'] }).success).toBe(false)
    expect(UpdateProdutoSchema.parse({ categoriasAdicionais: ['Petisco'] })).toEqual({ categoriasAdicionais: ['Petisco'] })
  })
})

describe('FN vira Fórmula Natural', () => {
  it.each([
    ['FN Fresh Meat Cão Adulto 12kg', 'Fórmula Natural Fresh Meat Cão Adulto 12kg'],
    ['Ração FN Life Gato', 'Ração Fórmula Natural Life Gato'],
    ['Pack (FN) 3kg', 'Pack (Fórmula Natural) 3kg'],
    ['Ração FN', 'Ração Fórmula Natural'],
  ])('em ração: %s', (antes, depois) => {
    expect(normalizarNomeProduto(antes, 'Ração')).toBe(depois)
    expect(normalizarNomeProduto(antes, 'Ração Úmida')).toBe(depois)
  })

  it.each(['FNX Premium', 'Fnatural', 'Ração fn minúsculo', 'AFN 2kg', 'FNÁ'])('não mexe em %s', (nome) => {
    expect(normalizarNomeProduto(nome, 'Ração')).toBe(nome)
  })

  it('não mexe fora das rações', () => {
    expect(normalizarNomeProduto('FN Bifinho', 'Petisco')).toBe('FN Bifinho')
  })
})

describe('Filtro de ocultos', () => {
  it('converte ocultos=true/false e deixa ausente quando não informado', () => {
    expect(ListProdutosQuerySchema.parse({ ocultos: 'true' }).ocultos).toBe(true)
    expect(ListProdutosQuerySchema.parse({ ocultos: 'false' }).ocultos).toBe(false)
    expect(ListProdutosQuerySchema.parse({}).ocultos).toBeUndefined()
    expect(ListProdutosQuerySchema.safeParse({ ocultos: 'sim' }).success).toBe(false)
  })
})
