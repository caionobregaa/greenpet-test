import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import type { IClienteRepository } from '../../../../modules/clientes/domain/repositories/cliente.repository.interface.js';
import { Orcamento, type OrcamentoItemData } from '../../domain/entities/orcamento.entity.js';
export interface CreateOrcamentoInput {
    clienteId?: string;
    animalId?: string;
    data?: Date;
    validade: Date;
    obs?: string;
    itens: OrcamentoItemData[];
}
export declare class CreateOrcamentoUseCase {
    private readonly orcamentoRepo;
    private readonly clienteRepo;
    constructor(orcamentoRepo: IOrcamentoRepository, clienteRepo: IClienteRepository);
    execute(input: CreateOrcamentoInput): Promise<Orcamento>;
}
//# sourceMappingURL=create-orcamento.use-case.d.ts.map