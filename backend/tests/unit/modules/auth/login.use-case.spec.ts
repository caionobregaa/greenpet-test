import { describe, it, expect, beforeEach } from 'vitest'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import type { IJwtService } from '@/modules/auth/application/use-cases/login.use-case'
import { InMemoryUserRepository } from './fakes/in-memory-user.repository'
import { InMemoryRefreshTokenRepository } from './fakes/in-memory-refresh-token.repository'
import { User } from '@/modules/auth/domain/entities/user.entity'
import { Password } from '@/modules/auth/domain/value-objects/password.vo'

const fakeJwt: IJwtService = {
  sign: (_payload, _exp) => 'fake.jwt.token',
}

describe('LoginUseCase', () => {
  let userRepo: InMemoryUserRepository
  let refreshRepo: InMemoryRefreshTokenRepository
  let useCase: LoginUseCase

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository()
    refreshRepo = new InMemoryRefreshTokenRepository()
    useCase = new LoginUseCase(userRepo, refreshRepo, fakeJwt, 28800, 30)

    const hash = await Password.hash('senha123')
    const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: hash })
    await userRepo.save(user)
  })

  it('retorna token e refreshToken com credenciais válidas', async () => {
    const result = await useCase.execute({
      email: 'admin@greenpet.com',
      password: 'senha123',
    })
    expect(result.token).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.expiresIn).toBe(28800)
    expect(result.user.email).toBe('admin@greenpet.com')
  })

  it('reseta tentativas de login após sucesso', async () => {
    const user = await userRepo.findByEmail('admin@greenpet.com')
    user!.recordFailedLogin()
    await userRepo.save(user!)

    await useCase.execute({ email: 'admin@greenpet.com', password: 'senha123' })

    const updated = await userRepo.findByEmail('admin@greenpet.com')
    expect(updated!.loginAttempts).toBe(0)
  })

  it('lança INVALID_CREDENTIALS para senha errada', async () => {
    await expect(
      useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('lança INVALID_CREDENTIALS para e-mail inexistente (sem enumerar usuários)', async () => {
    await expect(
      useCase.execute({ email: 'ninguem@greenpet.com', password: 'senha123' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('lança ACCOUNT_LOCKED quando conta está bloqueada', async () => {
    const user = await userRepo.findByEmail('admin@greenpet.com')
    for (let i = 0; i < 5; i++) user!.recordFailedLogin()
    await userRepo.save(user!)

    await expect(
      useCase.execute({ email: 'admin@greenpet.com', password: 'senha123' }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED' })
  })

  it('incrementa loginAttempts a cada senha errada', async () => {
    await useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' }).catch(() => {})
    await useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' }).catch(() => {})

    const user = await userRepo.findByEmail('admin@greenpet.com')
    expect(user!.loginAttempts).toBe(2)
  })
})
