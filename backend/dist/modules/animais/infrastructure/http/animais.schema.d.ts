import { z } from 'zod';
export declare const CreateAnimalSchema: z.ZodObject<{
    nome: z.ZodString;
    clienteId: z.ZodString;
    especie: z.ZodEnum<["Cão", "Gato"]>;
    raca: z.ZodOptional<z.ZodString>;
    sexo: z.ZodDefault<z.ZodEnum<["M", "F", "Indefinido"]>>;
    nascimento: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    peso: z.ZodDefault<z.ZodNumber>;
    obs: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    clienteId: string;
    especie: "Cão" | "Gato";
    sexo: "M" | "F" | "Indefinido";
    peso: number;
    obs?: string | undefined;
    raca?: string | undefined;
    nascimento?: Date | undefined;
}, {
    nome: string;
    clienteId: string;
    especie: "Cão" | "Gato";
    obs?: string | undefined;
    raca?: string | undefined;
    sexo?: "M" | "F" | "Indefinido" | undefined;
    nascimento?: string | undefined;
    peso?: number | undefined;
}>;
export declare const UpdateAnimalSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    obs: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    especie: z.ZodOptional<z.ZodEnum<["Cão", "Gato"]>>;
    raca: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sexo: z.ZodOptional<z.ZodDefault<z.ZodEnum<["M", "F", "Indefinido"]>>>;
    nascimento: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>>;
    peso: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nome?: string | undefined;
    obs?: string | undefined;
    especie?: "Cão" | "Gato" | undefined;
    raca?: string | undefined;
    sexo?: "M" | "F" | "Indefinido" | undefined;
    nascimento?: Date | undefined;
    peso?: number | undefined;
}, {
    nome?: string | undefined;
    obs?: string | undefined;
    especie?: "Cão" | "Gato" | undefined;
    raca?: string | undefined;
    sexo?: "M" | "F" | "Indefinido" | undefined;
    nascimento?: string | undefined;
    peso?: number | undefined;
}>;
export declare const ListAnimaisQuerySchema: z.ZodObject<{
    clienteId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    clienteId?: string | undefined;
}, {
    clienteId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=animais.schema.d.ts.map