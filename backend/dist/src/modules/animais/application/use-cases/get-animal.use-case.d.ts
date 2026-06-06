import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
import type { Animal } from '../../domain/entities/animal.entity.js';
export declare class GetAnimalUseCase {
    private readonly repo;
    constructor(repo: IAnimalRepository);
    execute({ id }: {
        id: string;
    }): Promise<Animal>;
}
//# sourceMappingURL=get-animal.use-case.d.ts.map