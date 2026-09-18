# feature: BI Avançado

## requisitos

Métricas agregadas de negócio, todas expostas em um único endpoint. Não há entidade de domínio própria — o módulo só lê dados de `Venda`/`VendaItem`/`Produto`/`Orcamento` já existentes.

## endpoint

### GET /api/v1/bi/avancado

**Query params:** `inicio` (data, default: dia 1 do mês corrente), `fim` (data, default: hoje), `page`, `limit` (paginação do ranking de LTV)

**Response 200:**
```json
{
  "data": {
    "rankingLtv": { "clientes": [{ "clienteId": "uuid", "nome": "Maria", "totalGasto": 1200, "totalVendas": 5 }], "total": 42 },
    "taxaRecompra": { "percentual": 38.5, "clientesComRecompra": 20, "totalClientes": 52 },
    "taxaRecompraMensal": [
      { "mes": "2026-07-01", "percentual": 40.0, "clientesComRecompra": 4, "totalClientes": 10 }
    ],
    "taxaRecompraJanela": [
      { "janelaDias": 30, "percentual": 25.0, "clientesComRecompra": 5, "totalClientes": 20 },
      { "janelaDias": 60, "percentual": 45.0, "clientesComRecompra": 9, "totalClientes": 20 },
      { "janelaDias": 90, "percentual": 55.0, "clientesComRecompra": 11, "totalClientes": 20 }
    ],
    "cicloRecompraPorCategoria": [{ "categoria": "Ração", "cicloMedioDias": 32.1, "amostras": 18 }],
    "margemPorCategoria": [{ "categoria": "Ração", "margemMediaCatalogo": 40.0, "margemRealizada": 38.2 }],
    "taxaFechamento": {
      "porMes": [{ "mes": "2026-07-01", "fechados": 60, "perdidos": 25, "taxaFechamento": 70.59, "taxaNaoFechamento": 29.41 }],
      "total": { "fechados": 60, "perdidos": 25, "taxaFechamento": 70.59, "taxaNaoFechamento": 29.41 },
      "breakdownMotivoPerda": [{ "motivo": "Preço", "quantidade": 15, "percentual": 60.0 }]
    }
  }
}
```

## métricas

### Ranking LTV, taxa de recompra global, ciclo de recompra por categoria, margem por categoria

Métricas originais do módulo (sem mudanças nesta revisão):
- **Ranking LTV**: clientes ordenados por receita acumulada (`Venda.total` somado), paginado.
- **Taxa de recompra (global)**: % de clientes com 2+ vendas em todo o histórico, sobre o total de clientes com 1+ venda.
- **Ciclo de recompra por categoria**: média de dias entre compras consecutivas do mesmo cliente, pooled por categoria de produto.
- **Margem por categoria**: margem média do catálogo ativo vs. margem realmente realizada nas vendas do período.

### Taxa de recompra mensal (cohort)

Agrupa clientes pelo **mês da 1ª compra de todo o histórico** (filtrado por `[inicio, fim]`) e calcula, dentro de cada cohort, o % que teve alguma 2ª compra em **qualquer momento futuro** — mesma definição de "recompra" da taxa global, só segmentada por mês de aquisição.

⚠️ Limitação conhecida: cohorts recentes (ex. mês passado) naturalmente têm taxa mais baixa por ainda não terem tido tempo de maturação para uma 2ª compra. Não há normalização/decaimento aplicado — comparar cohorts de períodos muito próximos ao `fim` do relatório com cautela.

### Taxa de recompra por janela de 30/60/90 dias

Dentre os clientes cuja **1ª compra do histórico** caiu em `[inicio, fim]`, % cuja **2ª compra** ocorreu em até N dias depois da 1ª (N = 30, 60 ou 90). Diferente da métrica mensal: aqui a recompra precisa acontecer **dentro do prazo**, não "alguma vez" — é a métrica pensada para refletir o ciclo natural de recompra (ex. ração).

### Taxa de fechamento / não-fechamento de orçamentos

Baseada em `Orcamento.status`, não em `Venda`. Só considera orçamentos **concluídos** (`fechado` ou `perdido`) no período — orçamentos `aberto` ficam fora do denominador, pois ainda podem virar venda.

```
taxaFechamento    = fechados / (fechados + perdidos) * 100
taxaNaoFechamento = perdidos / (fechados + perdidos) * 100
```

`porMes` traz a mesma conta quebrada por mês (`Orcamento.data`); `total` é o agregado do período inteiro. `breakdownMotivoPerda` mostra a distribuição dos motivos de perda (`Orcamento.motivoPerda`) entre os orçamentos perdidos do período, com `percentual` relativo ao total de perdidos (não ao total de orçamentos).

## fora de escopo (v1)

- Ticket médio por cliente (hoje só existe global/por período, no módulo `dashboard`)
- Vínculo entre a taxa de recompra e o campo `descontoRecompraAplicado` do orçamento
- Normalização estatística de cohorts recentes na taxa de recompra mensal
