import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
import type { Produto } from '../../domain/entities/produto.entity.js';
export declare class GetProdutoUseCase {
    private readonly repo;
    constructor(repo: IProdutoRepository);
    execute({ id }: {
        id: string;
    }): Promise<Produto>;
}
//# sourceMappingURL=get-produto.use-case.d.ts.map