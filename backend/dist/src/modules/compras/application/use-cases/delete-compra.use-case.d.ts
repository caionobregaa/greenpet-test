import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
export declare class DeleteCompraUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-compra.use-case.d.ts.map