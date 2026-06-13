-- Normalize all DUNORTE spelling variants to "DUNORTE"
-- Catches: dunorte, dunort, DuNort, DUNORT, Dunorte, etc.
UPDATE "produtos"
SET "fornecedor" = 'DUNORTE'
WHERE LOWER("fornecedor") LIKE '%dunort%'
  AND "deletedAt" IS NULL;
