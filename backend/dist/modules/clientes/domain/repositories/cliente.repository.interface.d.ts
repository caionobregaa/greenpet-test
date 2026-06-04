import type { Cliente } from '../entities/cliente.entity.js';
export interface IClienteRepository {
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
    hasActiveSalesOrQuotes(clienteId: string): Promise<boolean>;
}
//# sourceMappingURL=cliente.repository.interface.d.ts.map