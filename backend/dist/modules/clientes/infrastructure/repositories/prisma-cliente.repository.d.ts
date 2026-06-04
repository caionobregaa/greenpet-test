import type { PrismaClient } from '@prisma/client';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import { Cliente } from '../../domain/entities/cliente.entity.js';
export declare class PrismaClienteRepository implements IClienteRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
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
    private toDomain;
}
//# sourceMappingURL=prisma-cliente.repository.d.ts.map