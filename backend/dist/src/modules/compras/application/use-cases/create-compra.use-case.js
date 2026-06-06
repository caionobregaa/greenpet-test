"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCompraUseCase = void 0;
const compra_entity_js_1 = require("../../domain/entities/compra.entity.js");
class CreateCompraUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const compra = compra_entity_js_1.Compra.create(input);
        await this.repo.save(compra);
        return compra;
    }
}
exports.CreateCompraUseCase = CreateCompraUseCase;
//# sourceMappingURL=create-compra.use-case.js.map