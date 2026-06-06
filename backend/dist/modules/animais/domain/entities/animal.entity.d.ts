import { AggregateRoot } from '../../../../src/shared/domain/aggregate-root.base.js';
declare const ESPECIES_VALIDAS: readonly ["Cão", "Gato"];
declare const SEXOS_VALIDOS: readonly ["M", "F", "Indefinido"];
type Especie = (typeof ESPECIES_VALIDAS)[number];
type Sexo = (typeof SEXOS_VALIDOS)[number];
interface AnimalProps {
    nome: string;
    clienteId: string;
    especie: Especie;
    raca?: string;
    sexo: Sexo;
    nascimento?: Date;
    peso: number;
    obs?: string;
    deletedAt?: Date;
}
export declare class Animal extends AggregateRoot<AnimalProps> {
    static create(data: {
        id?: string;
        nome: string;
        clienteId: string;
        especie: string;
        raca?: string;
        sexo?: string;
        nascimento?: Date;
        peso?: number;
        obs?: string;
        deletedAt?: Date;
    }): Animal;
    get nome(): string;
    get clienteId(): string;
    get especie(): string;
    get raca(): string | undefined;
    get sexo(): string;
    get nascimento(): Date | undefined;
    get peso(): number;
    get obs(): string | undefined;
    get deletedAt(): Date | undefined;
    get isActive(): boolean;
    get idadeCalculada(): {
        anos: number;
        meses: number;
    } | null;
    softDelete(): void;
    update(fields: Partial<Omit<AnimalProps, 'clienteId' | 'deletedAt'>>): void;
}
export {};
//# sourceMappingURL=animal.entity.d.ts.map