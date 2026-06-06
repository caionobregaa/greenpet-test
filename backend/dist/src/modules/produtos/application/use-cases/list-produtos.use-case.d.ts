import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
import type { Produto } from '../../domain/entities/produto.entity.js';
export declare class ListProdutosUseCase {
    private readonly repo;
    constructor(repo: IProdutoRepository);
    execute(params: {
        q?: string;
        categoria?: string;
        especie?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        produtos: Produto[];
        total: number;
    }>;
}
//# sourceMappingURL=list-produtos.use-case.d.ts.map