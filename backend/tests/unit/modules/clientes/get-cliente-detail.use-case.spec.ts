import { describe, it, expect, beforeEach } from 'vitest'
import { GetClienteDetailUseCase } from '@/modules/clientes/application/use-cases/get-cliente-detail.use-case'
import { InMemoryClienteRepository } from './fakes/in-memory-cliente.repository'
import { Cliente } from '@/modules/clientes/domain/entities/cliente.entity'
import { Animal } from '@/modules/animais/domain/entities/animal.entity'
import { Venda } from '@/modules/vendas/domain/entities/venda.entity'
import type { IAnimalRepository } from '@/modules/animais/domain/repositories/animal.repository.interface'
import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface'

class InMemoryAnimalRepository implements IAnimalRepository {
  public items: Animal[] = []

  async findById(id: string): Promise<Animal | null> {
    return this.items.find((a) => a.id === id && a.isActive) ?? null
  }

  async findMany(params: { clienteId?: string; page: number; limit: number }) {
    const filtered = this.items.filter((a) => {
      if (!a.isActive) return false
      if (params.clienteId) return a.clienteId === params.clienteId
      return true
    })
    return { animais: filtered, clienteNomes: {} as Record<string, string>, total: filtered.length }
  }

  async save(animal: Animal): Promise<void> {
    const idx = this.items.findIndex((a) => a.id === animal.id)
    if (idx >= 0) this.items[idx] = animal
    else this.items.push(animal)
  }
}

class InMemoryVendaRepository implements IVendaRepository {
  public items: Venda[] = []

  async findById(id: string): Promise<Venda | null> {
    return this.items.find((v) => v.id === id) ?? null
  }

  async findMany(params: { clienteId?: string; animalId?: string; page: number; limit: number }) {
    const filtered = this.items.filter((v) => {
      if (params.clienteId && v.clienteId !== params.clienteId) return false
      if (params.animalId && v.animalId !== params.animalId) return false
      return true
    })
    return { vendas: filtered, total: filtered.length }
  }

  async save(venda: Venda): Promise<void> {
    this.items.push(venda)
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((v) => v.id !== id)
  }
}

describe('GetClienteDetailUseCase', () => {
  let clienteRepo: InMemoryClienteRepository
  let animalRepo: InMemoryAnimalRepository
  let vendaRepo: InMemoryVendaRepository
  let useCase: GetClienteDetailUseCase

  beforeEach(() => {
    clienteRepo = new InMemoryClienteRepository()
    animalRepo = new InMemoryAnimalRepository()
    vendaRepo = new InMemoryVendaRepository()
    useCase = new GetClienteDetailUseCase(clienteRepo, animalRepo, vendaRepo)
  })

  it('retorna cliente com animais e vendas relacionados', async () => {
    const cliente = Cliente.create({ nome: 'Maria Silva', telefone: '(92) 9 8765-4321' })
    await clienteRepo.save(cliente)

    const animal = Animal.create({ nome: 'Rex', clienteId: cliente.id, especie: 'Cão' })
    await animalRepo.save(animal)

    const venda = Venda.create({
      clienteId: cliente.id,
      formaPag: 'Pix',
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 50 }],
    })
    await vendaRepo.save(venda)

    const result = await useCase.execute({ id: cliente.id })

    expect(result.cliente.id).toBe(cliente.id)
    expect(result.animais).toHaveLength(1)
    expect(result.animais[0].nome).toBe('Rex')
    expect(result.vendas).toHaveLength(1)
    expect(result.vendas[0].formaPag).toBe('Pix')
  })

  it('retorna arrays vazios quando cliente não tem animais nem vendas', async () => {
    const cliente = Cliente.create({ nome: 'João Sem Pet', telefone: '(92) 9 1111-2222' })
    await clienteRepo.save(cliente)

    const result = await useCase.execute({ id: cliente.id })

    expect(result.cliente.id).toBe(cliente.id)
    expect(result.animais).toHaveLength(0)
    expect(result.vendas).toHaveLength(0)
  })

  it('não retorna animais de outros clientes', async () => {
    const c1 = Cliente.create({ nome: 'Cliente Um', telefone: '(92) 9 1111-2222' })
    const c2 = Cliente.create({ nome: 'Cliente Dois', telefone: '(92) 9 3333-4444' })
    await clienteRepo.save(c1)
    await clienteRepo.save(c2)

    const animalC2 = Animal.create({ nome: 'Mimi', clienteId: c2.id, especie: 'Gato' })
    await animalRepo.save(animalC2)

    const result = await useCase.execute({ id: c1.id })

    expect(result.animais).toHaveLength(0)
  })

  it('lança NOT_FOUND quando cliente não existe', async () => {
    await expect(useCase.execute({ id: 'id-inexistente' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('animal excluído não é contabilizado em numeroDeAnimais', async () => {
    clienteRepo.animalItems = animalRepo.items

    const cliente = Cliente.create({ nome: 'Pedro Silva', telefone: '(92) 9 9999-1111' })
    await clienteRepo.save(cliente)

    const animal = Animal.create({ nome: 'Thor', clienteId: cliente.id, especie: 'Cão' })
    await animalRepo.save(animal)

    const antes = await useCase.execute({ id: cliente.id })
    expect(antes.animais).toHaveLength(1)
    expect(antes.cliente.numeroDeAnimais).toBe(1)

    animal.softDelete()
    await animalRepo.save(animal)

    const depois = await useCase.execute({ id: cliente.id })
    expect(depois.animais).toHaveLength(0)
    expect(depois.cliente.numeroDeAnimais).toBe(0)
  })
})
