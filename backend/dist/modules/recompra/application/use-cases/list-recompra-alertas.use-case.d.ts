import type { PrismaRecompraRepository, RecompraAlerta } from '../../infrastructure/repositories/prisma-recompra.repository.js';
export { type UrgencyLevel } from '../../infrastructure/repositories/prisma-recompra.repository.js';
export declare class ListRecompraAlertasUseCase {
    private readonly repo;
    constructor(repo: PrismaRecompraRepository);
    execute(params: {
        clienteId?: string;
        urgencia?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        alertas: RecompraAlerta[];
        total: number;
    }>;
}
//# sourceMappingURL=list-recompra-alertas.use-case.d.ts.map