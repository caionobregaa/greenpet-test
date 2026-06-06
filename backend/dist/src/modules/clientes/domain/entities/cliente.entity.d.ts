import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { CPF } from '../../../../shared/domain/value-objects/cpf.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
interface ClienteProps {
    nome: string;
    telefone: Phone;
    email?: Email;
    cpf?: CPF;
    endereco?: string;
    bairro?: string;
    cidade: string;
    obs?: string;
    deletedAt?: Date;
    numeroDeAnimais?: number;
}
export declare class Cliente extends AggregateRoot<ClienteProps> {
    static create(data: {
        id?: string;
        nome: string;
        telefone: string;
        email?: string;
        cpf?: string;
        endereco?: string;
        bairro?: string;
        cidade?: string;
        obs?: string;
        deletedAt?: Date;
        numeroDeAnimais?: number;
    }): Cliente;
    /** Reconstitui uma entidade a partir de dados do banco, sem revalidar o telefone. */
    static fromPersistence(data: {
        id: string;
        nome: string;
        telefone: string;
        email?: string;
        cpf?: string;
        endereco?: string;
        bairro?: string;
        cidade?: string;
        obs?: string;
        deletedAt?: Date;
        numeroDeAnimais?: number;
    }): Cliente;
    get nome(): string;
    get telefone(): string;
    get email(): string | undefined;
    get cpf(): string | undefined;
    get endereco(): string | undefined;
    get bairro(): string | undefined;
    get cidade(): string;
    get obs(): string | undefined;
    get deletedAt(): Date | undefined;
    get isActive(): boolean;
    get numeroDeAnimais(): number;
    update(fields: {
        nome?: string;
        telefone?: string;
        email?: string;
        cpf?: string;
        endereco?: string;
        bairro?: string;
        cidade?: string;
        obs?: string;
    }): void;
    softDelete(): void;
}
export {};
//# sourceMappingURL=cliente.entity.d.ts.map