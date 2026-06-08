CREATE TABLE IF NOT EXISTS "recompra_dismissals" (
  "id"        TEXT        NOT NULL,
  "produtoId" TEXT        NOT NULL,
  "clienteId" TEXT        NOT NULL,
  "animalId"  TEXT        NOT NULL,
  "reason"    TEXT        NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recompra_dismissals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "recompra_dismissals_produtoId_clienteId_animalId_key"
  ON "recompra_dismissals"("produtoId", "clienteId", "animalId");
