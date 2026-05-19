import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'

export class DeleteClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    const hasLinks = await this.repo.hasActiveSalesOrQuotes(id)
    if (hasLinks) {
      throw new UnprocessableError('CLIENT_HAS_SALES', 'Cliente possui vendas ou orçamentos vinculados')
    }

    cliente.softDelete()
    await this.repo.save(cliente)
  }
}
