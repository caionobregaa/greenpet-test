import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import type { IAnimalRepository } from '@/modules/animais/domain/repositories/animal.repository.interface.js';
import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
import type { Animal } from '@/modules/animais/domain/entities/animal.entity.js';
import type { Venda } from '@/modules/vendas/domain/entities/venda.entity.js';
export interface ClienteDetailOutput {
    cliente: Cliente;
    animais: Animal[];
    vendas: Venda[];
}
export declare class GetClienteDetailUseCase {
    private readonly clienteRepo;
    private readonly animalRepo;
    private readonly vendaRepo;
    constructor(clienteRepo: IClienteRepository, animalRepo: IAnimalRepository, vendaRepo: IVendaRepository);
    execute({ id }: {
        id: string;
    }): Promise<ClienteDetailOutput>;
}
//# sourceMappingURL=get-cliente-detail.use-case.d.ts.map