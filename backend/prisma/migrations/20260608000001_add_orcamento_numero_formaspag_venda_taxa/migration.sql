-- CreateSequence for orcamento sequential number
CREATE SEQUENCE IF NOT EXISTS orcamento_numero_seq START 1;

-- AlterTable: orcamentos
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "numero" INTEGER;
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "formasPag" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill numero for existing records in creation order
UPDATE "orcamentos" SET "numero" = sub.seq
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS seq
  FROM "orcamentos"
  WHERE "numero" IS NULL
) sub
WHERE "orcamentos".id = sub.id;

-- Set DEFAULT and NOT NULL on numero
ALTER TABLE "orcamentos" ALTER COLUMN "numero" SET DEFAULT nextval('orcamento_numero_seq');
ALTER TABLE "orcamentos" ALTER COLUMN "numero" SET NOT NULL;

-- Advance the sequence past existing records
SELECT setval('orcamento_numero_seq', COALESCE((SELECT MAX("numero") FROM "orcamentos"), 0) + 1, false);

-- AlterTable: vendas
ALTER TABLE "vendas" ADD COLUMN IF NOT EXISTS "taxaCartao" DOUBLE PRECISION NOT NULL DEFAULT 0;
