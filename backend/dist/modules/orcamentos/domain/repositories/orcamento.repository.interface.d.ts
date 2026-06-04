import type { Orcamento } from '../entities/orcamento.entity.js';
export interface IOrcamentoRepository {
    findById(id: string): Promise<Orcamento | null>;
    findMany(params: {
        clienteId?: string;
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
        orcamentos: Orcamento[];
        total: number;
    }>;
    save(orcamento: Orcamento): Promise<void>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=orcamento.repository.interface.d.ts.map