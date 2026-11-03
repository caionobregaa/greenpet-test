import { describe, it, expect } from 'vitest'
import { CreateProdutoSchema, UpdateProdutoSchema } from '@/modules/produtos/infrastructure/http/produtos.schema'
import { CreateAnimalSchema, UpdateAnimalSchema } from '@/modules/animais/infrastructure/http/animais.schema'
import { CreateClienteSchema, UpdateClienteSchema } from '@/modules/clientes/infrastructure/http/clientes.schema'
import { CreateVendaSchema } from '@/modules/vendas/infrastructure/http/vendas.schema'

// Atualização para o zod 4: editar sem enviar um campo não pode trocar o valor salvo pelo padrão.
describe('Schemas de edição parcial', () => {
  it.each([
    ['produto', UpdateProdutoSchema],
    ['animal', UpdateAnimalSchema],
    ['cliente', UpdateClienteSchema],
  ])('edição de %s sem campos não inventa valores', (_nome, schema) => {
    expect(schema.parse({})).toEqual({})
  })

  it('edição envia só o que mudou', () => {
    expect(UpdateProdutoSchema.parse({ valorVenda: 20 })).toEqual({ valorVenda: 20 })
    expect(UpdateClienteSchema.parse({ nome: 'Maria Silva' })).toEqual({ nome: 'Maria Silva' })
  })

  it('cadastro continua aplicando os padrões', () => {
    expect(CreateProdutoSchema.parse({ nome: 'A', categoria: 'Ração', valorVenda: 10 })).toMatchObject({
      valorCusto: 0, margemCartao: 0, margemImposto: 0, margemOperacao: 0, margemLucro: 0,
    })
    expect(CreateAnimalSchema.parse({ nome: 'Rex', clienteId: '0b1f7c8e-1d3a-4c5b-9e2f-123456789abc', especie: 'Cão' }))
      .toMatchObject({ sexo: 'Indefinido', peso: 0 })
    expect(CreateClienteSchema.parse({ nome: 'Maria', telefone: '(92) 99999-0000' })).toMatchObject({ cidade: 'Manaus', telefone: '92999990000' })
  })

  it('ids fora do padrão RFC, como os de importação, continuam aceitos', () => {
    const r = CreateVendaSchema.safeParse({
      clienteId: '00000000-0000-0000-0000-000000000001', formaPag: 'Pix',
      itens: [{ nome: 'X', qtd: 1, valorUnitario: 10 }],
    })
    expect(r.success).toBe(true)
  })

  it('erros continuam saindo com mensagem para a API', () => {
    const r = UpdateProdutoSchema.safeParse({ valorVenda: -1 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toEqual(expect.any(String))
  })
})
