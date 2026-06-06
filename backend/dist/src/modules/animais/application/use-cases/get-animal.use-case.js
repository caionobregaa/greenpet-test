"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAnimalUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class GetAnimalUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const animal = await this.repo.findById(id);
        if (!animal)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Animal não encontrado');
        return animal;
    }
}
exports.GetAnimalUseCase = GetAnimalUseCase;
//# sourceMappingURL=get-animal.use-case.js.map