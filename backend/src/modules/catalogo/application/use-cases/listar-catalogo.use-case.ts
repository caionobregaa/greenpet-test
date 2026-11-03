import type { ICatalogoRepository } from '../../domain/catalogo.repository.interface.js'

export interface ProdutoCatalogo {
  id: string
  nome: string
  categoria: string
  especie: string | null
  valorVenda: number
  imagemUrl: string | null
}

export class ListarCatalogoUseCase {
  constructor(private readonly repo: ICatalogoRepository) {}

  async execute(): Promise<ProdutoCatalogo[]> {
    const rows = await this.repo.listar()
    return rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      categoria: r.categoria,
      especie: r.especie,
      valorVenda: r.valorVenda,
      // `v` muda quando o produto muda: a foto pode ter cache longo sem ficar velha.
      imagemUrl: r.temImagem ? `/api/v1/catalogo/produtos/${r.id}/imagem?v=${r.atualizadoEm.getTime()}` : null,
    }))
  }
}
