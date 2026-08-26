# feature: Curva ABC de Vendas

## requisitos

- Classificar produtos em curva **A**, **B** ou **C** com base na receita acumulada do histórico de vendas
- Permitir filtrar o período considerado (`dataInicio`, `dataFim`) e a categoria do produto
- Não há CRUD — é um endpoint somente leitura, calculado sob demanda (sem persistência, sem job/cron)

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /api/v1/curva-venda

**Query params:** `dataInicio` (ISO date, opcional), `dataFim` (ISO date, opcional), `categoria` (opcional), `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "produtoId": "uuid",
      "produtoNome": "Royal Canin Mini Adult 2,5kg",
      "categoria": "Ração",
      "quantidadeVendida": 120,
      "receitaTotal": 15000.00,
      "percentualReceita": 12.5,
      "percentualAcumulado": 12.5,
      "curva": "A"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 84,
    "resumo": { "A": 12, "B": 20, "C": 52 }
  }
}
```

## critérios de aceitação

- [ ] Produtos são ordenados por `receitaTotal` decrescente antes da classificação
- [ ] `percentualAcumulado` do último produto da lista completa é 100% (dentro de arredondamento)
- [ ] Classe `A` para produtos com `percentualAcumulado <= 80%`
- [ ] Classe `B` para produtos com `80% < percentualAcumulado <= 95%`
- [ ] Classe `C` para produtos com `percentualAcumulado > 95%`
- [ ] Produtos sem nenhuma venda no período não aparecem no resultado
- [ ] Produtos deletados (soft-delete) não aparecem no resultado
- [ ] Filtrar por `dataInicio`/`dataFim` restringe a agregação às vendas dentro do período (`Venda.data`)
- [ ] Filtrar por `categoria` restringe o resultado aos produtos daquela categoria
- [ ] Sem `dataInicio`/`dataFim`, considera-se todo o histórico de vendas
- [ ] `meta.resumo` soma exatamente `meta.total`

## fora de escopo (v1)

- Persistir a classificação no cadastro do produto (campo `curva` em `Produto`)
- Recálculo automático via job/cron
- Curva por quantidade vendida (somente por receita)
