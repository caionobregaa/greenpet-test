import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
export declare class DeleteProdutoUseCase {
    private readonly repo;
    constructor(repo: IProdutoRepository);
    execute({ id }: {
        id: string;
    }): Promise<void>;
}
//# sourceMappingURL=delete-produto.use-case.d.ts.map