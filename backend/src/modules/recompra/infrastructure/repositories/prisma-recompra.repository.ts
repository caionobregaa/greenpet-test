import type { PrismaClient } from '@prisma/client'
import { classifyUrgency, calcDiasRestantes, type UrgencyLevel } from '../../domain/services/recompra-alert.service.js'
export type { UrgencyLevel } from '../../domain/services/recompra-alert.service.js'

export interface RecompraAlerta {
  id?: string           // only set for manual entries
  isManual?: boolean
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

  async createManual(data: {
    clienteId: string
    animalId: string
    produtoId: string
    ultimaCompra?: Date | null
    previsaoData?: Date | null
    diasRecompra?: number | null
  }): Promise<{ id: string }> {
    const row = await this.prisma.recompraManual.create({
      data: {
        id: crypto.randomUUID(),
        clienteId: data.clienteId,
        animalId: data.animalId ?? '',
        produtoId: data.produtoId,
        ultimaCompra: data.ultimaCompra ?? null,
        previsaoData: data.previsaoData ?? null,
        diasRecompra: data.diasRecompra ?? null,
      },
    })
    return { id: row.id }
  }

  async deleteManual(id: string): Promise<void> {
    await this.prisma.recompraManual.delete({ where: { id } })
  }

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
          { consumoDiario: { not: null } },
          { recompraData: { not: null } },
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
        produto: { select: { id: true, nome: true, pesoEmbalagem: true } },
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

      let diasRecompra: number
      let diasRestantes: number

      if (item.recompraData) {
        const recompraMs = new Date(item.recompraData).getTime()
        const vendaMs = item.venda.data.getTime()
        const hojeMs = Date.now()
        diasRecompra = Math.round((recompraMs - vendaMs) / (1000 * 60 * 60 * 24))
        diasRestantes = Math.floor((recompraMs - hojeMs) / (1000 * 60 * 60 * 24))
      } else if (item.consumoDiario && item.consumoDiario > 0 && item.produto?.pesoEmbalagem) {
        diasRecompra = Math.round((Number(item.produto.pesoEmbalagem) * 1000) / item.consumoDiario)
        diasRestantes = calcDiasRestantes(item.venda.data, diasRecompra)
      } else {
        continue
      }

      const animalId = item.itemAnimalId ?? item.venda.animal?.id ?? ''
      const key = `${item.venda.clienteId}:${item.produtoId}:${animalId}`
      if (seen.has(key)) continue

      const urgencia = classifyUrgency(diasRestantes)

      seen.set(key, {
        clienteId: item.venda.clienteId,
        clienteNome: item.venda.cliente.nome,
        animalId,
        animalNome: animalId ? (animalNameMap.get(animalId) ?? '') : '',
        produtoId: item.produtoId,
        produtoNome: item.produto!.nome,
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

    // Merge manual entries
    const manuaisWhere = params.clienteId ? { clienteId: params.clienteId } : {}
    const manuais = await this.prisma.recompraManual.findMany({ where: manuaisWhere })

    if (manuais.length > 0) {
      // Lookup names for manual entries
      const clienteIds = [...new Set(manuais.map((m) => m.clienteId))]
      const produtoIds = [...new Set(manuais.map((m) => m.produtoId))]
      const manualAnimalIds = [...new Set(manuais.map((m) => m.animalId).filter(Boolean))]

      const [clientes, produtos, animais] = await Promise.all([
        this.prisma.cliente.findMany({ where: { id: { in: clienteIds } }, select: { id: true, nome: true } }),
        this.prisma.produto.findMany({ where: { id: { in: produtoIds } }, select: { id: true, nome: true } }),
        manualAnimalIds.length > 0
          ? this.prisma.animal.findMany({ where: { id: { in: manualAnimalIds } }, select: { id: true, nome: true } })
          : Promise.resolve([]),
      ])
      const clienteMap = new Map(clientes.map((c) => [c.id, c.nome]))
      const produtoMap = new Map(produtos.map((p) => [p.id, p.nome]))
      const animalMapManual = new Map(animais.map((a) => [a.id, a.nome]))

      const hoje = Date.now()

      for (const m of manuais) {
        const key = `${m.clienteId}:${m.produtoId}:${m.animalId}`
        // Manual entry overrides auto-computed entry for same key
        const dismissedAt = dismissMap.get(`${m.produtoId}:${m.clienteId}:${m.animalId}`)

        let diasRestantes: number
        let diasRecompra: number
        let ultimaCompra: Date

        if (m.previsaoData) {
          // Explicit target date
          diasRestantes = Math.floor((m.previsaoData.getTime() - hoje) / (1000 * 60 * 60 * 24))
          ultimaCompra = m.ultimaCompra ?? m.createdAt
          diasRecompra = m.ultimaCompra
            ? Math.round((m.previsaoData.getTime() - m.ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
            : diasRestantes
        } else if (m.diasRecompra && m.diasRecompra > 0) {
          // Days from last purchase (or creation date)
          const base = m.ultimaCompra ?? m.createdAt
          ultimaCompra = base
          diasRecompra = m.diasRecompra
          diasRestantes = calcDiasRestantes(base, diasRecompra)
        } else {
          continue
        }

        // Respect dismissals for manual entries too
        if (dismissedAt && ultimaCompra <= dismissedAt) continue

        const urgencia = classifyUrgency(diasRestantes)

        seen.set(key, {
          id: m.id,
          isManual: true,
          clienteId: m.clienteId,
          clienteNome: clienteMap.get(m.clienteId) ?? '',
          animalId: m.animalId || undefined,
          animalNome: m.animalId ? (animalMapManual.get(m.animalId) ?? '') : '',
          produtoId: m.produtoId,
          produtoNome: produtoMap.get(m.produtoId) ?? '',
          diasRecompra,
          ultimaCompra,
          diasRestantes,
          urgencia,
        })
      }

      // Rebuild alertas after merging manual entries
      alertas = Array.from(seen.values()).filter((a) => {
        if (a.isManual) return true // already checked dismissals above
        const k = `${a.produtoId}:${a.clienteId}:${a.animalId ?? ''}`
        const dismissedAt = dismissMap.get(k)
        if (!dismissedAt) return true
        return a.ultimaCompra > dismissedAt
      })
    }

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
