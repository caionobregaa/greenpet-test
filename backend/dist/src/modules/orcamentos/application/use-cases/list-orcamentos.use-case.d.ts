import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { Orcamento } from '../../domain/entities/orcamento.entity.js';
export declare class ListOrcamentosUseCase {
    private readonly repo;
    constructor(repo: IOrcamentoRepository);
    execute(params: {
        clienteId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        orcamentos: Orcamento[];
        total: number;
    }>;
}
//# sourceMappingURL=list-orcamentos.use-case.d.ts.map