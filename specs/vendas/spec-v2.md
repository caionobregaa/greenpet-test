# feature: Vendas — v2 (taxas de pagamento)

Revisão da [spec-v1](spec-v1.md). Define as taxas descontadas por forma de pagamento para calcular o lucro real de cada venda. Valem para **Nova venda**, **Editar venda** e **Orçamento aprovado → converter em venda**.

## requisitos

- Ao escolher a forma de pagamento, o sistema aplica a taxa do banco e mostra o valor líquido
- A taxa vale igual para **link de pagamento** e **maquininha (presencial)**, então não há mais opções separadas por canal
- As taxas ficam definidas num único lugar no código

## tabela de taxas (negociação de 10/2026)

| Forma de pagamento | Taxa |
|---|---|
| PIX | 0% |
| Dinheiro | 0% |
| Boleto (só em orçamento) | 0% |
| Débito | 0,88% |
| Crédito 1x | 3,16% |
| Crédito 2x | 4,84% |
| Crédito 3x | 5,42% |

Tabela anterior (substituída): Link 1x 4,2% · Link 2x+ 6,09% · Maquininha 1x 3,15% · Maquininha 2x+ 5,39% · Débito 1,37% (e 0% no orçamento).

## regras de negócio

- A venda guarda `formaPag` (`Pix`, `Dinheiro`, `Cartão Crédito`, `Cartão Débito`, `Boleto`) e `taxaCartao` (percentual aplicado), como na v1. O backend não muda
- **Vendas já registradas mantêm a taxa com que foram gravadas.** As taxas novas só valem para vendas novas e para quem trocar a forma de pagamento ao editar
- Ao editar uma venda cuja taxa não está na tabela nova (ex. crédito a 4,2%), a forma aparece como "taxa registrada (4,2%)" e é mantida ao salvar. Escolher outra opção aplica a taxa nova
- Crédito acima de 3x não é oferecido

## critérios de aceitação

- [ ] Nova venda, Editar venda e Orçamento oferecem: PIX, Dinheiro, Débito (0,88%), Crédito 1x (3,16%), 2x (4,84%), 3x (5,42%); o Orçamento também oferece Boleto
- [ ] A venda é gravada com `formaPag` + `taxaCartao` da opção escolhida
- [ ] Débito no orçamento passa a descontar 0,88% (antes 0%)
- [ ] Editar venda com taxa da tabela nova seleciona a opção correspondente
- [ ] Editar venda com taxa antiga mostra "taxa registrada" e salva a mesma taxa se a forma não for trocada
- [ ] Valor líquido exibido = total × (1 − taxa)
