import type { FastifyRequest, FastifyReply } from 'fastify'
import type { LoginUseCase } from '../../application/use-cases/login.use-case.js'
import type { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js'
import type { LogoutUseCase } from '../../application/use-cases/logout.use-case.js'
import { LoginBodySchema, RefreshBodySchema } from './auth.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = LoginBodySchema.safeParse(request.body)
    if (!body.success) {
      throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    }
    const result = await this.loginUseCase.execute(body.data)
    reply.status(200).send({ data: result })
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = RefreshBodySchema.safeParse(request.body)
    if (!body.success) {
      throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    }
    const result = await this.refreshTokenUseCase.execute(body.data.refreshToken)
    reply.status(200).send({ data: result })
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.user as { sub: string }
    await this.logoutUseCase.execute(user.sub)
    reply.status(204).send()
  }
}
