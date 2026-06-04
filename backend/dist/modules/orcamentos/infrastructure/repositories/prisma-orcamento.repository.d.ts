import type { PrismaClient } from '@prisma/client';
import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js';
import { Orcamento } from '../../domain/entities/orcamento.entity.js';
export declare class PrismaOrcamentoRepository implements IOrcamentoRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Orcamento | null>;
    findMany(params: {
        clienteId?: string;
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
        orcamentos: Orcamento[];
        total: number;
    }>;
    save(orcamento: Orcamento): Promise<void>;
    delete(id: string): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-orcamento.repository.d.ts.map