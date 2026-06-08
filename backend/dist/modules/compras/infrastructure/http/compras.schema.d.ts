import { z } from 'zod';
export declare const CreateCompraSchema: z.ZodObject<{
    fornecedor: z.ZodString;
    dataPedido: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    categoria: z.ZodDefault<z.ZodString>;
    descricaoSimples: z.ZodOptional<z.ZodString>;
    formaPag: z.ZodOptional<z.ZodEnum<["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]>>;
    totalManual: z.ZodOptional<z.ZodNumber>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodDefault<z.ZodArray<z.ZodObject<{
        produtoId: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
        nome: z.ZodString;
        qtd: z.ZodNumber;
        pesoKg: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodNumber>>, number | undefined, number | null | undefined>;
        valorUnitario: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
        pesoKg?: number | undefined;
    }, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
        pesoKg?: number | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
        pesoKg?: number | undefined;
    }[];
    categoria: string;
    fornecedor: string;
    obs?: string | undefined;
    formaPag?: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto" | undefined;
    dataPedido?: Date | undefined;
    descricaoSimples?: string | undefined;
    totalManual?: number | undefined;
}, {
    fornecedor: string;
    obs?: string | undefined;
    formaPag?: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto" | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
        pesoKg?: number | null | undefined;
    }[] | undefined;
    categoria?: string | undefined;
    dataPedido?: string | undefined;
    descricaoSimples?: string | undefined;
    totalManual?: number | undefined;
}>;
export declare const UpdateCompraSchema: z.ZodObject<{
    fornecedor: z.ZodOptional<z.ZodString>;
    dataPedido: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    categoria: z.ZodOptional<z.ZodString>;
    descricaoSimples: z.ZodOptional<z.ZodString>;
    formaPag: z.ZodOptional<z.ZodEnum<["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]>>;
    totalManual: z.ZodOptional<z.ZodNumber>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodOptional<z.ZodArray<z.ZodObject<{
        produtoId: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
        nome: z.ZodString;
        qtd: z.ZodNumber;
        pesoKg: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodNumber>>, number | undefined, number | null | undefined>;
        valorUnitario: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
        pesoKg?: number | undefined;
    }, {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
        pesoKg?: number | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    obs?: string | undefined;
    formaPag?: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto" | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
        pesoKg?: number | undefined;
    }[] | undefined;
    categoria?: string | undefined;
    fornecedor?: string | undefined;
    dataPedido?: Date | undefined;
    descricaoSimples?: string | undefined;
    totalManual?: number | undefined;
}, {
    obs?: string | undefined;
    formaPag?: "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto" | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | null | undefined;
        pesoKg?: number | null | undefined;
    }[] | undefined;
    categoria?: string | undefined;
    fornecedor?: string | undefined;
    dataPedido?: string | undefined;
    descricaoSimples?: string | undefined;
    totalManual?: number | undefined;
}>;
export declare const UpdateCompraStatusSchema: z.ZodObject<{
    acao: z.ZodEnum<["confirmar", "receber", "cancelar"]>;
}, "strip", z.ZodTypeAny, {
    acao: "confirmar" | "receber" | "cancelar";
}, {
    acao: "confirmar" | "receber" | "cancelar";
}>;
export declare const ListComprasQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pendente", "confirmado", "recebido", "cancelado"]>>;
    categoria: z.ZodOptional<z.ZodString>;
    fornecedor: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "pendente" | "confirmado" | "recebido" | "cancelado" | undefined;
    categoria?: string | undefined;
    fornecedor?: string | undefined;
}, {
    status?: "pendente" | "confirmado" | "recebido" | "cancelado" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    categoria?: string | undefined;
    fornecedor?: string | undefined;
}>;
//# sourceMappingURL=compras.schema.d.ts.map