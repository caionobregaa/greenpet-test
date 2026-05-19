import type { PrismaRecompraRepository, RecompraAlerta, UrgencyLevel } from '../../infrastructure/repositories/prisma-recompra.repository.js'

export { type UrgencyLevel } from '../../infrastructure/repositories/prisma-recompra.repository.js'

export class ListRecompraAlertasUseCase {
  constructor(private readonly repo: PrismaRecompraRepository) {}

  async execute(params: {
    clienteId?: string
    urgencia?: string
    page?: number
    limit?: number
  }): Promise<{ alertas: RecompraAlerta[]; total: number }> {
    return this.repo.findAlertas({
      clienteId: params.clienteId,
      urgencia: params.urgencia as UrgencyLevel | undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
