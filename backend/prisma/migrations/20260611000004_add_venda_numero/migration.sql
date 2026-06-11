CREATE SEQUENCE IF NOT EXISTS venda_numero_seq;
ALTER TABLE "vendas" ADD COLUMN "numero" INTEGER NOT NULL DEFAULT nextval('venda_numero_seq'::regclass);
