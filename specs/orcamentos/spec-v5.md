# feature: Orçamentos — v5 (brinde no orçamento)

Revisão da [spec-v4](spec-v4.md). Tudo da v4 continua valendo. Esta versão leva para o orçamento a mesma regra do brinde da venda ([vendas/spec-v5](../vendas/spec-v5.md)): **o brinde tem valor final zerado e não mostra valor**, nem como desconto.

## requisitos

- O item do orçamento pode ser marcado como **brinde** (botão 🎁, como na venda)
- O brinde aparece como **BRINDE** no lugar do valor:
  - na tela do orçamento
  - no **cupom impresso** (ORÇAMENTO)
  - no **PDF** (colunas "Preço unitário" e "Preço" mostram "Brinde")
- O brinde não entra no Valor total/Subtotal nem no Desconto, nem no PDF, nem na mensagem de WhatsApp, nem no cupom
- Ao converter o orçamento em venda, o item continua brinde na venda

## regras de negócio

- Item com `brinde = true` é gravado com `valorUnitario = 0`, `desconto = 0` e `total = 0`. **O backend garante isso**, mesmo que receba outro valor
- Valor total (v3) = soma de `qtd × valorUnitario` só dos itens que **não** são brinde
- Na tela de criar/editar orçamento valem as mesmas travas da venda: Valor Unit. e Desconto travados em 0 e subtotal "Brinde"
- Orçamentos existentes ficam com `brinde = false`

## critérios de aceitação

- [ ] Backend: item de orçamento brinde é gravado com valorUnitario 0, desconto 0 e total 0 (criar e editar); o total do orçamento não inclui o item
- [ ] Criar orçamento com item brinde guarda `brinde = true`
- [ ] Tela do orçamento mostra "Brinde" no lugar dos valores do item
- [ ] Cupom ORÇAMENTO mostra "BRINDE" e o item não entra no Subtotal nem no Desconto
- [ ] PDF mostra "Brinde" nas colunas de preço; Valor total e Desconto ignoram o brinde
- [ ] Converter orçamento em venda mantém o item como brinde

## fora de escopo

- Mudar o layout do PDF além das colunas de preço do item brinde
