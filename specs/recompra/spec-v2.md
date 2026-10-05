# feature: Controle de Recompra — v2 (lembrete de mensagem e clientes sumidos)

Revisão da [spec-v1](spec-v1.md). O cálculo dos alertas (urgência, dias restantes, última venda por cliente/produto/animal) continua igual.

## conceitos

- **Alerta**: `(clienteId, produtoId, animalId)`, com a `ultimaCompra` que o originou.
- **Ciclo**: a chave do alerta + `ultimaCompra`. Quando o cliente compra o produto de novo, `ultimaCompra` muda e começa um ciclo novo.
- **Alerta de aviso**: alerta com `diasRestantes <= 10` (inclui os vencidos). Aparece na aba Avisos e no card "Alertas de Recompra" do Dashboard.
- **Recompra atrasada**: urgência `vencido`.
- **Cliente sumido**: alerta `vencido` há **mais de 30 dias** (`diasRestantes < -30`).

## requisitos

- Na aba **Avisos**, o alerta de recompra vira um **lembrete de envio de mensagem**. O usuário abre o WhatsApp do cliente com texto pronto e marca "mensagem enviada".
- Marcar a mensagem **não remove** o alerta: atrasados e sumidos só saem quando o cliente **compra de novo** (ciclo novo).
- O **Dashboard** ganha o card "Alertas de Recompra", um resumo dos alertas de aviso com link para Avisos.
- A aba **Clientes** ganha a categoria **Sumidos**: a lista de clientes sumidos, onde se registram os **motivos** de terem parado de comprar.
- Os motivos alimentam o BI ([bi-avancado/spec-v3](../bi-avancado/spec-v3.md)).

## regras de negócio

- Mensagem enviada e motivos ficam presos ao **ciclo**. Num ciclo novo, a mensagem volta para "a enviar" e o cliente sai dos sumidos. Os motivos antigos ficam guardados (histórico do BI).
- Marcar mensagem é idempotente; dá para desfazer.
- Motivos (lista fechada): `Preço`, `Comprou em outro lugar`, `Trocou de produto/ração`, `Animal faleceu/foi doado`, `Mudou de cidade`, `Insatisfeito com produto/atendimento`, `Ainda tem produto em casa`, `Não respondeu`, `Outro`.
- Pelo menos 1 motivo; vários podem ser marcados; `Outro` exige `outroTexto`.
- Só dá para registrar motivos para quem está sumido no ciclo informado.
- Registrar de novo no mesmo ciclo substitui os motivos anteriores (edição).
- **Checagem dupla na tela**: o usuário marca os motivos (passo 1) e confirma num resumo (passo 2) antes de gravar.
- Quem marcou/registrou (e-mail do usuário logado) e quando ficam gravados.
- O dismissal (OK/Cancelar) da página Recompra continua como na v1. A aba Avisos não o usa mais.

## endpoints

### GET /api/v1/recompra (alterado)

Cada alerta ganha:
```json
{
  "clienteTelefone": "92991234567",
  "mensagemEnviadaEm": "2026-10-05T14:00:00.000Z",
  "mensagemEnviadaPor": "caio@beezpet.com",
  "motivosSumido": { "motivos": ["Preço", "Outro"], "outroTexto": "achou mais barato no atacado", "registradoEm": "2026-10-05T14:10:00.000Z" }
}
```
`mensagemEnviadaEm`/`mensagemEnviadaPor`/`motivosSumido` são `null` quando não há registro no ciclo atual.

### POST /api/v1/recompra/contato · DELETE /api/v1/recompra/contato

**Body:** `{ "clienteId": "uuid", "produtoId": "uuid", "animalId": "", "ultimaCompra": "2026-08-01T00:00:00.000Z" }` → **204**. O POST marca a mensagem como enviada (idempotente); o DELETE desfaz.

### GET /api/v1/recompra/sumidos

Retorna os alertas de clientes sumidos (mesmo formato do GET /recompra, mais `diasAtraso`), ordenados pelo maior atraso.

### PUT /api/v1/recompra/sumidos/motivos

**Body:** chave do ciclo + `{ "motivos": ["Preço"], "outroTexto": null }` → **200** com o registro.

### GET /api/v1/dashboard-operacional (alterado)

Ganha `alertasRecompra: { total, itens }` (alertas de aviso).

## critérios de aceitação

- [ ] Alerta traz `clienteTelefone`, `mensagemEnviadaEm` e `motivosSumido` do ciclo atual
- [ ] Marcar mensagem enviada **não** tira o alerta da lista, nem de atrasados ou sumidos
- [ ] Marcar duas vezes não duplica (idempotente); DELETE desfaz
- [ ] Nova venda do mesmo produto (ciclo novo) volta a mensagem para "a enviar" e tira o cliente de atrasados/sumidos
- [ ] `GET /sumidos` traz só vencidos há mais de 30 dias, com motivos do ciclo
- [ ] `PUT motivos` sem motivo, com motivo fora da lista ou com `Outro` sem texto → 400 `VALIDATION_ERROR`
- [ ] `PUT motivos` para quem não está sumido no ciclo → 422 `NOT_SUMIDO`
- [ ] `PUT motivos` repetido no mesmo ciclo substitui os motivos
- [ ] Dashboard traz `alertasRecompra` com os alertas de `diasRestantes <= 10`
- [ ] Avisos separa "A enviar" e "Mensagem enviada" e tem botão de WhatsApp com mensagem pronta
- [ ] Clientes > Sumidos lista os sumidos; o dialog de motivos não avança sem motivo (nem com Outro vazio) e só grava após a confirmação

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Body inválido / motivo fora da lista / Outro sem texto | 400 | `VALIDATION_ERROR` |
| Cliente não está sumido no ciclo | 422 | `NOT_SUMIDO` |

## fora de escopo (v2)

- Envio automático de mensagens
- Editar a lista de motivos pela tela
- Mudar o OK/Cancelar da página Recompra
