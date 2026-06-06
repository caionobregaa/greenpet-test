import type { Venda } from '../entities/venda.entity.js';
export interface IVendaRepository {
    findById(id: string): Promise<Venda | null>;
    findMany(params: {
        clienteId?: string;
        animalId?: string;
        page: number;
        limit: number;
    }): Promise<{
        vendas: Venda[];
        total: number;
    }>;
    save(venda: Venda): Promise<void>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=venda.repository.interface.d.ts.map