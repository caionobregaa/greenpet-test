import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
import type { Produto } from '../../domain/entities/produto.entity.js';
export declare class UpdateProdutoUseCase {
    private readonly repo;
    constructor(repo: IProdutoRepository);
    execute(input: {
        id: string;
    } & Parameters<Produto['update']>[0]): Promise<Produto>;
}
//# sourceMappingURL=update-produto.use-case.d.ts.map