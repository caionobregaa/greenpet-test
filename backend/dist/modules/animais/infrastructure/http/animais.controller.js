"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimaisController = void 0;
const animais_schema_js_1 = require("./animais.schema.js");
const validation_error_js_1 = require("@/shared/errors/validation.error.js");
function toResponse(a, clienteNome) {
    return {
        id: a.id,
        nome: a.nome,
        clienteId: a.clienteId,
        cliente: clienteNome ? { nome: clienteNome } : undefined,
        especie: a.especie,
        raca: a.raca,
        sexo: a.sexo,
        nascimento: a.nascimento,
        peso: a.peso,
        obs: a.obs,
        idadeCalculada: a.idadeCalculada,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}
class AnimaisController {
    createUseCase;
    updateUseCase;
    deleteUseCase;
    getUseCase;
    listUseCase;
    constructor(createUseCase, updateUseCase, deleteUseCase, getUseCase, listUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
        this.getUseCase = getUseCase;
        this.listUseCase = listUseCase;
    }
    async create(request, reply) {
        const body = animais_schema_js_1.CreateAnimalSchema.safeParse(request.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const animal = await this.createUseCase.execute(body.data);
        reply.status(201).send({ data: toResponse(animal) });
    }
    async list(request, reply) {
        const query = animais_schema_js_1.ListAnimaisQuerySchema.safeParse(request.query);
        if (!query.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', query.error.errors[0].message);
        const result = await this.listUseCase.execute(query.data);
        reply.status(200).send({
            data: result.animais.map((a) => toResponse(a, result.clienteNomes[a.id])),
            meta: { page: query.data.page, limit: query.data.limit, total: result.total },
        });
    }
    async getOne(request, reply) {
        const animal = await this.getUseCase.execute({ id: request.params.id });
        reply.status(200).send({ data: toResponse(animal) });
    }
    async update(request, reply) {
        const body = animais_schema_js_1.UpdateAnimalSchema.safeParse(request.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const animal = await this.updateUseCase.execute({ id: request.params.id, ...body.data });
        reply.status(200).send({ data: toResponse(animal) });
    }
    async delete(request, reply) {
        await this.deleteUseCase.execute({ id: request.params.id });
        reply.status(204).send();
    }
}
exports.AnimaisController = AnimaisController;
//# sourceMappingURL=animais.controller.js.map