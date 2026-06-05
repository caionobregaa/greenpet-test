import type { Animal } from '../entities/animal.entity.js'

export interface IAnimalRepository {
  findById(id: string): Promise<Animal | null>
  findMany(params: {
    clienteId?: string
    q?: string
    page: number
    limit: number
  }): Promise<{ animais: Animal[]; clienteNomes: Record<string, string>; total: number }>
  save(animal: Animal): Promise<void>
}
