import type { IClienteRepository } from '../../../../../src/modules/clientes/domain/repositories/cliente.repository.interface';
import { Cliente } from '../../../../../src/modules/clientes/domain/entities/cliente.entity';
import type { Animal } from '../../../../../src/modules/animais/domain/entities/animal.entity';
export declare class InMemoryClienteRepository implements IClienteRepository {
    items: Cliente[];
    simulateActiveSales: boolean;
    /** Quando definido, numeroDeAnimais é computado dinamicamente a partir desta lista. */
    animalItems?: Animal[];
    private withCount;
    findById(id: string): Promise<Cliente | null>;
    findByEmail(email: string): Promise<Cliente | null>;
    findByCpf(cpf: string): Promise<Cliente | null>;
    findMany(params: {
        q?: string;
        cidade?: string;
        page: number;
        limit: number;
    }): Promise<{
        clientes: Cliente[];
        total: number;
    }>;
    save(cliente: Cliente): Promise<void>;
    hasActiveSalesOrQuotes(_clienteId: string): Promise<boolean>;
}
//# sourceMappingURL=in-memory-cliente.repository.d.ts.map