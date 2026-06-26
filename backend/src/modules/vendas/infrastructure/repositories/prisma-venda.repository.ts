import type { PrismaClient, Prisma } from '@prisma/client'
import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import { Venda } from '../../domain/entities/venda.entity.js'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

async function decrementarEstoque(tx: TxClient, produtoId: string, qtd: number): Promise<void> {
  const lotes = await tx.estoqueItem.findMany({
    where: { produtoId, quantidade: { gt: 0 } },
    orderBy: [{ validade: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })

  let restante = qtd
  for (const lote of lotes) {
    if (restante <= 0) break
    const consumir = Math.min(lote.quantidade, restante)
    restante -= consumir
    const novaQtd = lote.quantidade - consumir
    if (novaQtd <= 0) {
      await tx.estoqueItem.delete({ where: { id: lote.id } })
    } else {
      await tx.estoqueItem.update({ where: { id: lote.id }, data: { quantidade: novaQtd } })
    }
  }
}

export class PrismaVendaRepository implements IVendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Venda | null> {
    const row = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true } })
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
        include: { itens: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { data: 'desc' },
      }),
      this.prisma.venda.count({ where }),
    ])
    return { vendas: rows.map((r) => this.toDomain(r)), total }
  }

  async save(venda: Venda): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.venda.findUnique({ where: { id: venda.id }, select: { id: true } })
      const isNew = !existing

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
          obs: venda.obs ?? null,
          itens: {
            create: venda.itens.map((i) => ({
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
            })),
          },
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
          obs: venda.obs ?? null,
          itens: {
            deleteMany: {},
            create: venda.itens.map((i) => ({
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
            })),
          },
        },
      })

      if (isNew) {
        for (const item of venda.itens) {
          if (!item.produtoId || item.qtd <= 0) continue
          await decrementarEstoque(tx as unknown as TxClient, item.produtoId, item.qtd)
        }
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.venda.delete({ where: { id } })
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
      })),
    })
  }
}
