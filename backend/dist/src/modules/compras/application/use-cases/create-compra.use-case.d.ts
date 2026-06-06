import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import { Compra, type CompraItemData } from '../../domain/entities/compra.entity.js';
export interface CreateCompraInput {
    fornecedor: string;
    dataPedido?: Date;
    categoria?: string;
    descricaoSimples?: string;
    totalManual?: number;
    obs?: string;
    itens: CompraItemData[];
}
export declare class CreateCompraUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute(input: CreateCompraInput): Promise<Compra>;
}
//# sourceMappingURL=create-compra.use-case.d.ts.map