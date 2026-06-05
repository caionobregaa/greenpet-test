-- CreateTable: estoque_itens
CREATE TABLE IF NOT EXISTS "estoque_itens" (
    "id"         TEXT NOT NULL,
    "produtoId"  TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "validade"   TIMESTAMP(3),
    "lote"       TEXT,
    "obs"        TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "estoque_itens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: estoque_itens -> produtos
DO $$
BEGIN
  ALTER TABLE "estoque_itens"
    ADD CONSTRAINT "estoque_itens_produtoId_fkey"
    FOREIGN KEY ("produtoId") REFERENCES "produtos"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: compras - add categoria column
DO $$
BEGIN
  ALTER TABLE "compras" ADD COLUMN "categoria" TEXT NOT NULL DEFAULT 'Produtos Pets';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- AlterTable: compras - add descricaoSimples column
DO $$
BEGIN
  ALTER TABLE "compras" ADD COLUMN "descricaoSimples" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
