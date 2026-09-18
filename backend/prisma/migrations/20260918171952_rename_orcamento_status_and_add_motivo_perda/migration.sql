-- Renomear valores existentes do status (coluna continua String, sem enum Postgres)
UPDATE "orcamentos" SET "status" = 'aberto'  WHERE "status" = 'pendente';
UPDATE "orcamentos" SET "status" = 'fechado' WHERE "status" = 'aprovado';
UPDATE "orcamentos" SET "status" = 'perdido' WHERE "status" = 'recusado';

-- Novas colunas
ALTER TABLE "orcamentos" ADD COLUMN "motivoPerda" TEXT;
ALTER TABLE "orcamentos" ADD COLUMN "descontoRecompraAplicado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "orcamentos" ADD COLUMN "valorDescontoRecompra" DECIMAL(10,2);

-- Novo default da coluna status
ALTER TABLE "orcamentos" ALTER COLUMN "status" SET DEFAULT 'aberto';

-- Defensivo: registros legados 'recusado' que virem 'perdido' sem motivo caem em 'Outro'
UPDATE "orcamentos" SET "motivoPerda" = 'Outro' WHERE "status" = 'perdido' AND "motivoPerda" IS NULL;
