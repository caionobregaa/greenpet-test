export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  especie: string | null;
  subCategoria: string | null;
  marca: string | null;
  fornecedor: string | null;
  pesoEmbalagem: number | null;
  valorCusto: number;
  valorVenda: number;
  margemCartao: number | null;
  margemImposto: number | null;
  margemOperacao: number | null;
  margemLucro: number | null;
  diasRecompra: number | null;
  descricao: string | null;
  imagemUrl: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
