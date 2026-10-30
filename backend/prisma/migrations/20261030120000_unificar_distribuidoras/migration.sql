-- Une as grafias repetidas de distribuidoras no nome oficial (specs/produtos/spec-v5.md).
-- Só altera variações conhecidas; nomes desconhecidos ficam como estão.
-- Em compras, só "Produtos Pets": nas outras categorias o campo é "Fonte / Referência".

CREATE TEMP TABLE _distribuidora_alias (chave TEXT PRIMARY KEY, oficial TEXT NOT NULL) ON COMMIT DROP;

INSERT INTO _distribuidora_alias (chave, oficial) VALUES
  ('prime', 'PRIME'),
  ('zoocenter', 'ZOOCENTER'),
  ('market', 'MARKET'),
  ('petz', 'PETZ'),
  ('amazon', 'AMAZON'),
  ('basso', 'BASSO PANCOTTE'),
  ('bassopancotte', 'BASSO PANCOTTE'),
  ('bassopacotte', 'BASSO PANCOTTE'),
  ('bassoepancotte', 'BASSO PANCOTTE'),
  ('agrominas', 'AGROMINAS'),
  ('latidus', 'LATIDUS'),
  ('centralpec', 'CENTRAL PEC');

UPDATE "produtos" p
SET "fornecedor" = a.oficial
FROM _distribuidora_alias a
WHERE regexp_replace(lower(unaccent(p."fornecedor")), '[^a-z0-9]', '', 'g') = a.chave
  AND p."fornecedor" <> a.oficial;

UPDATE "produtos"
SET "fornecedor" = 'DUNORTE'
WHERE lower(unaccent("fornecedor")) LIKE '%dunort%'
  AND "fornecedor" <> 'DUNORTE';

UPDATE "compras" c
SET "fornecedor" = a.oficial
FROM _distribuidora_alias a
WHERE c."categoria" = 'Produtos Pets'
  AND regexp_replace(lower(unaccent(c."fornecedor")), '[^a-z0-9]', '', 'g') = a.chave
  AND c."fornecedor" <> a.oficial;

UPDATE "compras"
SET "fornecedor" = 'DUNORTE'
WHERE "categoria" = 'Produtos Pets'
  AND lower(unaccent("fornecedor")) LIKE '%dunort%'
  AND "fornecedor" <> 'DUNORTE';
