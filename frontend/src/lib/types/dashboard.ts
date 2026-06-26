export interface DashboardKPIs {
  periodo: { inicio: string; fim: string };
  totalReceita: number;
  totalLucroLiquido: number;
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
}
