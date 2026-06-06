import { z } from 'zod';
export declare const CreateEstoqueItemSchema: z.ZodObject<{
    produtoId: z.ZodString;
    quantidade: z.ZodNumber;
    validade: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    lote: z.ZodOptional<z.ZodString>;
    obs: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    produtoId: string;
    quantidade: number;
    obs?: string | undefined;
    validade?: Date | undefined;
    lote?: string | undefined;
}, {
    produtoId: string;
    quantidade: number;
    obs?: string | undefined;
    validade?: string | undefined;
    lote?: string | undefined;
}>;
export declare const UpdateEstoqueItemSchema: z.ZodObject<{
    quantidade: z.ZodOptional<z.ZodNumber>;
    validade: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, Date | null, string | null | undefined>;
    lote: z.ZodOptional<z.ZodString>;
    obs: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    validade: Date | null;
    obs?: string | undefined;
    quantidade?: number | undefined;
    lote?: string | undefined;
}, {
    obs?: string | undefined;
    validade?: string | null | undefined;
    quantidade?: number | undefined;
    lote?: string | undefined;
}>;
export declare const ListEstoqueQuerySchema: z.ZodObject<{
    produtoId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    produtoId?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    produtoId?: string | undefined;
}>;
//# sourceMappingURL=estoque.schema.d.ts.map