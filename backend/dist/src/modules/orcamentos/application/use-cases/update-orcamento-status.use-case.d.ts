import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { Orcamento } from '../../domain/entities/orcamento.entity.js';
export declare class UpdateOrcamentoStatusUseCase {
    private readonly repo;
    constructor(repo: IOrcamentoRepository);
    execute({ id, acao }: {
        id: string;
        acao: 'aprovar' | 'recusar' | 'reabrir';
    }): Promise<Orcamento>;
}
//# sourceMappingURL=update-orcamento-status.use-case.d.ts.map