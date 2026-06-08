-- AlterTable: compras - add formaPag column
DO $$
BEGIN
  ALTER TABLE "compras" ADD COLUMN "formaPag" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- AlterTable: compra_itens - add pesoKg column
DO $$
BEGIN
  ALTER TABLE "compra_itens" ADD COLUMN "pesoKg" DECIMAL(8, 2);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
