-- Brinde no orçamento (specs/orcamentos/spec-v5.md). Itens existentes ficam false.

-- AlterTable
ALTER TABLE "orcamento_itens" ADD COLUMN "brinde" BOOLEAN NOT NULL DEFAULT false;
