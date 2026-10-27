export interface EstoqueItem {
  id: string;
  produtoId: string;
  produto: {
    id: string;
    nome: string;
    categoria: string;
    especie: string | null;
    fornecedor: string | null;
    imagemUrl: string | null;
    valorVenda: number;
    valorCusto: number;
    marca: string | null;
    sku: string;
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

// Baixa pelas vendas, diagnóstico e correção retroativa (specs/estoque/spec-v2.md)

/** Item vendido com estoque insuficiente: tirou só `qtdBaixada` de `qtd`. */
export interface AvisoEstoque {
  produtoId: string;
  nome: string;
  qtd: number;
  qtdBaixada: number;
}

export interface DiagnosticoEstoque {
  itensSemProduto: Array<{ vendaId: string; vendaNumero: number; vendaData: string; nome: string; qtd: number }>;
  baixasIncompletas: Array<{ vendaId: string; vendaNumero: number; vendaData: string; produtoId: string; produtoNome: string; qtd: number; qtdBaixada: number }>;
  produtosDuplicados: Array<{ nome: string; produtos: Array<{ id: string; nome: string; sku: string; estoque: number }> }>;
  pendentesCorrecao: { itens: number; unidades: number };
}

export interface ResultadoCorrecao {
  aplicado: boolean;
  itens: Array<{ vendaId: string; vendaNumero: number; vendaData: string; produtoId: string; produtoNome: string; qtd: number; qtdBaixada: number }>;
  totalItens: number;
  totalUnidades: number;
}
