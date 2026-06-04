-- Nullify orphaned produtoId values so the FK constraint can be created safely
UPDATE "venda_itens"
SET "produtoId" = NULL
WHERE "produtoId" IS NOT NULL
  AND "produtoId" NOT IN (SELECT "id" FROM "produtos");

-- AddForeignKey (idempotent: skip if constraint already exists)
DO $$
BEGIN
  ALTER TABLE "venda_itens"
    ADD CONSTRAINT "venda_itens_produtoId_fkey"
    FOREIGN KEY ("produtoId") REFERENCES "produtos"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
