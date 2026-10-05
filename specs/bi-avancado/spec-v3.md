# feature: BI Avançado — v3 (motivos dos clientes sumidos)

Revisão da [spec-v2](spec-v2.md). Tudo da v1/v2 continua valendo.

## requisitos

Mostrar no BI **por que os clientes somem**, a partir dos motivos registrados na categoria Sumidos da aba Clientes ([recompra/spec-v2](../recompra/spec-v2.md)).

## regras de negócio

- Fonte: registros de motivos (`ClienteSumidoMotivo`) com `registradoEm` dentro de `[inicio, fim]` do BI
- Cada registro é um cliente sumido (num ciclo cliente/produto/animal) e pode ter vários motivos
- `quantidade` = registros que citaram o motivo; `percentual` = `quantidade / totalRegistros * 100` (a soma pode passar de 100%)
- Ordenado por `quantidade` decrescente

## endpoint

### GET /api/v1/bi/avancado (alterado)

Ganha:
```json
"motivosClientesSumidos": {
  "totalRegistros": 8,
  "motivos": [{ "motivo": "Preço", "quantidade": 5, "percentual": 62.5 }]
}
```

## tela

Card "Por que os clientes somem" nas Métricas Avançadas, com barras por motivo e o percentual. Respeita o botão de ocultar valores. Sem registros: "Nenhum motivo registrado no período".

## critérios de aceitação

- [ ] Conta só registros com `registradoEm` no período
- [ ] Um registro com 2 motivos conta 1 vez em cada motivo
- [ ] `percentual` relativo ao total de registros
- [ ] Sem registros: `totalRegistros = 0` e `motivos = []`
