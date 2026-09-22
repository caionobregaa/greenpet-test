-- AlterTable: código de barras é um atributo do PRODUTO (specs/produtos/spec-v3.md).
-- semCodigoBarras confirma explicitamente a ausência (distingue de "ainda não informado").
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "codigoBarras" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "semCodigoBarras" BOOLEAN NOT NULL DEFAULT false;
