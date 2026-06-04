import { z } from 'zod';
export declare const CreateCompraSchema: z.ZodObject<{
    fornecedor: z.ZodString;
    dataPedido: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
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
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[];
    fornecedor: string;
    obs?: string | undefined;
    dataPedido?: Date | undefined;
}, {
    itens: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[];
    fornecedor: string;
    obs?: string | undefined;
    dataPedido?: string | undefined;
}>;
export declare const UpdateCompraSchema: z.ZodObject<{
    fornecedor: z.ZodOptional<z.ZodString>;
    dataPedido: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    obs: z.ZodOptional<z.ZodString>;
    itens: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    obs?: string | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[] | undefined;
    fornecedor?: string | undefined;
    dataPedido?: Date | undefined;
}, {
    obs?: string | undefined;
    itens?: {
        nome: string;
        qtd: number;
        valorUnitario: number;
        produtoId?: string | undefined;
    }[] | undefined;
    fornecedor?: string | undefined;
    dataPedido?: string | undefined;
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
    fornecedor: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "pendente" | "confirmado" | "recebido" | "cancelado" | undefined;
    fornecedor?: string | undefined;
}, {
    status?: "pendente" | "confirmado" | "recebido" | "cancelado" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    fornecedor?: string | undefined;
}>;
//# sourceMappingURL=compras.schema.d.ts.map