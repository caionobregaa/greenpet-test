import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class DeleteAnimalUseCase {
  constructor(private readonly repo: IAnimalRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const animal = await this.repo.findById(id)
    if (!animal) throw new NotFoundError('NOT_FOUND', 'Animal não encontrado')
    animal.softDelete()
    await this.repo.save(animal)
  }
}
