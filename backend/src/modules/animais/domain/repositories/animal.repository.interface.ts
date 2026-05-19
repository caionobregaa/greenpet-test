import type { Animal } from '../entities/animal.entity.js'

export interface IAnimalRepository {
  findById(id: string): Promise<Animal | null>
  findMany(params: {
    clienteId?: string
    page: number
    limit: number
  }): Promise<{ animais: Animal[]; total: number }>
  save(animal: Animal): Promise<void>
}
