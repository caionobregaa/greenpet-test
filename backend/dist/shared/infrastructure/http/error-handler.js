"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const domain_error_js_1 = require("../../errors/domain-error.js");
function errorHandler(error, _request, reply) {
    if (error instanceof domain_error_js_1.DomainError) {
        reply.status(error.statusCode).send({
            error: {
                code: error.code,
                message: error.message,
                ...(error.fields ? { fields: error.fields } : {}),
            },
        });
        return;
    }
    // Fastify validation errors (from Zod schema)
    if ('statusCode' in error && error.statusCode === 400) {
        reply.status(400).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
            },
        });
        return;
    }
    // Prisma P2002 — unique constraint violation
    const prismaCode = error.code;
    if (prismaCode === 'P2002') {
        const target = (error.meta?.target ?? []).join(', ');
        reply.status(409).send({
            error: {
                code: 'CONFLICT',
                message: target ? `${target} já está em uso` : 'Registro já existe',
            },
        });
        return;
    }
    // Prisma P2025 — registro não encontrado
    if (prismaCode === 'P2025') {
        reply.status(404).send({
            error: { code: 'NOT_FOUND', message: 'Registro não encontrado' },
        });
        return;
    }
    console.error(error);
    reply.status(500).send({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
        },
    });
}
//# sourceMappingURL=error-handler.js.map