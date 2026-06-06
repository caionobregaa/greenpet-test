"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAnimalUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class UpdateAnimalUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const { id, ...fields } = input;
        const animal = await this.repo.findById(id);
        if (!animal)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Animal não encontrado');
        animal.update({
            ...fields,
            especie: fields.especie,
            sexo: fields.sexo,
        });
        await this.repo.save(animal);
        return animal;
    }
}
exports.UpdateAnimalUseCase = UpdateAnimalUseCase;
//# sourceMappingURL=update-animal.use-case.js.map