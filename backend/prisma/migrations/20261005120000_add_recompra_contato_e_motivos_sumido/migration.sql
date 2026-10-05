-- CreateTable
CREATE TABLE "recompra_contatos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL DEFAULT '',
    "ultimaCompra" TIMESTAMP(3) NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoPor" TEXT NOT NULL,

    CONSTRAINT "recompra_contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_sumido_motivos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL DEFAULT '',
    "ultimaCompra" TIMESTAMP(3) NOT NULL,
    "motivos" TEXT[],
    "outroTexto" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPor" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_sumido_motivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recompra_contatos_clienteId_produtoId_animalId_ultimaCompra_key" ON "recompra_contatos"("clienteId", "produtoId", "animalId", "ultimaCompra");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_sumido_motivos_clienteId_produtoId_animalId_ultimaC_key" ON "cliente_sumido_motivos"("clienteId", "produtoId", "animalId", "ultimaCompra");

-- CreateIndex
CREATE INDEX "cliente_sumido_motivos_registradoEm_idx" ON "cliente_sumido_motivos"("registradoEm");
