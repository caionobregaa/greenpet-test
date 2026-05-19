import { describe, it, expect } from 'vitest'
import { Venda } from '@/modules/vendas/domain/entities/venda.entity'

describe('Venda entity', () => {
  const clienteId = crypto.randomUUID()

  describe('create', () => {
    it('cria venda com itens e calcula total', () => {
      const venda = Venda.create({
        clienteId,
        formaPag: 'Pix',
        itens: [
          { nome: 'Ração Premium', qtd: 2, valorUnitario: 50 },
          { nome: 'Petisco', qtd: 1, valorUnitario: 15 },
        ],
      })
      expect(venda.total).toBe(115)
      expect(venda.itens).toHaveLength(2)
      expect(venda.formaPag).toBe('Pix')
    })

    it('rejeita forma de pagamento inválida', () => {
      expect(() =>
        Venda.create({
          clienteId,
          formaPag: 'Cheque',
          itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 50 }],
        }),
      ).toThrow('Forma de pagamento inválida')
    })

    it('rejeita venda sem itens', () => {
      expect(() =>
        Venda.create({ clienteId, formaPag: 'Pix', itens: [] }),
      ).toThrow('Venda deve ter ao menos 1 item')
    })

    it('rejeita quantidade zero ou negativa', () => {
      expect(() =>
        Venda.create({
          clienteId,
          formaPag: 'Pix',
          itens: [{ nome: 'Ração', qtd: 0, valorUnitario: 50 }],
        }),
      ).toThrow('Quantidade deve ser maior que zero')
    })
  })

  it('snapshots de nome e valorUnitario são preservados no item', () => {
    const venda = Venda.create({
      clienteId,
      formaPag: 'Dinheiro',
      itens: [{ nome: 'Produto Snapshot', qtd: 3, valorUnitario: 25, produtoId: crypto.randomUUID() }],
    })
    expect(venda.itens[0].nome).toBe('Produto Snapshot')
    expect(venda.itens[0].valorUnitario).toBe(25)
    expect(venda.itens[0].total).toBe(75)
  })
})
