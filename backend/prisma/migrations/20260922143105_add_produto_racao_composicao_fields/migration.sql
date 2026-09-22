-- AlterTable: campos opcionais usados pela composição automática de nome para produtos
-- de categoria "Ração" (specs/produtos/spec-v2.md). Nullable, sem impacto em produtos
-- ou categorias existentes.
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "faseDaVida" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "porte" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "sabor" TEXT;
