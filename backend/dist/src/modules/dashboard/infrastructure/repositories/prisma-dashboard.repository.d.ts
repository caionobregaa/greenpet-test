import type { PrismaClient } from '@prisma/client';
export interface DashboardKPIs {
    periodo: {
        inicio: string;
        fim: string;
    };
    totalReceita: number;
    totalVendas: number;
    ticketMedio: number;
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
export declare class PrismaDashboardRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    getKPIs(params: {
        inicio: Date;
        fim: Date;
    }): Promise<DashboardKPIs>;
}
//# sourceMappingURL=prisma-dashboard.repository.d.ts.map