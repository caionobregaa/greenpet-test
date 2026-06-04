import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface.js';
import { Venda } from '@/modules/vendas/domain/entities/venda.entity.js';
export declare class ConverterOrcamentoUseCase {
    private readonly orcamentoRepo;
    private readonly vendaRepo;
    constructor(orcamentoRepo: IOrcamentoRepository, vendaRepo: IVendaRepository);
    execute({ id, formaPag }: {
        id: string;
        formaPag: string;
    }): Promise<Venda>;
}
//# sourceMappingURL=converter-orcamento.use-case.d.ts.map