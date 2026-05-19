# feature: Vendas

## requisitos

- Registrar venda com cliente, animal opcional, itens e forma de pagamento
- Listar vendas com filtros por data, cliente e animal
- Visualizar detalhes de uma venda
- Excluir venda (com confirmação)

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /vendas

**Query params:** `clienteId`, `animalId`, `dataInicio`, `dataFim`, `formaPag`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "data": "2026-05-14",
      "clienteId": "uuid",
      "clienteNome": "Maria Silva",
      "animalId": "uuid",
      "animalNome": "Thor",
      "totalItens": 3,
      "total": 310.00,
      "formaPag": "Pix"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 58 }
}
```

---

### POST /vendas

**Request:**
```json
{
  "data": "2026-05-14",
  "clienteId": "uuid",
  "animalId": "uuid",
  "formaPag": "Pix",
  "obs": "",
  "itens": [
    { "produtoId": "uuid", "nome": "Royal Canin Mini Adult 2,5kg", "qtd": 2, "valorUnitario": 140.00 },
    { "produtoId": null,   "nome": "Consulta Veterinária",          "qtd": 1, "valorUnitario": 150.00 }
  ]
}
```

> `produtoId` é opcional — permite lançar serviços avulsos sem produto cadastrado.

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "data": "2026-05-14",
    "clienteId": "uuid",
    "animalId": "uuid",
    "formaPag": "Pix",
    "obs": "",
    "total": 430.00,
    "itens": [ ... ]
  }
}
```

---

### GET /vendas/:id

**Response 200:** objeto completo com todos os itens e dados de cliente/animal

---

### DELETE /vendas/:id

**Response 204**

## critérios de aceitação

- [ ] Criar venda sem itens retorna 400
- [ ] Criar venda com `clienteId` inexistente retorna 404
- [ ] `data` no futuro retorna 400
- [ ] `total` é calculado pelo servidor e retornado corretamente
- [ ] Itens sem `produtoId` são aceitos (serviços avulsos)
- [ ] Listar com `dataInicio` e `dataFim` retorna apenas vendas do período
- [ ] Listar com `clienteId` retorna apenas vendas daquele cliente
- [ ] GET /vendas/:id retorna todos os itens com snapshot de nome e valor
- [ ] DELETE /vendas/:id retorna 204 e remove a venda
- [ ] Alterar produto depois da venda não afeta o snapshot dos itens

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Sem itens | 400 | `VALIDATION_ERROR` |
| Cliente não encontrado | 404 | `CLIENT_NOT_FOUND` |
| Animal não pertence ao cliente | 422 | `ANIMAL_CLIENT_MISMATCH` |
| Data futura | 400 | `INVALID_DATE` |
| Forma de pagamento inválida | 400 | `INVALID_PAYMENT_METHOD` |
| Venda não encontrada | 404 | `NOT_FOUND` |

## fora de escopo (v1)

- Edição de venda após registro
- Aplicação de descontos percentuais
- Devolução / estorno
- NF-e / cupom fiscal
