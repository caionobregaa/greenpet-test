import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import type { Animal } from '../../domain/entities/animal.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetAnimalUseCase {
  constructor(private readonly repo: IAnimalRepository) {}

  async execute({ id }: { id: string }): Promise<Animal> {
    const animal = await this.repo.findById(id)
    if (!animal) throw new NotFoundError('NOT_FOUND', 'Animal não encontrado')
    return animal
  }
}
