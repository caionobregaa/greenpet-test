import { Prisma, type PrismaClient } from '@prisma/client'
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import { Produto } from '../../domain/entities/produto.entity.js'

export class PrismaProdutoRepository implements IProdutoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Produto | null> {
    const row = await this.prisma.produto.findFirst({ where: { id, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findByNome(nome: string): Promise<Produto | null> {
    const row = await this.prisma.produto.findFirst({ where: { nome, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { q?: string; categoria?: string; especie?: string; fornecedor?: string; marca?: string; page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit
    const take = params.limit

    if (params.q) {
      // accent-insensitive + partial match anywhere in nome, marca, subCategoria
      const qParam = `%${params.q}%`
      const conditions: Prisma.Sql[] = [Prisma.sql`"deletedAt" IS NULL`]
      if (params.categoria)  conditions.push(Prisma.sql`categoria  = ${params.categoria}`)
      if (params.especie)    conditions.push(Prisma.sql`especie    = ${params.especie}`)
      if (params.fornecedor) conditions.push(Prisma.sql`fornecedor = ${params.fornecedor}`)
      if (params.marca)      conditions.push(Prisma.sql`marca      = ${params.marca}`)
      conditions.push(Prisma.sql`(
        unaccent(lower(nome))                         LIKE unaccent(lower(${qParam}))
        OR unaccent(lower(COALESCE(marca, '')))        LIKE unaccent(lower(${qParam}))
        OR unaccent(lower(COALESCE("subCategoria", ''))) LIKE unaccent(lower(${qParam}))
      )`)
      const where = Prisma.join(conditions, ' AND ')
      type ProdutoRow = Record<string, unknown>
      const rows = await this.prisma.$queryRaw<ProdutoRow[]>(
        Prisma.sql`SELECT * FROM produtos WHERE ${where} ORDER BY nome ASC LIMIT ${take} OFFSET ${skip}`
      )
      const countResult = await this.prisma.$queryRaw<Array<{ count: string }>>(
        Prisma.sql`SELECT COUNT(*)::text AS count FROM produtos WHERE ${where}`
      )
      return { produtos: rows.map((r) => this.toDomain(r)), total: Number(countResult[0]?.count ?? 0) }
    }

    const where = {
      deletedAt: null,
      ...(params.categoria  ? { categoria:  params.categoria }  : {}),
      ...(params.especie    ? { especie:    params.especie }    : {}),
      ...(params.fornecedor ? { fornecedor: params.fornecedor } : {}),
      ...(params.marca      ? { marca:      params.marca }      : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.produto.findMany({ where, skip, take, orderBy: { nome: 'asc' } }),
      this.prisma.produto.count({ where }),
    ])
    return { produtos: rows.map((r) => this.toDomain(r)), total }
  }

  async save(produto: Produto): Promise<void> {
    const data = {
      nome: produto.nome,
      categoria: produto.categoria,
      especie: produto.especie ?? null,
      subCategoria: produto.subCategoria ?? null,
      marca: produto.marca ?? null,
      fornecedor: produto.fornecedor ?? null,
      pesoEmbalagem: produto.pesoEmbalagem ?? null,
      unidadeEmbalagem: produto.unidadeEmbalagem ?? null,
      valorCusto: produto.valorCusto,
      valorVenda: produto.valorVenda,
      margemCartao: produto.margemCartao,
      margemImposto: produto.margemImposto,
      margemOperacao: produto.margemOperacao,
      margemLucro: produto.margemLucro,
      diasRecompra: produto.diasRecompra ?? null,
      descricao: produto.descricao ?? null,
      imagemUrl: produto.imagemUrl ?? null,
      deletedAt: produto.deletedAt ?? null,
    }
    await this.prisma.produto.upsert({
      where: { id: produto.id },
      create: { id: produto.id, ...data },
      update: data,
    })
  }

  private toDomain(row: Record<string, unknown>): Produto {
    return Produto.create({
      id: row.id as string,
      nome: row.nome as string,
      categoria: row.categoria as string,
      especie: (row.especie as string | null) ?? undefined,
      subCategoria: (row.subCategoria as string | null) ?? undefined,
      marca: (row.marca as string | null) ?? undefined,
      fornecedor: (row.fornecedor as string | null) ?? undefined,
      pesoEmbalagem: row.pesoEmbalagem != null ? Number(row.pesoEmbalagem) : undefined,
      unidadeEmbalagem: (row.unidadeEmbalagem as string | null) ?? undefined,
      valorCusto: Number(row.valorCusto),
      valorVenda: Number(row.valorVenda),
      margemCartao: Number(row.margemCartao),
      margemImposto: Number(row.margemImposto),
      margemOperacao: Number(row.margemOperacao),
      margemLucro: Number(row.margemLucro),
      diasRecompra: (row.diasRecompra as number | null) ?? undefined,
      descricao: (row.descricao as string | null) ?? undefined,
      imagemUrl: (row.imagemUrl as string | null) ?? undefined,
      deletedAt: (row.deletedAt as Date | null) ?? undefined,
    })
  }
}
