# feature: Orçamentos — v4 (imprimir orçamento na térmica)

Revisão da [spec-v3](spec-v3.md). Tudo da v3 continua valendo. Esta versão adiciona a impressão do orçamento como cupom térmico, para acompanhar pedidos que o cliente só paga depois da entrega.

## requisitos

- A tela do orçamento (`/orcamentos/[id]`) tem um botão **"Imprimir Orçamento"**
- O cupom usa o mesmo layout térmico do recibo de venda ([vendas/spec-v3](../vendas/spec-v3.md)): bobina 80 mm, 72 mm de largura útil, margem 0, altura do conteúdo, só preto
- Título do cupom: **ORÇAMENTO** (o recibo de venda continua sendo o documento de pagamento, ver [vendas/spec-v4](../vendas/spec-v4.md))
- A forma de pagamento sai como **"VALOR EM ABERTO"**, porque o orçamento ainda não foi pago

## conteúdo do cupom

```
            BEEZ PET
           ORÇAMENTO
- - - - - - - - - - - - - - - -
Cliente: Madalena
Pet: Fofinha
Data: 21/10/2026
Validade: 28/10/2026
Orçamento: #012
- - - - - - - - - - - - - - - -
1x Ração X 2,5kg       R$ 108,10
- - - - - - - - - - - - - - - -
Subtotal               R$ 108,10
Desconto               −R$ 5,41
- - - - - - - - - - - - - - - -
TOTAL                  R$ 102,69
Pagamento:       VALOR EM ABERTO
- - - - - - - - - - - - - - - -
   Obrigado pela preferência!
```

## regras de negócio

- Os valores seguem a v3: cada linha mostra `qtd × valorUnitario`, Subtotal = soma das linhas, Desconto = Subtotal − total (só aparece se > 0), TOTAL = `total` do orçamento
- Pet só aparece se o orçamento tiver animal
- O botão aparece em qualquer status (aberto, fechado, perdido)
- Não há mudança no backend

## critérios de aceitação

- [ ] A tela do orçamento tem o botão "Imprimir Orçamento", que imprime o cupom com o `@page` térmico
- [ ] O cupom tem o título "ORÇAMENTO"
- [ ] O cupom mostra cliente, pet (se houver), data, validade e número do orçamento
- [ ] Itens com `qtd × valorUnitario`; Subtotal, Desconto (só se > 0) e TOTAL conforme a v3
- [ ] Pagamento: "VALOR EM ABERTO"
- [ ] O resto da tela não aparece na impressão

## fora de escopo

- Imprimir direto da lista de orçamentos (o botão fica na tela do orçamento)
- Mudar as "formas de pagamento aceitas" do formulário ou do PDF
