-- Nome de produto é único só entre ATIVOS (specs/produtos/rules.md).
-- O índice único global antigo contava produtos excluídos (soft delete) e bloqueava
-- para sempre o nome de qualquer produto já excluído, com "nome já está em uso".
DROP INDEX IF EXISTS "produtos_nome_key";
CREATE UNIQUE INDEX IF NOT EXISTS "produtos_nome_ativo_key" ON "produtos"("nome") WHERE "deletedAt" IS NULL;
