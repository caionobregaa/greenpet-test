export interface ProdutoCatalogoRow {
  id: string
  nome: string
  categoria: string
  especie: string | null
  valorVenda: number
  temImagem: boolean
  atualizadoEm: Date
}

export interface ICatalogoRepository {
  /** Produtos publicados, sem carregar a foto: `imagemUrl` guarda base64 no banco. */
  listar(): Promise<ProdutoCatalogoRow[]>
  /** Valor bruto de `imagemUrl`, ou null se o produto não estiver publicado. */
  buscarImagem(id: string): Promise<string | null>
}
