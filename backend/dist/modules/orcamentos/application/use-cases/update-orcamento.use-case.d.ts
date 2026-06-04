import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { OrcamentoItemData } from '../../domain/entities/orcamento.entity.js';
export interface UpdateOrcamentoInput {
    id: string;
    validade?: Date;
    obs?: string;
    itens?: OrcamentoItemData[];
}
export declare class UpdateOrcamentoUseCase {
    private readonly repo;
    constructor(repo: IOrcamentoRepository);
    execute(input: UpdateOrcamentoInput): Promise<import("../../domain/entities/orcamento.entity.js").Orcamento>;
}
//# sourceMappingURL=update-orcamento.use-case.d.ts.map