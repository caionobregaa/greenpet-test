# feature: Orçamentos

## requisitos

- Criar orçamento com cliente, animal opcional, itens, validade e observações
- Listar orçamentos com filtro por status, cliente e período
- Alterar status (aprovar / recusar / reabrir)
- Converter orçamento em venda com um clique
- Excluir orçamentos pendentes ou recusados

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /orcamentos

**Query params:** `clienteId`, `status`, `dataInicio`, `dataFim`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "data": "2026-05-14",
      "validade": "2026-05-21",
      "vencido": false,
      "clienteId": "uuid",
      "clienteNome": "Maria Silva",
      "animalId": "uuid",
      "animalNome": "Thor",
      "total": 310.00,
      "status": "pendente",
      "vendaId": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12 }
}
```

---

### POST /orcamentos

**Request:**
```json
{
  "clienteId": "uuid",
  "animalId": "uuid",
  "data": "2026-05-14",
  "validade": "2026-05-21",
  "obs": "Desconto especial para cliente fiel.",
  "itens": [
    { "produtoId": "uuid", "nome": "Royal Canin Mini Adult 2,5kg", "qtd": 2, "valorUnitario": 140.00 }
  ]
}
```

**Response 201:** objeto do orçamento com `status: "pendente"` e `total` calculado

---

### GET /orcamentos/:id

**Response 200:** objeto completo com itens, cliente, animal e campo `vencido`

---

### PATCH /orcamentos/:id/status

**Request:**
```json
{ "status": "recusado" }
```

**Transições permitidas:**
- `pendente` → `aprovado`
- `pendente` → `recusado`
- `recusado` → `pendente` (reabrir)

**Response 200:** objeto atualizado

---

### POST /orcamentos/:id/converter

Converte o orçamento em venda.

**Request (opcional):**
```json
{ "formaPag": "Pix", "data": "2026-05-14" }
```

**Response 201:**
```json
{
  "data": {
    "venda": { "id": "uuid", "total": 310.00, ... },
    "orcamento": { "id": "uuid", "status": "aprovado", "vendaId": "uuid" }
  }
}
```

---

### DELETE /orcamentos/:id

**Response 204**

**Erro 422** se status for `aprovado`

## critérios de aceitação

- [ ] Criar orçamento sem itens retorna 400
- [ ] `total` é calculado pelo servidor
- [ ] `vencido: true` quando data atual > `validade` e status ainda `pendente`
- [ ] Alterar status de `aprovado` → `pendente` retorna 422
- [ ] Alterar status de `aprovado` → `recusado` retorna 422
- [ ] Converter cria venda e atualiza orçamento com `vendaId` e `status: aprovado`
- [ ] Converter orçamento já convertido retorna 422
- [ ] Deletar orçamento `aprovado` retorna 422
- [ ] Listar com `status=pendente` retorna apenas pendentes
- [ ] GET /orcamentos/:id retorna `vencido` calculado dinamicamente

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Sem itens | 400 | `VALIDATION_ERROR` |
| Cliente não encontrado | 404 | `CLIENT_NOT_FOUND` |
| Transição de status inválida | 422 | `INVALID_STATUS_TRANSITION` |
| Já convertido | 422 | `ALREADY_CONVERTED` |
| Deletar aprovado | 422 | `CANNOT_DELETE_APPROVED` |
| Orçamento não encontrado | 404 | `NOT_FOUND` |

## fora de escopo (v1)

- Envio de orçamento por e-mail/WhatsApp
- Assinatura digital do cliente
- Versioning de orçamento (revisões)
- Desconto percentual global
