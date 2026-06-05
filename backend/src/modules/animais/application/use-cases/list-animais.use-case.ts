import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import type { Animal } from '../../domain/entities/animal.entity.js'

export class ListAnimaisUseCase {
  constructor(private readonly repo: IAnimalRepository) {}

  async execute(params: {
    clienteId?: string
    q?: string
    page?: number
    limit?: number
  }): Promise<{ animais: Animal[]; clienteNomes: Record<string, string>; total: number }> {
    return this.repo.findMany({
      clienteId: params.clienteId,
      q: params.q,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
