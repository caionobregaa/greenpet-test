import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
export interface ListClientesInput {
    q?: string;
    cidade?: string;
    page?: number;
    limit?: number;
}
export interface ListClientesOutput {
    clientes: Cliente[];
    total: number;
}
export declare class ListClientesUseCase {
    private readonly repo;
    constructor(repo: IClienteRepository);
    execute(input?: ListClientesInput): Promise<ListClientesOutput>;
}
//# sourceMappingURL=list-clientes.use-case.d.ts.map