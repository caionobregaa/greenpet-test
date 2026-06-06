import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js';
import type { Venda } from '../../domain/entities/venda.entity.js';
export declare class GetVendaUseCase {
    private readonly repo;
    constructor(repo: IVendaRepository);
    execute({ id }: {
        id: string;
    }): Promise<Venda>;
}
//# sourceMappingURL=get-venda.use-case.d.ts.map