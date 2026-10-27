-- Valor em aberto / pagamento parcial (specs/vendas/spec-v6.md).
-- Vendas existentes ficam com "valorRecebido" NULL = pagas por inteiro.

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN "valorRecebido" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "venda_pagamentos" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "formaPag" TEXT NOT NULL,
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venda_pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "venda_pagamentos_vendaId_idx" ON "venda_pagamentos"("vendaId");

-- AddForeignKey
ALTER TABLE "venda_pagamentos" ADD CONSTRAINT "venda_pagamentos_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
