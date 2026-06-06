"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAnimalUseCase = void 0;
const animal_entity_js_1 = require("../../domain/entities/animal.entity.js");
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class CreateAnimalUseCase {
    animalRepo;
    clienteRepo;
    constructor(animalRepo, clienteRepo) {
        this.animalRepo = animalRepo;
        this.clienteRepo = clienteRepo;
    }
    async execute(input) {
        const cliente = await this.clienteRepo.findById(input.clienteId);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        const animal = animal_entity_js_1.Animal.create(input);
        await this.animalRepo.save(animal);
        return animal;
    }
}
exports.CreateAnimalUseCase = CreateAnimalUseCase;
//# sourceMappingURL=create-animal.use-case.js.map