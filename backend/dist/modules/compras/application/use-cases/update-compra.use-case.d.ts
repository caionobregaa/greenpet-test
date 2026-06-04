import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import type { Compra, CompraItemData } from '../../domain/entities/compra.entity.js';
export interface UpdateCompraInput {
    id: string;
    fornecedor?: string;
    obs?: string;
    dataPedido?: Date;
    itens?: CompraItemData[];
}
export declare class UpdateCompraUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute(input: UpdateCompraInput): Promise<Compra>;
}
//# sourceMappingURL=update-compra.use-case.d.ts.map