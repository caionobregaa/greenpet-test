-- AlterTable: registra o preço pago em cada lote de entrada de estoque (feature "preço de compra")
ALTER TABLE "estoque_itens" ADD COLUMN IF NOT EXISTS "precoCompra" DECIMAL(10,2);

-- AddForeignKey: FK que já era esperada pelo schema (relação Orcamento -> Cliente) mas nunca
-- tinha sido criada no banco. clienteId já é opcional; nenhuma linha órfã encontrada.
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- NOTA: o diff automático do Prisma (migrate dev / db push) também propõe, a cada execução,
-- dar DROP SEQUENCE em "orcamento_numero_seq" e "venda_numero_seq" (usadas pelos campos
-- Orcamento.numero e Venda.numero via @default(dbgenerated(...))). Isso é FALSO POSITIVO:
-- o Prisma não tem como declarar uma sequence nomeada no schema.prisma, então ao gerar o
-- estado "alvo" só a partir do texto do schema ele não sabe que a sequence precisa continuar
-- existindo e propõe removê-la. NUNCA aplique esse trecho — ele quebraria a numeração
-- automática de orçamentos/vendas. Sempre revise e remova essas linhas antes de aplicar
-- qualquer migração gerada automaticamente para este schema.
