-- Campanhas de promoção (specs/promocoes/spec-v1.md).
-- Escrita à mão: só cria as tabelas novas, sem os DROP falsos que o Prisma propõe
-- para "produtos_nome_ativo_key" e "venda_numero_seq" (ver schema.prisma).

CREATE TABLE "promocoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "promocoes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promocao_itens" (
    "id" TEXT NOT NULL,
    "promocaoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "valorPromocional" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "promocao_itens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "promocoes_inicio_fim_idx" ON "promocoes"("inicio", "fim");
CREATE UNIQUE INDEX "promocao_itens_promocaoId_produtoId_key" ON "promocao_itens"("promocaoId", "produtoId");
CREATE INDEX "promocao_itens_produtoId_idx" ON "promocao_itens"("produtoId");

ALTER TABLE "promocao_itens" ADD CONSTRAINT "promocao_itens_promocaoId_fkey" FOREIGN KEY ("promocaoId") REFERENCES "promocoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promocao_itens" ADD CONSTRAINT "promocao_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
