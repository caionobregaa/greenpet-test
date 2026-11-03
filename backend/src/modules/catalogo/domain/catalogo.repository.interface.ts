export interface ProdutoCatalogoRow {
  id: string
  nome: string
  categoria: string
  especie: string | null
  valorVenda: number
  temImagem: boolean
  atualizadoEm: Date
}

export interface PromocaoCatalogo {
  valorPromocional: number
  fim: Date
}

export interface ICatalogoRepository {
  /** Produtos publicados, sem carregar a foto: `imagemUrl` guarda base64 no banco. */
  listar(): Promise<ProdutoCatalogoRow[]>
  /** Valor bruto de `imagemUrl`, ou null se o produto não estiver publicado. */
  buscarImagem(id: string): Promise<string | null>
  /** Promoção ativa agora, por id de produto (specs/promocoes/spec-v1.md). */
  promocoesAtivas(): Promise<Map<string, PromocaoCatalogo>>
}
