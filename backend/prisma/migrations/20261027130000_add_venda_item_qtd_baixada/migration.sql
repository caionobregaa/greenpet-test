-- Quanto cada item de venda tirou do estoque (specs/estoque/spec-v2.md).

-- AlterTable
ALTER TABLE "venda_itens" ADD COLUMN "qtdBaixada" INTEGER;

-- Itens sem produto nunca mexem no estoque.
UPDATE "venda_itens" SET "qtdBaixada" = 0 WHERE "produtoId" IS NULL;

-- A baixa automática entrou em 25/06/2026 22:43 (Manaus) = 26/06/2026 02:43 UTC:
-- vendas a partir daí já tiveram a baixa feita na criação.
UPDATE "venda_itens" vi
SET "qtdBaixada" = vi.qtd
FROM "vendas" v
WHERE v.id = vi."vendaId"
  AND vi."produtoId" IS NOT NULL
  AND v."createdAt" >= TIMESTAMP '2026-06-26 02:43:11';

-- As demais (vendas anteriores, com produto) ficam NULL = pendentes da correção retroativa.
