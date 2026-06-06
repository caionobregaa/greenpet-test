import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '../../errors/domain-error.js'

type MaybeDomainError = {
  code?: string
  statusCode?: number
  fields?: Record<string, string>
  message: string
}

function isDomainError(error: unknown): error is MaybeDomainError & { code: string; statusCode: number } {
  const e = error as MaybeDomainError
  return (
    error instanceof DomainError ||
    (typeof e.code === 'string' &&
      typeof e.statusCode === 'number' &&
      e.statusCode >= 400 &&
      e.statusCode < 600 &&
      !e.code.startsWith('P') &&
      !e.code.startsWith('FST_'))
  )
}

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (isDomainError(error)) {
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

  // Prisma P2002 — unique constraint violation
  const prismaCode = (error as { code?: string }).code
  if (prismaCode === 'P2002') {
    const target = ((error as { meta?: { target?: string[] } }).meta?.target ?? []).join(', ')
    reply.status(409).send({
      error: {
        code: 'CONFLICT',
        message: target ? `${target} já está em uso` : 'Registro já existe',
      },
    })
    return
  }

  // Prisma P2025 — registro não encontrado
  if (prismaCode === 'P2025') {
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: 'Registro não encontrado' },
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
