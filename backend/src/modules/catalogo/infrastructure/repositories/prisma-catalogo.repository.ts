import type { PrismaClient } from '@prisma/client'
import type { ICatalogoRepository, ProdutoCatalogoRow, PromocaoCatalogo } from '../../domain/catalogo.repository.interface.js'
import { buscarPromocoesAtivas } from '@/modules/promocoes/infrastructure/promocoes-ativas.js'

// Regra de publicação em specs/catalogo/rules.md
const CATEGORIA_FORA_DO_CATALOGO = 'Serviço'

export class PrismaCatalogoRepository implements ICatalogoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(): Promise<ProdutoCatalogoRow[]> {
    // SQL direto: o Prisma não calcula "tem foto" sem trazer o base64 de todos os produtos.
    const rows = await this.prisma.$queryRaw<Array<Omit<ProdutoCatalogoRow, 'valorVenda'> & { valorVenda: unknown }>>`
      SELECT id, nome, categoria, especie, marca, "categoriasAdicionais", "valorVenda",
             COALESCE("imagemUrl", '') <> '' AS "temImagem",
             "updatedAt" AS "atualizadoEm"
      FROM produtos
      WHERE "deletedAt" IS NULL
        AND "ocultarCatalogo" = false
        AND categoria <> ${CATEGORIA_FORA_DO_CATALOGO}
      ORDER BY nome ASC
    `
    return rows.map((r) => ({ ...r, valorVenda: Number(r.valorVenda) }))
  }

  async promocoesAtivas(): Promise<Map<string, PromocaoCatalogo>> {
    return buscarPromocoesAtivas(this.prisma)
  }

  async buscarImagem(id: string): Promise<string | null> {
    const row = await this.prisma.produto.findFirst({
      where: {
        id,
        deletedAt: null,
        ocultarCatalogo: false,
        categoria: { not: CATEGORIA_FORA_DO_CATALOGO },
      },
      select: { imagemUrl: true },
    })
    return row?.imagemUrl ?? null
  }
}
