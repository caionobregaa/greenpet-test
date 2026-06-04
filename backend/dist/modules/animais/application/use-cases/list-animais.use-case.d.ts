import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
import type { Animal } from '../../domain/entities/animal.entity.js';
export declare class ListAnimaisUseCase {
    private readonly repo;
    constructor(repo: IAnimalRepository);
    execute(params: {
        clienteId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        animais: Animal[];
        clienteNomes: Record<string, string>;
        total: number;
    }>;
}
//# sourceMappingURL=list-animais.use-case.d.ts.map