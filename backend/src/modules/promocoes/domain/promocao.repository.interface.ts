export interface ItemPromocaoRegistro {
  produtoId: string
  produtoNome: string
  valorVenda: number
  valorCusto: number
  valorPromocional: number
}

export interface PromocaoRegistro {
  id: string
  nome: string
  inicio: Date
  fim: Date
  itens: ItemPromocaoRegistro[]
}

export interface DadosPromocao {
  nome: string
  inicio: Date
  fim: Date
  itens: Array<{ produtoId: string; valorPromocional: number }>
}

export interface ProdutoParaPromocao {
  id: string
  nome: string
  valorVenda: number
}

export interface ConflitoPromocao {
  produtoNome: string
  campanhaNome: string
  inicio: Date
  fim: Date
}

export interface IPromocaoRepository {
  listar(): Promise<PromocaoRegistro[]>
  buscar(id: string): Promise<PromocaoRegistro | null>
  criar(dados: DadosPromocao): Promise<PromocaoRegistro>
  /** Substitui nome, período e todos os itens. */
  atualizar(id: string, dados: DadosPromocao): Promise<PromocaoRegistro>
  alterarFim(id: string, fim: Date): Promise<PromocaoRegistro>
  excluir(id: string): Promise<void>
  /** Produtos ativos (não excluídos) entre os ids informados. */
  produtos(ids: string[]): Promise<ProdutoParaPromocao[]>
  /** Outras campanhas com algum desses produtos e período sobreposto. */
  conflitos(produtoIds: string[], inicio: Date, fim: Date, excetoId?: string): Promise<ConflitoPromocao[]>
}
