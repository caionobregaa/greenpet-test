import type { PrismaClient, Prisma } from '@prisma/client'
import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import { Venda, type VendaPagamento, type VendaItemReadOnly } from '../../domain/entities/venda.entity.js'
import {
  type TxClient,
  tirarDoEstoque,
  devolverAoEstoque,
  distribuirBaixa,
  rotuloVenda,
} from '@/modules/estoque/infrastructure/movimentacao-estoque.js'

function pagamentoToRow(p: VendaPagamento) {
  return { id: p.id, valor: p.valor, data: p.data, formaPag: p.formaPag, obs: p.obs ?? null }
}

export class PrismaVendaRepository implements IVendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Venda | null> {
    const row = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true, pagamentos: { orderBy: { data: 'asc' } } } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { clienteId?: string; animalId?: string; page: number; limit: number }) {
    const where = {
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
      ...(params.animalId ? { animalId: params.animalId } : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.venda.findMany({
        where,
        include: { itens: true, pagamentos: { orderBy: { data: 'asc' } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { data: 'desc' },
      }),
      this.prisma.venda.count({ where }),
    ])
    return { vendas: rows.map((r) => this.toDomain(r)), total }
  }

  async save(venda: Venda): Promise<void> {
    await this.prisma.$transaction(async (raw) => {
      const tx = raw as unknown as TxClient
      const existing = await tx.venda.findUnique({
        where: { id: venda.id },
        select: { numero: true, itens: { select: { produtoId: true, qtd: true, qtdBaixada: true } } },
      })

      // Quanto cada item tirou do estoque (specs/estoque/spec-v2.md)
      const baixa = existing
        ? await this.ajustarEstoqueNaEdicao(tx, venda, existing)
        : await this.baixarEstoqueNaCriacao(tx, venda)

      const itemToRow = (i: VendaItemReadOnly) => ({
        id: i.id,
        produtoId: i.produtoId ?? null,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: i.valorUnitario,
        desconto: i.desconto,
        total: i.total,
        itemAnimalId: i.itemAnimalId ?? null,
        consumoDiario: i.consumoDiario ?? null,
        recompraData: i.recompraData ?? null,
        brinde: i.brinde,
        qtdBaixada: baixa.get(i.id) ?? null,
      })

      await tx.venda.upsert({
        where: { id: venda.id },
        create: {
          id: venda.id,
          data: venda.data,
          clienteId: venda.clienteId,
          animalId: venda.animalId ?? null,
          formaPag: venda.formaPag,
          taxaCartao: venda.taxaCartao,
          taxaEntrega: venda.taxaEntrega,
          desconto: venda.desconto,
          total: venda.total,
          valorRecebido: venda.valorRecebidoInformado ?? null,
          obs: venda.obs ?? null,
          pagamentos: { create: venda.pagamentos.map(pagamentoToRow) },
          itens: { create: venda.itens.map(itemToRow) },
        },
        update: {
          data: venda.data,
          clienteId: venda.clienteId,
          animalId: venda.animalId ?? null,
          formaPag: venda.formaPag,
          taxaCartao: venda.taxaCartao,
          taxaEntrega: venda.taxaEntrega,
          desconto: venda.desconto,
          total: venda.total,
          valorRecebido: venda.valorRecebidoInformado ?? null,
          obs: venda.obs ?? null,
          pagamentos: { deleteMany: {}, create: venda.pagamentos.map(pagamentoToRow) },
          itens: { deleteMany: {}, create: venda.itens.map(itemToRow) },
        },
      })
    })
  }

  /** Venda nova: cada item com produto tira sua quantidade (o que existir). */
  private async baixarEstoqueNaCriacao(tx: TxClient, venda: Venda): Promise<Map<string, number | null>> {
    const baixa = new Map<string, number | null>()
    for (const item of venda.itens) {
      baixa.set(item.id, item.produtoId ? await tirarDoEstoque(tx, item.produtoId, item.qtd) : 0)
    }
    return baixa
  }

  /**
   * Venda editada: por produto, tira ou devolve só a diferença de quantidade. Produto com
   * item pendente da correção retroativa (qtdBaixada vazio) não é ajustado.
   */
  private async ajustarEstoqueNaEdicao(
    tx: TxClient,
    venda: Venda,
    existing: { numero: number; itens: Array<{ produtoId: string | null; qtd: number; qtdBaixada: number | null }> },
  ): Promise<Map<string, number | null>> {
    const antigos = new Map<string, { qtd: number; baixada: number; pendente: boolean }>()
    for (const i of existing.itens) {
      if (!i.produtoId) continue
      const g = antigos.get(i.produtoId) ?? { qtd: 0, baixada: 0, pendente: false }
      g.qtd += i.qtd
      g.baixada += i.qtdBaixada ?? 0
      g.pendente ||= i.qtdBaixada === null
      antigos.set(i.produtoId, g)
    }
    const novos = new Map<string, VendaItemReadOnly[]>()
    const baixa = new Map<string, number | null>()
    for (const item of venda.itens) {
      if (!item.produtoId) { baixa.set(item.id, 0); continue }
      novos.set(item.produtoId, [...(novos.get(item.produtoId) ?? []), item])
    }

    const obs = `Estorno da venda ${rotuloVenda(existing.numero)} (editada)`
    for (const produtoId of new Set([...antigos.keys(), ...novos.keys()])) {
      const antigo = antigos.get(produtoId) ?? { qtd: 0, baixada: 0, pendente: false }
      const itens = novos.get(produtoId) ?? []
      if (antigo.pendente) {
        for (const i of itens) baixa.set(i.id, null)
        continue
      }
      const delta = itens.reduce((s, i) => s + i.qtd, 0) - antigo.qtd
      let baixada = antigo.baixada
      if (delta > 0) {
        baixada += await tirarDoEstoque(tx, produtoId, delta)
      } else if (delta < 0) {
        const devolver = Math.min(-delta, baixada)
        await devolverAoEstoque(tx, produtoId, devolver, obs)
        baixada -= devolver
      }
      distribuirBaixa(baixada, itens.map((i) => i.qtd)).forEach((q, idx) => baixa.set(itens[idx].id, q))
    }
    return baixa
  }

  /** Exclui a venda devolvendo ao estoque o que ela tinha tirado. */
  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (raw) => {
      const tx = raw as unknown as TxClient
      const venda = await tx.venda.findUnique({
        where: { id },
        select: { numero: true, itens: { select: { produtoId: true, qtdBaixada: true } } },
      })
      if (venda) {
        const porProduto = new Map<string, number>()
        for (const i of venda.itens) {
          if (i.produtoId && i.qtdBaixada) porProduto.set(i.produtoId, (porProduto.get(i.produtoId) ?? 0) + i.qtdBaixada)
        }
        const obs = `Estorno da venda ${rotuloVenda(venda.numero)} (excluída)`
        for (const [produtoId, qtd] of porProduto) await devolverAoEstoque(tx, produtoId, qtd, obs)
      }
      await tx.venda.delete({ where: { id } })
    })
  }

  private toDomain(row: {
    id: string
    numero: number
    data: Date
    clienteId: string
    animalId: string | null
    formaPag: string
    taxaCartao: number
    taxaEntrega: number
    desconto: number
    total: unknown
    obs: string | null
    createdAt: Date
    valorRecebido?: unknown
    pagamentos?: Array<{ id: string; valor: unknown; data: Date; formaPag: string; obs: string | null }>
    itens: Array<{
      id: string
      produtoId: string | null
      nome: string
      qtd: number
      valorUnitario: unknown
      desconto: number
      total: unknown
      itemAnimalId: string | null
      consumoDiario: number | null
      recompraData: Date | null
      brinde?: boolean
    }>
  }): Venda {
    return Venda.create({
      id: row.id,
      numero: row.numero,
      clienteId: row.clienteId,
      animalId: row.animalId ?? undefined,
      data: row.data,
      formaPag: row.formaPag,
      taxaCartao: row.taxaCartao ?? 0,
      taxaEntrega: row.taxaEntrega ?? 0,
      desconto: row.desconto ?? 0,
      obs: row.obs ?? undefined,
      valorRecebido: row.valorRecebido == null ? undefined : Number(row.valorRecebido),
      pagamentos: (row.pagamentos ?? []).map((p) => ({
        id: p.id,
        valor: Number(p.valor),
        data: p.data,
        formaPag: p.formaPag,
        obs: p.obs ?? undefined,
      })),
      itens: row.itens.map((i) => ({
        id: i.id,
        produtoId: i.produtoId ?? undefined,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: Number(i.valorUnitario),
        desconto: i.desconto ?? 0,
        itemAnimalId: i.itemAnimalId ?? undefined,
        consumoDiario: i.consumoDiario ?? undefined,
        recompraData: i.recompraData ?? undefined,
        brinde: i.brinde ?? false,
      })),
    })
  }
}
