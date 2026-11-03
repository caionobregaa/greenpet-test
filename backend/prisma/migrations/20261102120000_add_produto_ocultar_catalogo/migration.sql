-- Caixa "Ocultar produto no catálogo oficial" (specs/produtos/spec-v7.md).
-- Escrita à mão: só adiciona a coluna, sem os DROP falsos que o Prisma propõe
-- para "produtos_nome_ativo_key" e "venda_numero_seq" (ver schema.prisma).

ALTER TABLE "produtos" ADD COLUMN "ocultarCatalogo" BOOLEAN NOT NULL DEFAULT false;
