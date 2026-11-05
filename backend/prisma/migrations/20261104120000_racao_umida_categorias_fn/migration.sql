-- specs/produtos/spec-v9.md. Escrita à mão: sem os DROP falsos que o Prisma propõe
-- para "produtos_nome_ativo_key" e "venda_numero_seq" (ver schema.prisma).

-- Categorias adicionais (o produto também aparece nelas no site e nos filtros)
ALTER TABLE "produtos" ADD COLUMN "categoriasAdicionais" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- SKU da nova categoria Ração Úmida: RUM-0001, RUM-0002...
CREATE SEQUENCE IF NOT EXISTS produto_sku_rum_seq;

-- Rações com "Úmida", "Lata" ou "Sachê" no nome passam para Ração Úmida.
-- unaccent antes de lower: em collation C o lower() não trata letras acentuadas.
UPDATE "produtos"
SET "categoria" = 'Ração Úmida'
WHERE "categoria" = 'Ração'
  AND (
    lower(unaccent("nome")) LIKE '%umida%'
    OR lower(unaccent("nome")) ~ '(^|[^a-z])latas?([^a-z]|$)'
    OR lower(unaccent("nome")) ~ '(^|[^a-z])saches?([^a-z]|$)'
  );

-- "FN" isolado vira "Fórmula Natural" nas rações. Se o nome novo já existir em outro
-- produto ativo, o produto fica como está, para não duplicar nomes.
UPDATE "produtos" p
SET "nome" = regexp_replace(p."nome", '(^|[^A-Za-z0-9])FN([^A-Za-z0-9]|$)', '\1Fórmula Natural\2', 'g')
WHERE p."categoria" IN ('Ração', 'Ração Úmida')
  AND p."nome" ~ '(^|[^A-Za-z0-9])FN([^A-Za-z0-9]|$)'
  AND NOT EXISTS (
    SELECT 1 FROM "produtos" o
    WHERE o."deletedAt" IS NULL
      AND o."id" <> p."id"
      AND o."nome" = regexp_replace(p."nome", '(^|[^A-Za-z0-9])FN([^A-Za-z0-9]|$)', '\1Fórmula Natural\2', 'g')
  );

UPDATE "produtos" SET "marca" = 'Fórmula Natural' WHERE upper(trim("marca")) = 'FN';
