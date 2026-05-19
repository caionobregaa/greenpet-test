import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteClienteUseCase } from '@/modules/clientes/application/use-cases/delete-cliente.use-case'
import { InMemoryClienteRepository } from './fakes/in-memory-cliente.repository'
import { Cliente } from '@/modules/clientes/domain/entities/cliente.entity'

describe('DeleteClienteUseCase', () => {
  let repo: InMemoryClienteRepository
  let useCase: DeleteClienteUseCase

  beforeEach(() => {
    repo = new InMemoryClienteRepository()
    useCase = new DeleteClienteUseCase(repo)
  })

  it('marca cliente como deletado quando sem vínculos', async () => {
    const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
    await repo.save(c)

    await useCase.execute({ id: c.id })

    const updated = repo.items.find((i) => i.id === c.id)
    expect(updated!.isActive).toBe(false)
  })

  it('lança NOT_FOUND quando cliente não existe', async () => {
    await expect(useCase.execute({ id: 'nao-existe-uuid-valido-1234567890' })).rejects.toMatchObject(
      { code: 'NOT_FOUND' },
    )
  })

  it('lança CLIENT_HAS_SALES quando cliente tem vendas ativas', async () => {
    const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
    await repo.save(c)
    repo.simulateActiveSales = true

    await expect(useCase.execute({ id: c.id })).rejects.toMatchObject({ code: 'CLIENT_HAS_SALES' })
  })
})
