import type { ICatalogoRepository } from '../../domain/catalogo.repository.interface.js'

export interface ProdutoCatalogo {
  id: string
  nome: string
  categoria: string
  especie: string | null
  marca: string | null
  /** Principal primeiro, depois as adicionais publicadas (specs/catalogo/spec-v2.md). */
  categorias: string[]
  /** Preço a pagar: o promocional, durante uma campanha ativa. */
  valorVenda: number
  /** Preço normal riscado; null fora de promoção. */
  valorOriginal: number | null
  /** Fim da campanha ativa (ISO); null fora de promoção. */
  promocaoFim: string | null
  imagemUrl: string | null
}

export class ListarCatalogoUseCase {
  constructor(private readonly repo: ICatalogoRepository) {}

  async execute(): Promise<ProdutoCatalogo[]> {
    const [rows, promocoes] = await Promise.all([this.repo.listar(), this.repo.promocoesAtivas()])
    return rows.map((r) => {
      const promocao = promocoes.get(r.id)
      return {
        id: r.id,
        nome: r.nome,
        categoria: r.categoria,
        especie: r.especie,
        marca: r.marca ?? null,
        categorias: [r.categoria, ...(r.categoriasAdicionais ?? []).filter((c) => c !== 'Serviço' && c !== r.categoria)],
        valorVenda: promocao ? promocao.valorPromocional : r.valorVenda,
        valorOriginal: promocao ? r.valorVenda : null,
        promocaoFim: promocao ? promocao.fim.toISOString() : null,
        // `v` muda quando o produto muda: a foto pode ter cache longo sem ficar velha.
        imagemUrl: r.temImagem ? `/api/v1/catalogo/produtos/${r.id}/imagem?v=${r.atualizadoEm.getTime()}` : null,
      }
    })
  }
}
