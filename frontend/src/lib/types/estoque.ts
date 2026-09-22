export interface EstoqueItem {
  id: string;
  produtoId: string;
  produto: {
    id: string;
    nome: string;
    categoria: string;
    imagemUrl: string | null;
    valorVenda: number;
    valorCusto: number;
    marca: string | null;
    codigoBarras: string | null;
    semCodigoBarras: boolean;
  };
  quantidade: number;
  validade: string | null;
  lote: string | null;
  precoCompra: number | null;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
}
