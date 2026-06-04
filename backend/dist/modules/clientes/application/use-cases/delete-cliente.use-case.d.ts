import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js';
export declare class DeleteClienteUseCase {
    private readonly repo;
    constructor(repo: IClienteRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-cliente.use-case.d.ts.map