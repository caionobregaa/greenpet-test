import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
import type { Animal } from '../../domain/entities/animal.entity.js';
export interface UpdateAnimalInput {
    id: string;
    nome?: string;
    especie?: string;
    raca?: string;
    sexo?: string;
    nascimento?: Date;
    peso?: number;
    obs?: string;
}
export declare class UpdateAnimalUseCase {
    private readonly repo;
    constructor(repo: IAnimalRepository);
    execute(input: UpdateAnimalInput): Promise<Animal>;
}
//# sourceMappingURL=update-animal.use-case.d.ts.map