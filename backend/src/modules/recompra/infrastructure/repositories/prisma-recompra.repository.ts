import type { PrismaClient } from '@prisma/client'
import { classifyUrgency, calcDiasRestantes, type UrgencyLevel } from '../../domain/services/recompra-alert.service.js'
export type { UrgencyLevel } from '../../domain/services/recompra-alert.service.js'

export interface RecompraAlerta {
  clienteId: string
  clienteNome: string
  animalId?: string
  animalNome?: string
  produtoId: string
  produtoNome: string
  diasRecompra: number
  ultimaCompra: Date
  diasRestantes: number
  urgencia: UrgencyLevel
}

export class PrismaRecompraRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAlertas(params: {
    clienteId?: string
    urgencia?: UrgencyLevel
    page: number
    limit: number
  }): Promise<{ alertas: RecompraAlerta[]; total: number }> {
    const vendaItens = await this.prisma.vendaItem.findMany({
      where: {
        produtoId: { not: null },
        OR: [
          { produto: { diasRecompra: { not: null } } },
          { consumoDiario: { not: null } },
        ],
        venda: {
          cliente: { deletedAt: null },
          ...(params.clienteId ? { clienteId: params.clienteId } : {}),
        },
      },
      include: {
        venda: {
          include: {
            cliente: { select: { id: true, nome: true } },
            animal: { select: { id: true, nome: true } },
          },
        },
        produto: { select: { id: true, nome: true, diasRecompra: true, pesoEmbalagem: true } },
      },
      orderBy: { venda: { data: 'desc' } },
    })

    // Collect all animalIds we need names for
    const animalIdsToLookup = new Set<string>()
    for (const item of vendaItens) {
      if (item.itemAnimalId) animalIdsToLookup.add(item.itemAnimalId)
      if (item.venda.animal?.id) animalIdsToLookup.add(item.venda.animal.id)
    }
    const animalRows = animalIdsToLookup.size > 0
      ? await this.prisma.animal.findMany({
          where: { id: { in: [...animalIdsToLookup] } },
          select: { id: true, nome: true },
        })
      : []
    const animalNameMap = new Map(animalRows.map((a) => [a.id, a.nome]))

    // Group by (clienteId, produtoId, animalId) — keep only most recent sale per combination
    const seen = new Map<string, RecompraAlerta>()
    for (const item of vendaItens) {
      if (!item.produtoId) continue

      // Compute diasRecompra: prefer consumoDiario-based calculation
      let diasRecompra: number
      if (item.consumoDiario && item.consumoDiario > 0 && item.produto?.pesoEmbalagem) {
        diasRecompra = Math.round((Number(item.produto.pesoEmbalagem) * 1000) / item.consumoDiario)
      } else if (item.produto?.diasRecompra) {
        diasRecompra = item.produto.diasRecompra
      } else {
        continue
      }

      const animalId = item.itemAnimalId ?? item.venda.animal?.id ?? ''
      const key = `${item.venda.clienteId}:${item.produtoId}:${animalId}`
      if (seen.has(key)) continue

      const diasRestantes = calcDiasRestantes(item.venda.data, diasRecompra)
      const urgencia = classifyUrgency(diasRestantes)

      seen.set(key, {
        clienteId: item.venda.clienteId,
        clienteNome: item.venda.cliente.nome,
        animalId,
        animalNome: animalId ? (animalNameMap.get(animalId) ?? '') : '',
        produtoId: item.produtoId,
        produtoNome: item.produto.nome,
        diasRecompra,
        ultimaCompra: item.venda.data,
        diasRestantes,
        urgencia,
      })
    }

    // Filter out dismissed alerts
    const dismissals = await this.prisma.recompraDismissal.findMany()
    const dismissMap = new Map(
      dismissals.map((d) => [`${d.produtoId}:${d.clienteId}:${d.animalId}`, d.createdAt]),
    )

    let alertas = Array.from(seen.values()).filter((a) => {
      const key = `${a.produtoId}:${a.clienteId}:${a.animalId ?? ''}`
      const dismissedAt = dismissMap.get(key)
      if (!dismissedAt) return true
      return a.ultimaCompra > dismissedAt
    })

    if (params.urgencia) {
      alertas = alertas.filter((a) => a.urgencia === params.urgencia)
    }

    const urgencyOrder: Record<string, number> = { vencido: 0, urgente: 1, proximo: 2, ok: 3 }
    alertas.sort((a, b) => {
      const urgDiff = urgencyOrder[a.urgencia] - urgencyOrder[b.urgencia]
      return urgDiff !== 0 ? urgDiff : a.diasRestantes - b.diasRestantes
    })

    const total = alertas.length
    const paginated = alertas.slice((params.page - 1) * params.limit, params.page * params.limit)

    return { alertas: paginated, total }
  }
}
