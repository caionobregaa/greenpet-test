import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js';
import type { IClienteRepository } from '../../../../src/modules/clientes/domain/repositories/cliente.repository.interface.js';
import { Animal } from '../../domain/entities/animal.entity.js';
export interface CreateAnimalInput {
    nome: string;
    clienteId: string;
    especie: string;
    raca?: string;
    sexo?: string;
    nascimento?: Date;
    peso?: number;
    obs?: string;
}
export declare class CreateAnimalUseCase {
    private readonly animalRepo;
    private readonly clienteRepo;
    constructor(animalRepo: IAnimalRepository, clienteRepo: IClienteRepository);
    execute(input: CreateAnimalInput): Promise<Animal>;
}
//# sourceMappingURL=create-animal.use-case.d.ts.map