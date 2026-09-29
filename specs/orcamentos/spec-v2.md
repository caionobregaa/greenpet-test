# feature: Orçamentos (v2 — Data do pagamento ao converter em venda)

## contexto

Estende [spec-v1.md](spec-v1.md). A v1 já previa `data` no corpo de
`POST /orcamentos/:id/converter`, mas a conversão sempre gravava a venda com a data do dia.
Na prática o cliente pede num dia e paga em outro: a venda precisa ficar com a data em que o
cliente **pagou**, e o orçamento continua com a data em que ele **pediu**.

## requisitos

- `POST /orcamentos/:id/converter` aceita `data` opcional (`YYYY-MM-DD`), que vira a `data`
  da venda criada. Sem `data`, a venda fica com a data do dia (comportamento atual).
- A data é gravada ao meio-dia UTC, como no cadastro/edição de venda (`vendas.schema.ts`),
  para não mudar de dia por fuso horário.
- A `data` do orçamento não é alterada pela conversão.
- No diálogo "Fechar Venda" (`orcamentos/[id]/page.tsx`) aparece o campo
  **Data do pagamento**, preenchido com a data de hoje (fuso do navegador) e editável.
  Não aceita data futura.
- O mesmo campo aparece em Nova Venda › "Importar Orçamento Pendente" (`vendas/nova/page.tsx`),
  que também converte o orçamento e cujo campo "Data" fica oculto nesse fluxo.
- Relatórios que usam a data da venda (dashboard, BI, curva de venda) passam a contar a venda
  no dia do pagamento, sem mudança própria.

## endpoints (delta sobre v1)

### POST /orcamentos/:id/converter

```json
{ "formaPag": "Pix", "taxaCartao": 0, "data": "2026-09-25" }
```

`data` inválida (fora do formato `YYYY-MM-DD`) → 400 `VALIDATION_ERROR`.

## critérios de aceitação

- [ ] Converter com `data: "2026-09-25"` cria venda com data 25/09/2026
- [ ] Converter sem `data` cria venda com a data do dia
- [ ] A data do orçamento continua a original depois da conversão
- [ ] `data` em formato inválido retorna 400
- [ ] O diálogo "Fechar Venda" e a Nova Venda com orçamento importado mostram "Data do
      pagamento" com hoje por padrão, não permitem data futura e enviam a data escolhida

## fora de escopo (v2)

- Vendas "a receber" (registrar a venda antes do pagamento e dar baixa depois)
- Pagamento parcelado / em várias datas
- Alterar a data do orçamento
