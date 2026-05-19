import { describe, it, expect, beforeEach } from 'vitest'
import { CreateClienteUseCase } from '@/modules/clientes/application/use-cases/create-cliente.use-case'
import { InMemoryClienteRepository } from './fakes/in-memory-cliente.repository'

describe('CreateClienteUseCase', () => {
  let repo: InMemoryClienteRepository
  let useCase: CreateClienteUseCase

  beforeEach(() => {
    repo = new InMemoryClienteRepository()
    useCase = new CreateClienteUseCase(repo)
  })

  it('cria cliente com dados válidos', async () => {
    const cliente = await useCase.execute({
      nome: 'João Silva',
      telefone: '(92) 9 8765-4321',
    })
    expect(cliente.id).toBeTruthy()
    expect(cliente.nome).toBe('João Silva')
    expect(repo.items).toHaveLength(1)
  })

  it('lança EMAIL_ALREADY_EXISTS quando e-mail já existe', async () => {
    await useCase.execute({
      nome: 'João',
      telefone: '(92) 9 8765-4321',
      email: 'joao@test.com',
    })
    await expect(
      useCase.execute({ nome: 'Maria', telefone: '(92) 9 1111-2222', email: 'joao@test.com' }),
    ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' })
  })

  it('lança CPF_ALREADY_EXISTS quando CPF já existe', async () => {
    await useCase.execute({
      nome: 'João',
      telefone: '(92) 9 8765-4321',
      cpf: '529.982.247-25',
    })
    await expect(
      useCase.execute({ nome: 'Maria', telefone: '(92) 9 1111-2222', cpf: '529.982.247-25' }),
    ).rejects.toMatchObject({ code: 'CPF_ALREADY_EXISTS' })
  })
})
