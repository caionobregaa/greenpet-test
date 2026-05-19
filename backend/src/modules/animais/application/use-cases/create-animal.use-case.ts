import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface.js'
import { Animal } from '../../domain/entities/animal.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface CreateAnimalInput {
  nome: string
  clienteId: string
  especie: string
  raca?: string
  sexo?: string
  nascimento?: Date
  peso?: number
  obs?: string
}

export class CreateAnimalUseCase {
  constructor(
    private readonly animalRepo: IAnimalRepository,
    private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: CreateAnimalInput): Promise<Animal> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    const animal = Animal.create(input)
    await this.animalRepo.save(animal)
    return animal
  }
}
