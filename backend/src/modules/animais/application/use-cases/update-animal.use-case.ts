import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import type { Animal } from '../../domain/entities/animal.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface UpdateAnimalInput {
  id: string
  nome?: string
  especie?: string
  raca?: string
  sexo?: string
  nascimento?: Date
  peso?: number
  obs?: string
}

export class UpdateAnimalUseCase {
  constructor(private readonly repo: IAnimalRepository) {}

  async execute(input: UpdateAnimalInput): Promise<Animal> {
    const { id, ...fields } = input
    const animal = await this.repo.findById(id)
    if (!animal) throw new NotFoundError('NOT_FOUND', 'Animal não encontrado')
    animal.update({
      ...fields,
      especie: fields.especie as 'Cão' | 'Gato' | undefined,
      sexo: fields.sexo as 'M' | 'F' | 'Indefinido' | undefined,
    })
    await this.repo.save(animal)
    return animal
  }
}
