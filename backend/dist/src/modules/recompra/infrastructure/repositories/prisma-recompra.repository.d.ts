import type { PrismaClient } from '@prisma/client';
import { type UrgencyLevel } from '../../domain/services/recompra-alert.service.js';
export type { UrgencyLevel } from '../../domain/services/recompra-alert.service.js';
export interface RecompraAlerta {
    clienteId: string;
    clienteNome: string;
    animalId?: string;
    animalNome?: string;
    produtoId: string;
    produtoNome: string;
    diasRecompra: number;
    ultimaCompra: Date;
    diasRestantes: number;
    urgencia: UrgencyLevel;
}
export declare class PrismaRecompraRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAlertas(params: {
        clienteId?: string;
        urgencia?: UrgencyLevel;
        page: number;
        limit: number;
    }): Promise<{
        alertas: RecompraAlerta[];
        total: number;
    }>;
}
//# sourceMappingURL=prisma-recompra.repository.d.ts.map