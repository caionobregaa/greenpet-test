"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesController = void 0;
const clientes_schema_js_1 = require("./clientes.schema.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
function toResponse(c) {
    return {
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        email: c.email,
        cpf: c.cpf,
        endereco: c.endereco,
        bairro: c.bairro,
        cidade: c.cidade,
        obs: c.obs,
        numeroDeAnimais: c.numeroDeAnimais,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}
function animalToResponse(a) {
    return {
        id: a.id,
        nome: a.nome,
        especie: a.especie,
        raca: a.raca,
        sexo: a.sexo,
        nascimento: a.nascimento,
        peso: a.peso,
    };
}
function vendaToResponse(v) {
    return {
        id: v.id,
        data: v.data,
        formaPag: v.formaPag,
        total: v.total,
        animalId: v.animalId,
        obs: v.obs,
    };
}
class ClientesController {
    createUseCase;
    updateUseCase;
    deleteUseCase;
    getDetailUseCase;
    listUseCase;
    constructor(createUseCase, updateUseCase, deleteUseCase, getDetailUseCase, listUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
        this.getDetailUseCase = getDetailUseCase;
        this.listUseCase = listUseCase;
    }
    async create(request, reply) {
        const body = clientes_schema_js_1.CreateClienteSchema.safeParse(request.body);
        if (!body.success) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        }
        const cliente = await this.createUseCase.execute(body.data);
        reply.status(201).send({ data: toResponse(cliente) });
    }
    async list(request, reply) {
        const query = clientes_schema_js_1.ListClientesQuerySchema.safeParse(request.query);
        if (!query.success) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', query.error.errors[0].message);
        }
        const result = await this.listUseCase.execute(query.data);
        reply.status(200).send({
            data: result.clientes.map(toResponse),
            meta: { page: query.data.page, limit: query.data.limit, total: result.total },
        });
    }
    async getOne(request, reply) {
        const { cliente, animais, vendas } = await this.getDetailUseCase.execute({ id: request.params.id });
        reply.status(200).send({
            data: {
                ...toResponse(cliente),
                animais: animais.map(animalToResponse),
                vendas: vendas.map(vendaToResponse),
            },
        });
    }
    async update(request, reply) {
        const body = clientes_schema_js_1.UpdateClienteSchema.safeParse(request.body);
        if (!body.success) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        }
        const cliente = await this.updateUseCase.execute({ id: request.params.id, ...body.data });
        reply.status(200).send({ data: toResponse(cliente) });
    }
    async delete(request, reply) {
        await this.deleteUseCase.execute({ id: request.params.id });
        reply.status(204).send();
    }
}
exports.ClientesController = ClientesController;
//# sourceMappingURL=clientes.controller.js.map