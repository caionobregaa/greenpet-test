import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { IVendaRepository } from '../../../../src/modules/vendas/domain/repositories/venda.repository.interface.js';
import { Venda } from '../../../../src/modules/vendas/domain/entities/venda.entity.js';
export declare class ConverterOrcamentoUseCase {
    private readonly orcamentoRepo;
    private readonly vendaRepo;
    constructor(orcamentoRepo: IOrcamentoRepository, vendaRepo: IVendaRepository);
    execute({ id, formaPag, taxaCartao }: {
        id: string;
        formaPag: string;
        taxaCartao?: number;
    }): Promise<Venda>;
}
//# sourceMappingURL=converter-orcamento.use-case.d.ts.map