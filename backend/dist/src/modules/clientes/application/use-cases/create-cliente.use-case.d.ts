import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
import { Cliente } from '../../domain/entities/cliente.entity.js';
export interface CreateClienteInput {
    nome: string;
    telefone: string;
    email?: string;
    cpf?: string;
    endereco?: string;
    cidade?: string;
    obs?: string;
}
export declare class CreateClienteUseCase {
    private readonly repo;
    constructor(repo: IClienteRepository);
    execute(input: CreateClienteInput): Promise<Cliente>;
}
//# sourceMappingURL=create-cliente.use-case.d.ts.map