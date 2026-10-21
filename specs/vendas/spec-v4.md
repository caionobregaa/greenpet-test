# feature: Vendas — v4 (recibo com título RECIBO e forma de pagamento)

Revisão da [spec-v3](spec-v3.md). Tudo da v3 continua valendo (layout térmico 80 mm). Com o orçamento impresso como **ORÇAMENTO** ([orcamentos/spec-v4](../orcamentos/spec-v4.md)), o cupom da venda passa a se identificar como **RECIBO**, o documento de que o cliente pagou.

## requisitos

- Título do cupom da venda: **RECIBO** (antes "Recibo de Venda")
- O recibo mostra a forma de pagamento da venda, logo abaixo do TOTAL

## regras de negócio

- O nome da forma de pagamento é o da tabela de opções ([spec-v2](spec-v2.md)), **sem o percentual da taxa**, que é custo da loja e não do cliente: `PIX`, `Dinheiro`, `Débito`, `Crédito 1x`, `Crédito 2x`, `Crédito 3x`, `Boleto`
- Venda com taxa que não está na tabela atual (taxa registrada) mostra o `formaPag` gravado (ex. `Cartão Crédito`)

## critérios de aceitação

- [ ] O recibo tem o título "RECIBO"
- [ ] O recibo mostra "Pagamento: <forma>" abaixo do TOTAL
- [ ] Crédito parcelado mostra as parcelas (ex. "Crédito 2x") e nunca o percentual da taxa
- [ ] Venda com taxa registrada mostra o `formaPag` gravado
