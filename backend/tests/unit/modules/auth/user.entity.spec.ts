import { describe, it, expect } from 'vitest'
import { User } from '@/modules/auth/domain/entities/user.entity'

describe('User entity', () => {
  describe('create', () => {
    it('cria usuário com dados válidos', () => {
      const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' })
      expect(user.nome).toBe('Admin')
      expect(user.email).toBe('admin@greenpet.com')
      expect(user.loginAttempts).toBe(0)
      expect(user.lockedUntil).toBeUndefined()
    })
  })

  describe('recordFailedLogin', () => {
    it('incrementa tentativas a cada chamada', () => {
      const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' })
      user.recordFailedLogin()
      user.recordFailedLogin()
      expect(user.loginAttempts).toBe(2)
      expect(user.isLocked).toBe(false)
    })

    it('bloqueia conta na 5ª falha e define lockedUntil', () => {
      const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' })
      for (let i = 0; i < 5; i++) user.recordFailedLogin()
      expect(user.isLocked).toBe(true)
      expect(user.lockedUntil).toBeDefined()
    })

    it('lockedUntil é aproximadamente 15 minutos no futuro', () => {
      const before = Date.now()
      const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' })
      for (let i = 0; i < 5; i++) user.recordFailedLogin()
      const lockMs = user.lockedUntil!.getTime()
      expect(lockMs).toBeGreaterThan(before + 14 * 60 * 1000)
      expect(lockMs).toBeLessThan(before + 16 * 60 * 1000)
    })
  })

  describe('resetLoginAttempts', () => {
    it('zera tentativas e remove bloqueio', () => {
      const user = User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' })
      for (let i = 0; i < 5; i++) user.recordFailedLogin()
      user.resetLoginAttempts()
      expect(user.loginAttempts).toBe(0)
      expect(user.isLocked).toBe(false)
      expect(user.lockedUntil).toBeUndefined()
    })
  })

  describe('isLocked', () => {
    it('retorna false quando lockedUntil é no passado', () => {
      const user = User.create({
        nome: 'Admin',
        email: 'a@b.com',
        senhaHash: 'h',
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() - 1000),
      })
      expect(user.isLocked).toBe(false)
    })

    it('retorna true quando lockedUntil é no futuro', () => {
      const user = User.create({
        nome: 'Admin',
        email: 'a@b.com',
        senhaHash: 'h',
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 60_000),
      })
      expect(user.isLocked).toBe(true)
    })
  })
})
