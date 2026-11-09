-- specs/produtos/spec-v10.md: rações úmidas que ficaram com SKU antigo (RAC-…) passam
-- para Ração Úmida com SKU novo RUM-…, na ordem do SKU antigo. Vendas, orçamentos e estoque
-- apontam para o id do produto, não para o SKU, e não mudam. Só altera rações.

UPDATE "produtos" p
SET "categoria" = 'Ração Úmida',
    "sku" = 'RUM-' || lpad(nextval('produto_sku_rum_seq')::text, 4, '0')
FROM (
  SELECT "id" FROM "produtos"
  WHERE "sku" IN ('RAC-0175', 'RAC-0055', 'RAC-0054', 'RAC-0053', 'RAC-0051', 'RAC-0052', 'RAC-0131')
    AND "categoria" IN ('Ração', 'Ração Úmida')
  ORDER BY "sku"
) alvo
WHERE p."id" = alvo."id";
