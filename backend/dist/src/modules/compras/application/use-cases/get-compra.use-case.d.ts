import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import type { Compra } from '../../domain/entities/compra.entity.js';
export declare class GetCompraUseCase {
    private readonly repo;
    constructor(repo: ICompraRepository);
    execute({ id }: {
        id: string;
    }): Promise<Compra>;
}
//# sourceMappingURL=get-compra.use-case.d.ts.map