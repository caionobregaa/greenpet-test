import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js';
import type { Venda } from '../../domain/entities/venda.entity.js';
export declare class ListVendasUseCase {
    private readonly repo;
    constructor(repo: IVendaRepository);
    execute(params: {
        clienteId?: string;
        animalId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        vendas: Venda[];
        total: number;
    }>;
}
//# sourceMappingURL=list-vendas.use-case.d.ts.map