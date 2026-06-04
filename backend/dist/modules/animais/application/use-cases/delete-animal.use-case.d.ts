import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
export declare class DeleteAnimalUseCase {
    private readonly repo;
    constructor(repo: IAnimalRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-animal.use-case.d.ts.map