import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js';
export declare class DeleteVendaUseCase {
    private readonly repo;
    constructor(repo: IVendaRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-venda.use-case.d.ts.map