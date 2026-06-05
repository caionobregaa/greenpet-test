export interface EstoqueItem {
  id: string;
  produtoId: string;
  produto: {
    id: string;
    nome: string;
    categoria: string;
    imagemUrl: string | null;
    valorVenda: number;
    marca: string | null;
  };
  quantidade: number;
  validade: string | null;
  lote: string | null;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
}
