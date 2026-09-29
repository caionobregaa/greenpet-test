# feature: Compras / Despesas — v2 (filtro por mês + total)

Revisão da [spec-v1](spec-v1.md). Tudo que não é citado aqui continua valendo da v1.
Na interface o módulo aparece como **Despesas** (`/compras`).

## requisitos

- A tela de Despesas abre mostrando só as despesas do **mês vigente**
- O usuário navega para o mês anterior/seguinte e volta ao mês atual com um clique
- A tela mostra o **valor total somado** das despesas do mês exibido, independente da página

## regras de negócio

- Mês é identificado por `YYYY-MM` e compara com `dataPedido` (gravada como data, meia-noite UTC): `dataPedido >= YYYY-MM-01` e `< 1º dia do mês seguinte`
- `totalValor` soma `total` de todas as despesas que casam com os filtros, **exceto as `cancelado`** (mesma regra do dashboard)
- `totalValor` não depende de `page`/`limit`
- Sem `mes`, a listagem se comporta como na v1 (todas as datas)

## endpoints

### GET /compras

**Query params (novo):** `mes` — `YYYY-MM`, opcional. Demais params iguais à v1 (`status`, `categoria`, `fornecedor`, `page`, `limit`).

**Response 200:**
```json
{
  "data": [ { "id": "uuid", "dataPedido": "2026-09-14", "fornecedor": "Market", "categoria": "Produtos Pets", "status": "pendente", "total": 1250.00 } ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalValor": 4380.50 }
}
```

## critérios de aceitação

- [ ] `mes=2026-09` retorna só despesas com `dataPedido` entre 01/09 e 30/09 (inclusive)
- [ ] Despesas de 31/08 e 01/10 ficam fora de `mes=2026-09`
- [ ] `meta.totalValor` soma os totais do mês, sem as despesas `cancelado`
- [ ] `meta.totalValor` é o mesmo em qualquer página
- [ ] `mes` em formato inválido (ex. `2026-13`, `09-2026`) retorna 400 `VALIDATION_ERROR`
- [ ] Sem `mes`, retorna despesas de todas as datas
- [ ] Despesa sem itens (valor manual, ex. aluguel) é listada e detalhada com o `total` gravado, não com 0 (correção de bug da v1)
- [ ] Tela abre no mês atual; ‹ e › trocam o mês e voltam a paginação para a página 1
- [ ] Tela mostra o total do mês e a quantidade de despesas

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| `mes` fora do formato `YYYY-MM` | 400 | `VALIDATION_ERROR` |

## fora de escopo (v2)

- Filtro por intervalo arbitrário de datas na tela
- Total por categoria na própria tela (já existe no BI)
