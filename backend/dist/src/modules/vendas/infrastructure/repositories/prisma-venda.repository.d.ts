import type { PrismaClient } from '@prisma/client';
import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js';
import { Venda } from '../../domain/entities/venda.entity.js';
export declare class PrismaVendaRepository implements IVendaRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Venda | null>;
    findMany(params: {
        clienteId?: string;
        animalId?: string;
        page: number;
        limit: number;
    }): Promise<{
        vendas: Venda[];
        total: number;
    }>;
    save(venda: Venda): Promise<void>;
    delete(id: string): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-venda.repository.d.ts.map