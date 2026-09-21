import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'

export class DeleteClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    // Clientes não podem ser excluídos se possuírem vendas ou orçamentos vinculados (specs/clientes/rules.md)
    const temVinculos = await this.repo.hasActiveSalesOrQuotes(id)
    if (temVinculos) throw new ConflictError('CLIENT_HAS_SALES', 'Cliente possui vendas ou orçamentos vinculados')

    // Soft-delete preserves all historical data (sales, orders, animals)
    cliente.softDelete()
    await this.repo.save(cliente)
  }
}
