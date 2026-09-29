# feature: BI Avançado — v2 (compras por distribuidora, mês a mês)

Revisão da [spec-v1](spec-v1.md). Tudo da v1 continua valendo; esta versão adiciona um endpoint.

## requisitos

Mostrar, para os **últimos 6 meses** (incluindo o mês atual), quanto foi comprado de cada distribuidora em cada mês, para saber de onde a loja compra mais.

## regras de negócio

- Fonte: `Compra` (despesas) com `categoria = 'Produtos Pets'` — só nessa categoria o campo `fornecedor` é a distribuidora
- Despesas `cancelado` ficam fora
- Janela: do dia 1 do mês (atual − 5) até o fim do mês atual; o mês de cada compra é o de `dataPedido`
- Os 6 meses sempre aparecem em `meses`, mesmo sem compras (valor 0)
- `distribuidoras` ordenadas por `total` (soma dos 6 meses) decrescente
- O período do filtro no topo da página do BI **não** afeta este quadro

## endpoint

### GET /api/v1/bi/compras-distribuidora-mensal

**Response 200:**
```json
{
  "data": {
    "meses": ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"],
    "distribuidoras": [
      { "fornecedor": "Market", "total": 3200.00, "porMes": { "2026-04": 0, "2026-05": 800.00, "2026-06": 0, "2026-07": 1200.00, "2026-08": 0, "2026-09": 1200.00 } }
    ],
    "totaisPorMes": { "2026-04": 0, "2026-05": 800.00, "2026-06": 0, "2026-07": 1200.00, "2026-08": 0, "2026-09": 1200.00 }
  }
}
```

## tela

Quadro "Compras por Distribuidora — últimos 6 meses" no BI: linhas = distribuidoras, colunas = meses + Total, rodapé com o total de cada mês. Em cada mês, a distribuidora com a maior compra fica destacada. Respeita o botão de ocultar valores do BI.

## critérios de aceitação

- [ ] Retorna exatamente 6 meses, do mais antigo ao atual
- [ ] Só soma despesas `Produtos Pets`
- [ ] Ignora despesas `cancelado`
- [ ] Ignora compras anteriores à janela de 6 meses
- [ ] Soma várias compras da mesma distribuidora no mesmo mês
- [ ] Ordena distribuidoras pelo total decrescente
- [ ] `totaisPorMes` é a soma das distribuidoras em cada mês
- [ ] Na tela, a maior compra de cada mês aparece destacada; sem dados, mostra mensagem de vazio

## fora de escopo (v2)

- Escolher a quantidade de meses na tela
- Detalhar os produtos comprados de cada distribuidora
