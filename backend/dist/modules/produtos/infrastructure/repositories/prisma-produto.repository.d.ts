import type { PrismaClient } from '@prisma/client';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
import { Produto } from '../../domain/entities/produto.entity.js';
export declare class PrismaProdutoRepository implements IProdutoRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Produto | null>;
    findByNome(nome: string): Promise<Produto | null>;
    findMany(params: {
        q?: string;
        categoria?: string;
        especie?: string;
        page: number;
        limit: number;
    }): Promise<{
        produtos: Produto[];
        total: number;
    }>;
    save(produto: Produto): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-produto.repository.d.ts.map