# feature: Compras (Pedidos a Fornecedores)

## requisitos

- Registrar pedido de compra para fornecedor com itens e valores de custo
- Acompanhar status do pedido (pendente → confirmado → recebido)
- Cancelar pedidos ainda não recebidos
- Listar compras com filtros por status, fornecedor e período
- Visualizar detalhes de uma compra

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /compras

**Query params:** `status`, `fornecedor`, `dataInicio`, `dataFim`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "dataPedido": "2026-05-14",
      "dataRecebimento": null,
      "fornecedor": "Basso Pancotte",
      "status": "pendente",
      "totalItens": 4,
      "total": 1250.00
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

---

### POST /compras

**Request:**
```json
{
  "fornecedor": "Basso Pancotte",
  "dataPedido": "2026-05-14",
  "obs": "Pedido urgente para reposição de estoque.",
  "itens": [
    { "produtoId": "uuid", "nome": "Royal Canin Mini Adult 2,5kg", "qtd": 10, "valorUnitario": 88.38 }
  ]
}
```

**Response 201:** objeto da compra com `status: "pendente"` e `total` calculado

---

### GET /compras/:id

**Response 200:** objeto completo com todos os itens

---

### PUT /compras/:id

Atualiza dados da compra (apenas se `pendente`).

**Request:** campos parciais aceitos (exceto `status` e `itens` via este endpoint)

**Response 200:** objeto atualizado

---

### PATCH /compras/:id/status

**Request:**
```json
{ "status": "recebido", "dataRecebimento": "2026-05-16" }
```

**Transições válidas:** ver rules.md

**Response 200:** objeto atualizado

---

### DELETE /compras/:id

**Response 204**

**Erro 422** se status for `recebido` ou `cancelado`

## critérios de aceitação

- [ ] Criar compra sem itens retorna 400
- [ ] `total` é calculado pelo servidor
- [ ] Transição `recebido` → qualquer coisa retorna 422
- [ ] Transição `cancelado` → qualquer coisa retorna 422
- [ ] Marcar como `recebido` sem `dataRecebimento` usa data atual
- [ ] `dataRecebimento` não pode ser anterior à `dataPedido`
- [ ] PUT em compra `confirmada` ou `recebida` retorna 422
- [ ] DELETE em compra `recebida` retorna 422
- [ ] Listar com `status=pendente` retorna apenas pendentes
- [ ] Buscar fornecedor retorna compras cujo fornecedor contém a string (case-insensitive)

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Sem itens | 400 | `VALIDATION_ERROR` |
| Fornecedor ausente | 400 | `VALIDATION_ERROR` |
| Transição inválida | 422 | `INVALID_STATUS_TRANSITION` |
| Editar compra não-pendente | 422 | `CANNOT_EDIT_NON_PENDING` |
| Deletar recebido/cancelado | 422 | `CANNOT_DELETE` |
| Compra não encontrada | 404 | `NOT_FOUND` |
| Data recebimento < data pedido | 400 | `INVALID_DATE` |

## fora de escopo (v1)

- Cadastro formal de fornecedores (CNPJ, contato)
- Geração de ordem de compra em PDF
- Integração com sistema do fornecedor
- Entrada automática em estoque ao receber
