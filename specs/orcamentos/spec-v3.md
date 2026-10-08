# feature: Orçamentos — v3 (desconto visível para o cliente)

Revisão da [spec-v2](spec-v2.md). Tudo da v2 continua valendo; esta versão muda o que o cliente vê no PDF e na mensagem de WhatsApp do orçamento.

## requisitos

O orçamento enviado ao cliente mostra quanto os produtos custariam sem desconto, quanto foi descontado e o valor final com desconto.

## regras de negócio

- **Valor total** = soma de `qtd × valorUnitario` de todos os itens (sem desconto)
- **Total com desconto** = `total` do orçamento no sistema (o valor que o cliente paga)
- **Desconto** = Valor total − Total com desconto (cobre desconto por item ou qualquer outro aplicado no total)
- Na tabela de produtos, a coluna "Preço" mostra o valor cheio do item (`qtd × valorUnitario`), para as linhas somarem o Valor total
- Sem desconto (desconto = 0), o PDF e a mensagem mostram só a linha "Total", como antes
- Não há mudança no backend nem em como o total é calculado

## pdf

```
Valor total                 R$ 500,00
Desconto                  - R$ 50,00
[ Total com desconto        R$ 450,00 ]   ← faixa vinho
```

(No PDF o sinal é o hífen comum: a fonte padrão do jsPDF não tem o caractere "−".)

## mensagem de WhatsApp

```
*Valor total:* R$ 500,00
*Desconto:* − R$ 50,00
*Total com desconto:* R$ 450,00
```

## critérios de aceitação

- [ ] Orçamento com desconto mostra Valor total, Desconto e Total com desconto (PDF e mensagem)
- [ ] Coluna "Preço" de cada item mostra `qtd × valorUnitario`
- [ ] Orçamento sem desconto mostra só "Total"
- [ ] Desconto nunca negativo
