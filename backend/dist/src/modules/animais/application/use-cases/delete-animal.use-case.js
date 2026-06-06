"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAnimalUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class DeleteAnimalUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const animal = await this.repo.findById(id);
        if (!animal)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Animal não encontrado');
        animal.softDelete();
        await this.repo.save(animal);
    }
}
exports.DeleteAnimalUseCase = DeleteAnimalUseCase;
//# sourceMappingURL=delete-animal.use-case.js.map