# feature: Vendas — v6 (valor em aberto / pagamento parcial)

Revisão da [spec-v5](spec-v5.md). Tudo da v5 continua valendo. Esta versão registra quando o cliente **não paga o valor todo** na hora: o que falta fica **em aberto** na venda até ser recebido, e a loja tem como cobrar e provar o que é devido.

## requisitos

- Ao registrar a venda (Nova venda, ou Fechar Venda a partir de um orçamento), a opção **"Cliente não pagou tudo (deixar valor em aberto)"** pede o **valor recebido agora**. A diferença para o total fica **em aberto**
- Sem marcar a opção, a venda é considerada paga por inteiro (como hoje)
- Na tela da venda há o quadro **Pagamento**: total, recebido, em aberto, e o histórico de recebimentos
- **Registrar recebimento**: valor (padrão = o que falta), data (padrão = hoje), forma de pagamento e observação. Pode ser pago em várias partes
- Um recebimento lançado errado pode ser **excluído** (com confirmação)
- O **recibo** de uma venda com valor em aberto mostra "Valor pago" e **"VALOR EM ABERTO"**, para o cliente levar (e a loja guardar) a comprovação do que falta
- A **lista de vendas** marca as vendas com valor em aberto
- A tela de **Avisos** mostra a seção **"Valores em aberto"**: cliente, telefone, venda, data, quanto falta e há quantos dias, mais a soma total a receber

## regras de negócio

- A venda guarda `valorRecebido` (o que foi pago no ato) e a lista de `pagamentos` posteriores (`valor`, `data`, `formaPag`, `obs`)
- **Valor pago** = `valorRecebido` + soma dos `pagamentos`
- **Valor em aberto** = `max(0, total − valor pago)`. Venda com valor em aberto = 0 está **quitada**
- `valorRecebido` na criação: se não informado, a venda é **paga por inteiro** e o campo fica vazio (o valor recebido acompanha o total). Se informado, precisa estar entre 0 e o total (`VALIDATION_ERROR` caso contrário)
- Recebimento: `valor` > 0 e ≤ valor em aberto (`VALIDATION_ERROR` caso contrário). `formaPag` é uma das formas da venda (`Pix`, `Dinheiro`, `Cartão Crédito`, `Cartão Débito`, `Boleto`)
- Editar a venda não muda o que já foi pago. Venda paga por inteiro (campo vazio) continua quitada com o total novo. Venda com valor em aberto tem o em aberto recalculado (total novo − valor pago)
- Vendas registradas antes desta versão ficam com o campo vazio (pagas por inteiro)
- Excluir a venda exclui os recebimentos dela
- A venda continua entrando nos relatórios pelo **total** na data da venda; os recebimentos não mudam faturamento nem lucro (são controle de cobrança)
- A taxa de cartão continua sendo a da forma de pagamento da venda; o recebimento posterior não recalcula taxa

## endpoints

- `POST /api/v1/vendas` e `POST /api/v1/orcamentos/:id/converter`: aceitam `valorRecebido` (opcional)
- Respostas de venda passam a trazer `valorRecebido`, `valorPago`, `valorEmAberto` e `pagamentos: [{ id, valor, data, formaPag, obs }]`
- `POST /api/v1/vendas/:id/pagamentos` — body `{ valor, data?, formaPag, obs? }` → 201 com a venda atualizada
- `DELETE /api/v1/vendas/:id/pagamentos/:pagamentoId` → 200 com a venda atualizada (404 se não existir)
- `GET /api/v1/vendas/em-aberto` → `{ data: [{ vendaId, vendaNumero, vendaData, clienteId, clienteNome, clienteTelefone, total, valorPago, valorEmAberto }], meta: { totalEmAberto } }`, da venda mais antiga para a mais nova

## critérios de aceitação

- [ ] Venda criada sem `valorRecebido` fica quitada (em aberto = 0)
- [ ] Venda criada com `valorRecebido` menor que o total fica com em aberto = total − recebido
- [ ] `valorRecebido` negativo ou maior que o total retorna `VALIDATION_ERROR`
- [ ] Registrar recebimento reduz o valor em aberto; recebimento maior que o em aberto ou ≤ 0 retorna `VALIDATION_ERROR`
- [ ] Excluir recebimento devolve o valor ao em aberto
- [ ] Editar a venda mantém valor recebido e recebimentos
- [ ] Converter orçamento com `valorRecebido` deixa a diferença em aberto
- [ ] `GET /vendas/em-aberto` lista só vendas com valor em aberto, com a soma total
- [ ] Tela: Nova venda e Fechar Venda têm a opção "Cliente não pagou tudo", com o valor recebido e o que fica em aberto
- [ ] Tela da venda: quadro Pagamento com histórico, Registrar recebimento e excluir recebimento
- [ ] Recibo com valor em aberto mostra "Valor pago" e "VALOR EM ABERTO"
- [ ] Lista de vendas marca as vendas em aberto; Avisos lista os valores em aberto com o total a receber

## fora de escopo

- Lembrete automático de cobrança (WhatsApp)
- Fluxo de caixa por data de recebimento
- Juros/multa por atraso
- Limite de crédito por cliente
