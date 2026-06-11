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
    // Find all venda items with products that have diasRecompra set
    const vendaItens = await this.prisma.vendaItem.findMany({
      where: {
        produtoId: { not: null },
        produto: { diasRecompra: { not: null } },
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
        produto: { select: { id: true, nome: true, diasRecompra: true } },
      },
      orderBy: { venda: { data: 'desc' } },
    })

    // Group by (clienteId, produtoId) and keep only the most recent sale per pair
    const seen = new Map<string, RecompraAlerta>()
    for (const item of vendaItens) {
      if (!item.produtoId || !item.produto?.diasRecompra) continue
      const key = `${item.venda.clienteId}:${item.produtoId}`
      if (seen.has(key)) continue

      const diasRestantes = calcDiasRestantes(item.venda.data, item.produto.diasRecompra)
      const urgencia = classifyUrgency(diasRestantes)

      seen.set(key, {
        clienteId: item.venda.clienteId,
        clienteNome: item.venda.cliente.nome,
        animalId: item.venda.animal?.id ?? '',
        animalNome: item.venda.animal?.nome ?? '',
        produtoId: item.produtoId,
        produtoNome: item.produto.nome,
        diasRecompra: item.produto.diasRecompra,
        ultimaCompra: item.venda.data,
        diasRestantes,
        urgencia,
      })
    }

    // Filter out dismissed alerts where the dismissal is more recent than the last purchase
    const dismissals = await this.prisma.recompraDismissal.findMany()
    const dismissMap = new Map(
      dismissals.map((d) => [`${d.produtoId}:${d.clienteId}:${d.animalId}`, d.createdAt]),
    )

    let alertas = Array.from(seen.values()).filter((a) => {
      const key = `${a.produtoId}:${a.clienteId}:${a.animalId ?? ''}`
      const dismissedAt = dismissMap.get(key)
      if (!dismissedAt) return true
      // Reappear if a new purchase happened after the dismissal
      return a.ultimaCompra > dismissedAt
    })

    if (params.urgencia) {
      alertas = alertas.filter((a) => a.urgencia === params.urgencia)
    }

    // Sort by urgência priority then diasRestantes
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
