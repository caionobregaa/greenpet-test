-- CreateTable: RecompraManual
CREATE TABLE "recompra_manuais" (
    "id"           TEXT NOT NULL,
    "clienteId"    TEXT NOT NULL,
    "animalId"     TEXT NOT NULL DEFAULT '',
    "produtoId"    TEXT NOT NULL,
    "ultimaCompra" TIMESTAMP(3),
    "previsaoData" TIMESTAMP(3),
    "diasRecompra" INTEGER,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recompra_manuais_pkey" PRIMARY KEY ("id")
);

-- AlterTable: OrcamentoItem add desconto column
ALTER TABLE "orcamento_itens" ADD COLUMN "desconto" DOUBLE PRECISION NOT NULL DEFAULT 0;
