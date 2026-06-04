import { z } from 'zod';
export declare const CreateClienteSchema: z.ZodObject<{
    nome: z.ZodString;
    telefone: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    email: z.ZodOptional<z.ZodString>;
    cpf: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    endereco: z.ZodOptional<z.ZodString>;
    bairro: z.ZodOptional<z.ZodString>;
    cidade: z.ZodDefault<z.ZodString>;
    obs: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    telefone: string;
    cidade: string;
    email?: string | undefined;
    cpf?: string | undefined;
    endereco?: string | undefined;
    bairro?: string | undefined;
    obs?: string | undefined;
}, {
    nome: string;
    telefone: string;
    email?: string | undefined;
    cpf?: string | undefined;
    endereco?: string | undefined;
    bairro?: string | undefined;
    cidade?: string | undefined;
    obs?: string | undefined;
}>;
export declare const UpdateClienteSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    telefone: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cpf: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>>;
    endereco: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bairro: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cidade: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    obs: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    cpf?: string | undefined;
    endereco?: string | undefined;
    bairro?: string | undefined;
    cidade?: string | undefined;
    obs?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    cpf?: string | undefined;
    endereco?: string | undefined;
    bairro?: string | undefined;
    cidade?: string | undefined;
    obs?: string | undefined;
}>;
export declare const ListClientesQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    cidade: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    cidade?: string | undefined;
    q?: string | undefined;
}, {
    cidade?: string | undefined;
    q?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type CreateClienteBody = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteBody = z.infer<typeof UpdateClienteSchema>;
export type ListClientesQuery = z.infer<typeof ListClientesQuerySchema>;
//# sourceMappingURL=clientes.schema.d.ts.map