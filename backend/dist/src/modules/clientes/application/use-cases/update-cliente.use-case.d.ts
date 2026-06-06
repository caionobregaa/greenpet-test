import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
export interface UpdateClienteInput {
    id: string;
    nome?: string;
    telefone?: string;
    email?: string;
    cpf?: string;
    endereco?: string;
    cidade?: string;
    obs?: string;
}
export declare class UpdateClienteUseCase {
    private readonly repo;
    constructor(repo: IClienteRepository);
    execute(input: UpdateClienteInput): Promise<Cliente>;
}
//# sourceMappingURL=update-cliente.use-case.d.ts.map