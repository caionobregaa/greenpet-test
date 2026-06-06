import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import type { Compra } from '../../domain/entities/compra.entity.js';
export declare class ListComprasUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute(params: {
        status?: string;
        categoria?: string;
        fornecedor?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        compras: Compra[];
        total: number;
    }>;
}
//# sourceMappingURL=list-compras.use-case.d.ts.map