# feature: Dashboard

## requisitos

- Retornar KPIs principais: faturamento, ticket médio, total de vendas, total de clientes ativos
- Retornar top 5 clientes por faturamento no período
- Retornar top 5 produtos por quantidade vendida no período
- Retornar faturamento agrupado por mês (todos os meses com dados)
- Permitir filtro por mês/ano

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /dashboard

**Query params:** `mes` (1-12), `ano` (ex: 2026)

**Response 200:**
```json
{
  "data": {
    "periodo": { "mes": 5, "ano": 2026, "label": "Maio 2026" },
    "kpis": {
      "faturamentoPeriodo": 12450.00,
      "faturamentoGeral": 98700.00,
      "totalVendasPeriodo": 42,
      "ticketMedio": 296.43,
      "totalClientes": 87,
      "totalAnimais": 112,
      "alertasRecompra": 5
    },
    "topClientes": [
      { "clienteId": "uuid", "nome": "Maria Silva", "total": 1250.00, "totalVendas": 4 }
    ],
    "topProdutos": [
      { "produtoId": "uuid", "nome": "Royal Canin Mini Adult 2,5kg", "qtdVendida": 18, "totalFaturado": 2520.00 }
    ],
    "faturamentoPorMes": [
      { "mes": "2026-01", "total": 8500.00 },
      { "mes": "2026-02", "total": 9200.00 }
    ]
  }
}
```

## critérios de aceitação

- [ ] Sem filtro de período retorna dados do mês atual
- [ ] Filtrar por `mes=1&ano=2026` retorna dados de Janeiro/2026
- [ ] `faturamentoPeriodo` considera apenas vendas do período filtrado
- [ ] `faturamentoGeral` é sempre o total histórico (não filtrado)
- [ ] `topClientes` limitado a 5, ordenado por total decrescente
- [ ] `topProdutos` limitado a 5, ordenado por qtd decrescente
- [ ] `faturamentoPorMes` inclui todos os meses com pelo menos uma venda
- [ ] `alertasRecompra` conta alertas vencidos + urgentes do endpoint `/recompra/alertas`
- [ ] `ticketMedio` retorna 0 quando não há vendas no período

## fora de escopo (v1)

- Exportação do dashboard em PDF/Excel
- Comparação entre períodos (ex: mês atual vs anterior)
- Breakdown de faturamento por categoria de produto
- Metas de venda
