import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js';
import { Produto } from '../../domain/entities/produto.entity.js';
export interface CreateProdutoInput {
    nome: string;
    categoria: string;
    especie?: string;
    subCategoria?: string;
    marca?: string;
    fornecedor?: string;
    pesoEmbalagem?: number;
    valorCusto?: number;
    valorVenda: number;
    margemCartao?: number;
    margemImposto?: number;
    margemOperacao?: number;
    margemLucro?: number;
    diasRecompra?: number;
    descricao?: string;
}
export declare class CreateProdutoUseCase {
    private readonly repo;
    constructor(repo: IProdutoRepository);
    execute(input: CreateProdutoInput): Promise<Produto>;
}
//# sourceMappingURL=create-produto.use-case.d.ts.map