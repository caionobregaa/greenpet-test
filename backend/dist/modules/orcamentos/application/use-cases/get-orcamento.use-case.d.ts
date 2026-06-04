import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { Orcamento } from '../../domain/entities/orcamento.entity.js';
export declare class GetOrcamentoUseCase {
    private readonly repo;
    constructor(repo: IOrcamentoRepository);
    execute({ id }: {
        id: string;
    }): Promise<Orcamento>;
}
//# sourceMappingURL=get-orcamento.use-case.d.ts.map