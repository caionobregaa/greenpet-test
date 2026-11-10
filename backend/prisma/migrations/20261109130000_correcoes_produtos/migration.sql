-- specs/produtos/spec-v11.md — correções de cadastro pedidas pelo usuário (09/11/2026).
-- Vendas, orçamentos e estoque apontam para o id do produto e não mudam.
-- O valor das sequences é lido em subconsulta escalar: uma sequence não pode entrar no FROM
-- de um UPDATE ("cannot lock rows in sequence").

-- 1) Rações úmidas com SKU de Petisco: Ração Úmida, SKU RUM-… na ordem do SKU antigo e
--    "Ração Úmida " no início do nome.
WITH alvo AS (
  SELECT "id", row_number() OVER (ORDER BY "sku") AS ordem
  FROM "produtos"
  WHERE "sku" IN ('PET-0020', 'PET-0021', 'PET-0022', 'PET-0023', 'PET-0024', 'PET-0025')
)
UPDATE "produtos" p
SET "categoria" = 'Ração Úmida',
    "sku" = 'RUM-' || lpad((
      GREATEST(
        (SELECT CASE WHEN is_called THEN last_value ELSE last_value - 1 END FROM produto_sku_rum_seq),
        (SELECT COALESCE(MAX(substring("sku" FROM 5)::int), 0) FROM "produtos" WHERE "sku" ~ '^RUM-[0-9]+$')
      ) + alvo.ordem
    )::text, 4, '0'),
    "nome" = CASE
      -- já começa com "Ração Úmida": não repete o prefixo
      WHEN lower(unaccent(p."nome")) LIKE 'racao umida%' THEN p."nome"
      -- nome com prefixo já usado por outro produto ativo: mantém o nome, para não duplicar
      WHEN EXISTS (
        SELECT 1 FROM "produtos" o
        WHERE o."deletedAt" IS NULL AND o."id" <> p."id" AND o."nome" = 'Ração Úmida ' || p."nome"
      ) THEN p."nome"
      ELSE 'Ração Úmida ' || p."nome"
    END
FROM alvo
WHERE p."id" = alvo."id";

-- 2) Simparic é medicamento: sai de Suplemento para Medicamento, com SKU MED-… na ordem do SKU antigo.
WITH alvo AS (
  SELECT "id", row_number() OVER (ORDER BY "sku") AS ordem
  FROM "produtos"
  WHERE "categoria" = 'Suplemento'
    AND ("nome" ILIKE '%simparic%' OR "marca" ILIKE 'simparic')
)
UPDATE "produtos" p
SET "categoria" = 'Medicamento',
    "sku" = 'MED-' || lpad((
      GREATEST(
        (SELECT CASE WHEN is_called THEN last_value ELSE last_value - 1 END FROM produto_sku_med_seq),
        (SELECT COALESCE(MAX(substring("sku" FROM 5)::int), 0) FROM "produtos" WHERE "sku" ~ '^MED-[0-9]+$')
      ) + alvo.ordem
    )::text, 4, '0'),
    "categoriasAdicionais" = array_remove(p."categoriasAdicionais", 'Medicamento')
FROM alvo
WHERE p."id" = alvo."id";

-- 3) "Gonden" é erro de digitação de "Golden", no nome e na marca, mantendo maiúsculas e minúsculas.
--    Nome que ficaria igual ao de outro produto ativo fica como está.
UPDATE "produtos" p
SET "nome" = regexp_replace(regexp_replace(regexp_replace(p."nome", '\mGONDEN\M', 'GOLDEN', 'g'), '\mGonden\M', 'Golden', 'g'), '\mgonden\M', 'golden', 'g')
WHERE p."nome" ~* '\mgonden\M'
  AND NOT EXISTS (
    SELECT 1 FROM "produtos" o
    WHERE o."deletedAt" IS NULL AND o."id" <> p."id"
      AND o."nome" = regexp_replace(regexp_replace(regexp_replace(p."nome", '\mGONDEN\M', 'GOLDEN', 'g'), '\mGonden\M', 'Golden', 'g'), '\mgonden\M', 'golden', 'g')
  );

UPDATE "produtos"
SET "marca" = regexp_replace(regexp_replace(regexp_replace("marca", '\mGONDEN\M', 'GOLDEN', 'g'), '\mGonden\M', 'Golden', 'g'), '\mgonden\M', 'golden', 'g')
WHERE "marca" ~* '\mgonden\M';

-- 4) Os próximos cadastros continuam depois do maior código existente.
SELECT setval('produto_sku_rum_seq',
  GREATEST(1, (SELECT COALESCE(MAX(substring("sku" FROM 5)::int), 0) FROM "produtos" WHERE "sku" ~ '^RUM-[0-9]+$')),
  (SELECT COUNT(*) > 0 FROM "produtos" WHERE "sku" ~ '^RUM-[0-9]+$'));
SELECT setval('produto_sku_med_seq',
  GREATEST(1, (SELECT COALESCE(MAX(substring("sku" FROM 5)::int), 0) FROM "produtos" WHERE "sku" ~ '^MED-[0-9]+$')),
  (SELECT COUNT(*) > 0 FROM "produtos" WHERE "sku" ~ '^MED-[0-9]+$'));
