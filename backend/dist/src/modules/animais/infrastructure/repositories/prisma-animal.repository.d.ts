import type { PrismaClient } from '@prisma/client';
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
import { Animal } from '../../domain/entities/animal.entity.js';
export declare class PrismaAnimalRepository implements IAnimalRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<Animal | null>;
    findMany(params: {
        clienteId?: string;
        q?: string;
        page: number;
        limit: number;
    }): Promise<{
        animais: Animal[];
        clienteNomes: Record<string, string>;
        total: number;
    }>;
    save(animal: Animal): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-animal.repository.d.ts.map