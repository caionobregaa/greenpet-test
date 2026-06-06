import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
export declare class GetClienteUseCase {
    private readonly repo;
    constructor(repo: IClienteRepository);
    execute({ id }: {
        id: string;
    }): Promise<Cliente>;
}
//# sourceMappingURL=get-cliente.use-case.d.ts.map