-- Estoque mínimo configurável por produto (nullable — produto sem valor
-- configurado simplesmente não entra na checagem de "estoque baixo").
ALTER TABLE "produtos" ADD COLUMN "estoqueMinimo" INTEGER;
