-- 1. Coluna nova, nullable por enquanto (backfill roda antes de travar NOT NULL)
ALTER TABLE "produtos" ADD COLUMN "sku" TEXT;

-- 2. Uma sequence por categoria — é o que vai gerar o número sequencial dos
--    próximos SKUs (mesma técnica já usada em venda_numero_seq/orcamento_numero_seq)
CREATE SEQUENCE IF NOT EXISTS produto_sku_rac_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_pet_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_sup_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_med_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_ace_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_hig_seq;
CREATE SEQUENCE IF NOT EXISTS produto_sku_ser_seq;

-- 3. Backfill dos produtos já cadastrados: numera cada um dentro da própria
--    categoria, do mais antigo (createdAt) para o mais novo, e monta o SKU
--    "PREFIXO-NNNN". Categoria fora do enum conhecido cai em "GEN-NNNN".
WITH numbered AS (
  SELECT id, categoria,
         ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY "createdAt" ASC, id ASC) AS rn
  FROM "produtos"
)
UPDATE "produtos" p
SET "sku" = (CASE numbered.categoria
    WHEN 'Ração' THEN 'RAC'
    WHEN 'Petisco' THEN 'PET'
    WHEN 'Suplemento' THEN 'SUP'
    WHEN 'Medicamento' THEN 'MED'
    WHEN 'Acessório' THEN 'ACE'
    WHEN 'Higiene' THEN 'HIG'
    WHEN 'Serviço' THEN 'SER'
    ELSE 'GEN'
  END) || '-' || LPAD(numbered.rn::text, 4, '0')
FROM numbered
WHERE p.id = numbered.id;

-- 4. Adianta cada sequence para o total já usado no backfill, para que o
--    próximo nextval() (nas próximas criações de produto) continue depois
--    do último número atribuído acima, sem colidir. setval() rejeita 0 como
--    valor (sequences começam em 1), então só ajustamos categorias que já
--    têm pelo menos um produto — as demais permanecem no valor inicial (1).
DO $$
DECLARE
  rec RECORD;
  cnt INTEGER;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('Ração',       'produto_sku_rac_seq'),
      ('Petisco',     'produto_sku_pet_seq'),
      ('Suplemento',  'produto_sku_sup_seq'),
      ('Medicamento', 'produto_sku_med_seq'),
      ('Acessório',   'produto_sku_ace_seq'),
      ('Higiene',     'produto_sku_hig_seq'),
      ('Serviço',     'produto_sku_ser_seq')
    ) AS t(categoria, seqname)
  LOOP
    SELECT COUNT(*) INTO cnt FROM "produtos" WHERE categoria = rec.categoria;
    IF cnt > 0 THEN
      PERFORM setval(rec.seqname::regclass, cnt, true);
    END IF;
  END LOOP;
END $$;

-- 5. Agora que toda linha tem valor, trava a coluna
ALTER TABLE "produtos" ALTER COLUMN "sku" SET NOT NULL;
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");
