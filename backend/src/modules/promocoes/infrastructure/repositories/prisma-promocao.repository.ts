import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  ConflitoPromocao,
  DadosPromocao,
  IPromocaoRepository,
  ProdutoParaPromocao,
  PromocaoRegistro,
} from '../../domain/promocao.repository.interface.js'

const INCLUIR_ITENS = {
  itens: {
    include: { produto: { select: { nome: true, valorVenda: true, valorCusto: true } } },
    orderBy: { produto: { nome: 'asc' } },
  },
} satisfies Prisma.PromocaoInclude

type LinhaPromocao = Prisma.PromocaoGetPayload<{ include: typeof INCLUIR_ITENS }>

function paraRegistro(row: LinhaPromocao): PromocaoRegistro {
  return {
    id: row.id,
    nome: row.nome,
    inicio: row.inicio,
    fim: row.fim,
    itens: row.itens.map((i) => ({
      produtoId: i.produtoId,
      produtoNome: i.produto.nome,
      valorVenda: Number(i.produto.valorVenda),
      valorCusto: Number(i.produto.valorCusto),
      valorPromocional: Number(i.valorPromocional),
    })),
  }
}

export class PrismaPromocaoRepository implements IPromocaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(): Promise<PromocaoRegistro[]> {
    const rows = await this.prisma.promocao.findMany({ include: INCLUIR_ITENS, orderBy: { inicio: 'desc' } })
    return rows.map(paraRegistro)
  }

  async buscar(id: string): Promise<PromocaoRegistro | null> {
    const row = await this.prisma.promocao.findUnique({ where: { id }, include: INCLUIR_ITENS })
    return row ? paraRegistro(row) : null
  }

  async criar(dados: DadosPromocao): Promise<PromocaoRegistro> {
    const row = await this.prisma.promocao.create({
      data: { nome: dados.nome, inicio: dados.inicio, fim: dados.fim, itens: { create: dados.itens } },
      include: INCLUIR_ITENS,
    })
    return paraRegistro(row)
  }

  async atualizar(id: string, dados: DadosPromocao): Promise<PromocaoRegistro> {
    const [, row] = await this.prisma.$transaction([
      this.prisma.promocaoItem.deleteMany({ where: { promocaoId: id } }),
      this.prisma.promocao.update({
        where: { id },
        data: { nome: dados.nome, inicio: dados.inicio, fim: dados.fim, itens: { create: dados.itens } },
        include: INCLUIR_ITENS,
      }),
    ])
    return paraRegistro(row)
  }

  async alterarFim(id: string, fim: Date): Promise<PromocaoRegistro> {
    const row = await this.prisma.promocao.update({ where: { id }, data: { fim }, include: INCLUIR_ITENS })
    return paraRegistro(row)
  }

  async excluir(id: string): Promise<void> {
    await this.prisma.promocao.delete({ where: { id } })
  }

  async produtos(ids: string[]): Promise<ProdutoParaPromocao[]> {
    const rows = await this.prisma.produto.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, nome: true, valorVenda: true },
    })
    return rows.map((r) => ({ id: r.id, nome: r.nome, valorVenda: Number(r.valorVenda) }))
  }

  async conflitos(produtoIds: string[], inicio: Date, fim: Date, excetoId?: string): Promise<ConflitoPromocao[]> {
    const rows = await this.prisma.promocaoItem.findMany({
      where: {
        produtoId: { in: produtoIds },
        promocao: { inicio: { lte: fim }, fim: { gte: inicio }, ...(excetoId ? { id: { not: excetoId } } : {}) },
      },
      include: { produto: { select: { nome: true } }, promocao: { select: { nome: true, inicio: true, fim: true } } },
      take: 5,
    })
    return rows.map((r) => ({
      produtoNome: r.produto.nome,
      campanhaNome: r.promocao.nome,
      inicio: r.promocao.inicio,
      fim: r.promocao.fim,
    }))
  }
}
