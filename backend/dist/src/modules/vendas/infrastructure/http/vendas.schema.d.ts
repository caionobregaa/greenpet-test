import { z } from 'zod';
export declare const CreateVendaSchema: z.ZodObject<{
    clienteId: z.ZodString;
    animalId: z.ZodOptional<z.ZodString>;
    data: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    formaPag: z.ZodEnum<["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodArray<z.ZodObject<{
        produtoId: z.ZodOptional<z.ZodString>;
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
        produtoId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    clienteId: string;
    formaPag: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[];
    data?: Date | undefined;
    obs?: string | undefined;
    animalId?: string | undefined;
}, {
    clienteId: string;
    formaPag: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[];
    data?: string | undefined;
    obs?: string | undefined;
    animalId?: string | undefined;
}>;
export declare const ListVendasQuerySchema: z.ZodObject<{
    clienteId: z.ZodOptional<z.ZodString>;
    animalId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    clienteId?: string | undefined;
    animalId?: string | undefined;
}, {
    clienteId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    animalId?: string | undefined;
}>;
//# sourceMappingURL=vendas.schema.d.ts.map