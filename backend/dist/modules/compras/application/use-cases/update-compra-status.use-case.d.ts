import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import type { Compra } from '../../domain/entities/compra.entity.js';
export declare class UpdateCompraStatusUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute({ id, acao }: {
        id: string;
        acao: 'confirmar' | 'receber' | 'cancelar';
    }): Promise<Compra>;
}
//# sourceMappingURL=update-compra-status.use-case.d.ts.map