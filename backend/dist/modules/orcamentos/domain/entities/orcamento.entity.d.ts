import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
export type OrcamentoStatus = 'pendente' | 'aprovado' | 'recusado';
export interface OrcamentoItemData {
    id?: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
}
export interface OrcamentoItemReadOnly {
    id: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
    total: number;
}
interface OrcamentoProps {
    clienteId?: string;
    animalId?: string;
    data: Date;
    validade: Date;
    status: OrcamentoStatus;
    total: Money;
    obs?: string;
    vendaId?: string;
    itens: OrcamentoItemReadOnly[];
}
export declare class Orcamento extends AggregateRoot<OrcamentoProps> {
    static create(data: {
        id?: string;
        clienteId?: string;
        animalId?: string;
        data?: Date;
        validade: Date;
        status?: OrcamentoStatus;
        obs?: string;
        vendaId?: string;
        itens: OrcamentoItemData[];
    }): Orcamento;
    get clienteId(): string | undefined;
    get animalId(): string | undefined;
    get data(): Date;
    get validade(): Date;
    get status(): OrcamentoStatus;
    get total(): number;
    get obs(): string | undefined;
    get vendaId(): string | undefined;
    get itens(): OrcamentoItemReadOnly[];
    get vencido(): boolean;
    aprovar(): void;
    recusar(): void;
    reabrir(): void;
    vincularVenda(vendaId: string): void;
    update(fields: {
        validade?: Date;
        obs?: string;
        itens?: OrcamentoItemData[];
    }): void;
}
export {};
//# sourceMappingURL=orcamento.entity.d.ts.map