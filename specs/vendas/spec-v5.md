# feature: Vendas — v5 (brinde com valor final zerado)

Revisão da [spec-v4](spec-v4.md). Tudo da v4 continua valendo. Esta versão define como o **item brinde** (botão 🎁 no item da venda) entra na venda e no recibo.

## requisitos

- Item marcado como brinde tem **valor final zerado**: não é cobrado, não entra no subtotal e **não aparece como desconto**
- No recibo, o brinde aparece como **BRINDE** no lugar do valor
- O custo do produto brinde continua contando no lucro da venda (como hoje)

## regras de negócio

- Item com `brinde = true` é gravado com `valorUnitario = 0`, `desconto = 0` e `total = 0`. **O backend garante isso**, mesmo que receba outro valor
- Na tela (Nova venda / Editar venda), enquanto o item é brinde:
  - os campos "Valor Unit." e "Desconto R$" ficam travados em 0
  - escolher ou trocar o produto não preenche o preço
  - o subtotal do item mostra "Brinde" no lugar de R$ 0,00
- Desmarcar o brinde devolve o preço anterior do item (se houver) ou o preço do produto escolhido
- Brinde não entra na base do desconto de recompra (5%), já que o valor dele é 0
- No recibo: a linha do item mostra `Nx Nome ...... BRINDE`; o brinde não soma no Subtotal nem no "Desconto total"

## critérios de aceitação

- [ ] Backend: item brinde enviado com valor e desconto é gravado com valorUnitario 0, desconto 0 e total 0; o total da venda não inclui o item
- [ ] Tela: marcar brinde zera e trava Valor Unit. e Desconto
- [ ] Tela: escolher produto em item brinde não muda o valor (fica 0)
- [ ] Tela: desmarcar brinde devolve o preço do produto
- [ ] Recibo: item brinde mostra "BRINDE" e não entra no Subtotal nem no Desconto total

## fora de escopo

- Brinde em orçamento (o orçamento não tem a opção de brinde)
- Mudar o cálculo do lucro (o custo do brinde já é contado)
