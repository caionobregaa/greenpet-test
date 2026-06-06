import type { PrismaClient } from '@prisma/client';
import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js';
import { Compra } from '../../domain/entities/compra.entity.js';
export declare class PrismaCompraRepository implements ICompraRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Compra | null>;
    findMany(params: {
        status?: string;
        categoria?: string;
        fornecedor?: string;
        page: number;
        limit: number;
    }): Promise<{
        compras: Compra[];
        total: number;
    }>;
    save(compra: Compra): Promise<void>;
    delete(id: string): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-compra.repository.d.ts.map