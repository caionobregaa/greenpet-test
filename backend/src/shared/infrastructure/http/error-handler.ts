import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '../../errors/domain-error.js'

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof DomainError) {
    reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    })
    return
  }

  // Fastify validation errors (from Zod schema)
  if ('statusCode' in error && error.statusCode === 400) {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    })
    return
  }

  console.error(error)
  reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    },
  })
}
