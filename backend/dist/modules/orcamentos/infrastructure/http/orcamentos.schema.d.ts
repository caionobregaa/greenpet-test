import { z } from 'zod';
export declare const UpdateOrcamentoSchema: z.ZodObject<{
    validade: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodOptional<z.ZodArray<z.ZodObject<{
        produtoId: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
        nome: z.ZodString;
        qtd: z.ZodNumber;
        valorUnitario: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    obs?: string | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[] | undefined;
    validade?: Date | undefined;
}, {
    obs?: string | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
    }[] | undefined;
    validade?: string | undefined;
}>;
export declare const CreateOrcamentoSchema: z.ZodObject<{
    clienteId: z.ZodOptional<z.ZodString>;
    animalId: z.ZodOptional<z.ZodString>;
    data: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    validade: z.ZodEffects<z.ZodString, Date, string>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodArray<z.ZodObject<{
        produtoId: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
        nome: z.ZodString;
        qtd: z.ZodNumber;
        valorUnitario: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[];
    validade: Date;
    data?: Date | undefined;
    obs?: string | undefined;
    clienteId?: string | undefined;
    animalId?: string | undefined;
}, {
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
    }[];
    validade: string;
    data?: string | undefined;
    obs?: string | undefined;
    clienteId?: string | undefined;
    animalId?: string | undefined;
}>;
export declare const UpdateOrcamentoStatusSchema: z.ZodObject<{
    acao: z.ZodEnum<["aprovar", "recusar", "reabrir"]>;
}, "strip", z.ZodTypeAny, {
    acao: "aprovar" | "recusar" | "reabrir";
}, {
    acao: "aprovar" | "recusar" | "reabrir";
}>;
export declare const ConverterOrcamentoSchema: z.ZodObject<{
    formaPag: z.ZodEnum<["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]>;
}, "strip", z.ZodTypeAny, {
    formaPag: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";
}, {
    formaPag: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";
}>;
export declare const ListOrcamentosQuerySchema: z.ZodObject<{
    clienteId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pendente", "aprovado", "recusado"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "recusado" | "pendente" | "aprovado" | undefined;
    clienteId?: string | undefined;
}, {
    status?: "recusado" | "pendente" | "aprovado" | undefined;
    clienteId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=orcamentos.schema.d.ts.map