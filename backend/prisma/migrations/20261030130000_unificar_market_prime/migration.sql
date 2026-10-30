-- "Market/Prime" é a distribuidora MARKET (specs/produtos/spec-v6.md).
-- Em compras, só "Produtos Pets": nas outras categorias o campo é "Fonte / Referência".

UPDATE "produtos"
SET "fornecedor" = 'MARKET'
WHERE regexp_replace(lower(unaccent("fornecedor")), '[^a-z0-9]', '', 'g') = 'marketprime';

UPDATE "compras"
SET "fornecedor" = 'MARKET'
WHERE "categoria" = 'Produtos Pets'
  AND regexp_replace(lower(unaccent("fornecedor")), '[^a-z0-9]', '', 'g') = 'marketprime';
