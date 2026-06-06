import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js';
import type { IClienteRepository } from '../../../../modules/clientes/domain/repositories/cliente.repository.interface.js';
import { Venda, type VendaItemData } from '../../domain/entities/venda.entity.js';
export interface CreateVendaInput {
    clienteId: string;
    animalId?: string;
    data?: Date;
    formaPag: string;
    obs?: string;
    itens: VendaItemData[];
}
export declare class CreateVendaUseCase {
    private readonly vendaRepo;
    private readonly clienteRepo;
    constructor(vendaRepo: IVendaRepository, clienteRepo: IClienteRepository);
    execute(input: CreateVendaInput): Promise<Venda>;
}
//# sourceMappingURL=create-venda.use-case.d.ts.map