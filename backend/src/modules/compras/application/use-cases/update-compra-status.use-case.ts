import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import type { Compra } from '../../domain/entities/compra.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export class UpdateCompraStatusUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute({ id, acao }: { id: string; acao: 'confirmar' | 'receber' | 'cancelar' }): Promise<Compra> {
    const compra = await this.repo.findById(id)
    if (!compra) throw new NotFoundError('NOT_FOUND', 'Compra não encontrada')

    if (acao === 'confirmar') compra.confirmar()
    else if (acao === 'receber') compra.receber()
    else if (acao === 'cancelar') compra.cancelar()
    else throw new ValidationError('VALIDATION_ERROR', `Ação inválida: ${acao}`)

    await this.repo.save(compra)
    return compra
  }
}
