import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
export declare class DeleteOrcamentoUseCase {
    private readonly repo;
    constructor(repo: IOrcamentoRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-orcamento.use-case.d.ts.map