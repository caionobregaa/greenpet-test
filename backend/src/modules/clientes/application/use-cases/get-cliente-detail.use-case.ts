import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import type { IAnimalRepository } from '@/modules/animais/domain/repositories/animal.repository.interface.js'
import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface.js'
import type { Cliente } from '../../domain/entities/cliente.entity.js'
import type { Animal } from '@/modules/animais/domain/entities/animal.entity.js'
import type { Venda } from '@/modules/vendas/domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface ClienteDetailOutput {
  cliente: Cliente
  animais: Animal[]
  vendas: Venda[]
}

export class GetClienteDetailUseCase {
  constructor(
    private readonly clienteRepo: IClienteRepository,
    private readonly animalRepo: IAnimalRepository,
    private readonly vendaRepo: IVendaRepository,
  ) {}

  async execute({ id }: { id: string }): Promise<ClienteDetailOutput> {
    const cliente = await this.clienteRepo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    const [{ animais }, { vendas }] = await Promise.all([
      this.animalRepo.findMany({ clienteId: id, page: 1, limit: 1000 }),
      this.vendaRepo.findMany({ clienteId: id, page: 1, limit: 1000 }),
    ])

    return { cliente, animais, vendas }
  }
}
