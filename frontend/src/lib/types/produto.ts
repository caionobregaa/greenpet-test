import type { PromocaoAtivaProduto } from "./promocao";

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  /** Também aparece nessas categorias no site e nos filtros. */
  categoriasAdicionais?: string[];
  especie: string | null;
  subCategoria: string | null;
  faseDaVida: string | null;
  porte: string | null;
  sabor: string | null;
  marca: string | null;
  fornecedor: string | null;
  codigoBarras: string | null;
  semCodigoBarras: boolean;
  pesoEmbalagem: number | null;
  unidadeEmbalagem: string | null;
  valorCusto: number;
  valorVenda: number;
  margemCartao: number | null;
  margemImposto: number | null;
  margemOperacao: number | null;
  margemLucro: number | null;
  diasRecompra: number | null;
  estoqueMinimo: number | null;
  descricao: string | null;
  imagemUrl: string | null;
  ocultarCatalogo: boolean;
  estoque: number;
  /** Campanha ativa agora; valorVenda continua sendo o preço normal. */
  promocao?: PromocaoAtivaProduto | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
