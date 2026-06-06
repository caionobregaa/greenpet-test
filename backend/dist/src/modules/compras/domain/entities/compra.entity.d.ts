import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { Money } from '../../../../shared/domain/value-objects/money.vo.js';
export type CompraStatus = 'pendente' | 'confirmado' | 'recebido' | 'cancelado';
export interface CompraItemData {
    id?: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
}
export interface CompraItemReadOnly {
    id: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
    total: number;
}
interface CompraProps {
    fornecedor: string;
    dataPedido: Date;
    dataRecebimento?: Date;
    categoria: string;
    descricaoSimples?: string;
    status: CompraStatus;
    total: Money;
    obs?: string;
    itens: CompraItemReadOnly[];
}
export declare class Compra extends AggregateRoot<CompraProps> {
    static create(data: {
        id?: string;
        fornecedor: string;
        dataPedido?: Date;
        dataRecebimento?: Date;
        categoria?: string;
        descricaoSimples?: string;
        status?: CompraStatus;
        obs?: string;
        itens: CompraItemData[];
        totalManual?: number;
    }): Compra;
    get fornecedor(): string;
    get dataPedido(): Date;
    get dataRecebimento(): Date | undefined;
    get categoria(): string;
    get descricaoSimples(): string | undefined;
    get status(): CompraStatus;
    get total(): number;
    get obs(): string | undefined;
    get itens(): CompraItemReadOnly[];
    assertEditavel(): void;
    confirmar(): void;
    receber(): void;
    cancelar(): void;
    update(fields: {
        fornecedor?: string;
        obs?: string;
        dataPedido?: Date;
        categoria?: string;
        descricaoSimples?: string;
        totalManual?: number;
        itens?: CompraItemData[];
    }): void;
}
export {};
//# sourceMappingURL=compra.entity.d.ts.map