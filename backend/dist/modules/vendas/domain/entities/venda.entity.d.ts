import { AggregateRoot } from '../../../../src/shared/domain/aggregate-root.base.js';
import { Money } from '../../../../src/shared/domain/value-objects/money.vo.js';
declare const FORMAS_PAGAMENTO: readonly ["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"];
type FormaPag = (typeof FORMAS_PAGAMENTO)[number];
export interface VendaItemData {
    id?: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
}
export interface VendaItemReadOnly {
    id: string;
    produtoId?: string;
    nome: string;
    qtd: number;
    valorUnitario: number;
    total: number;
}
interface VendaProps {
    clienteId: string;
    animalId?: string;
    data: Date;
    formaPag: FormaPag;
    taxaCartao: number;
    total: Money;
    obs?: string;
    itens: VendaItemReadOnly[];
}
export declare class Venda extends AggregateRoot<VendaProps> {
    static create(data: {
        id?: string;
        clienteId: string;
        animalId?: string;
        data?: Date;
        formaPag: string;
        taxaCartao?: number;
        obs?: string;
        itens: VendaItemData[];
    }): Venda;
    get clienteId(): string;
    get animalId(): string | undefined;
    get data(): Date;
    get formaPag(): string;
    get taxaCartao(): number;
    get total(): number;
    get obs(): string | undefined;
    get itens(): VendaItemReadOnly[];
}
export {};
//# sourceMappingURL=venda.entity.d.ts.map