export interface ComparativoItem {
  atual: number;
  anterior: number;
  variacaoPercentual: number | null;
}

export interface DashboardKPIs {
  periodo: { inicio: string; fim: string };
  totalReceita: number;
  totalLucroLiquido: number;
  totalTaxasCartao: number;
  totalLucroLiquidoReal: number;
  totalVendas: number;
  ticketMedio: number;
  totalCustoAquisicao: number;
  topClientes: Array<{
    clienteId: string;
    nome: string;
    totalGasto: number;
    vendas: number;
  }>;
  topProdutos: Array<{
    produtoId: string;
    nome: string;
    totalVendido: number;
    quantidade: number;
  }>;
  receitaPorMes: Array<{
    mes: string;
    receita: number;
    vendas: number;
  }>;
  comprasPorFornecedor: Array<{
    fornecedor: string;
    totalComprado: number;
    compras: number;
  }>;
  vendasPorFormaPagamento: Array<{
    formaPag: string;
    total: number;
    vendas: number;
  }>;
  despesasPorCategoria: Array<{
    categoria: string;
    total: number;
    compras: number;
  }>;
  curvaResumo: { A: number; B: number; C: number };
  comparativoPeriodoAnterior: {
    totalReceita: ComparativoItem;
    totalLucroLiquidoReal: ComparativoItem;
    totalVendas: ComparativoItem;
    ticketMedio: ComparativoItem;
    totalCustoAquisicao: ComparativoItem;
  };
}
