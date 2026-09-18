# feature: Orçamentos

## requisitos

- Criar orçamento com cliente, animal opcional, itens, validade e observações
- Listar orçamentos com filtro por status, motivo de perda, cliente e período
- Alterar status (fechar / perder [com motivo] / reabrir)
- Converter orçamento em venda com um clique
- Excluir orçamentos abertos ou perdidos
- Registrar desconto de recompra aplicado (informativo)

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /orcamentos

**Query params:** `clienteId`, `status` (`aberto`|`fechado`|`perdido`), `motivoPerda`, `dataInicio`, `dataFim`, `page`, `limit`

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
      "status": "aberto",
      "motivoPerda": null,
      "descontoRecompraAplicado": false,
      "valorDescontoRecompra": null,
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

**Response 201:** objeto do orçamento com `status: "aberto"` e `total` calculado

---

### GET /orcamentos/:id

**Response 200:** objeto completo com itens, cliente, animal e campo `vencido`

---

### PATCH /orcamentos/:id/status

**Request:**
```json
{ "acao": "perder", "motivo": "Preço" }
```

`acao` é uma de `fechar` | `perder` | `reabrir`. O campo `motivo` é obrigatório quando `acao` é `perder` (um dos 8 valores fixos — ver rules.md) e é ignorado/limpo nas demais ações.

**Transições permitidas:**
- `aberto` → `fechado` (`acao: "fechar"`)
- `aberto` → `perdido` (`acao: "perder"`, com `motivo`)
- `perdido` → `aberto` (`acao: "reabrir"`, limpa o `motivoPerda`)

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
    "orcamento": { "id": "uuid", "status": "fechado", "vendaId": "uuid" }
  }
}
```

---

### PUT /orcamentos/:id

Além de `validade`, `obs` e `itens`, aceita opcionalmente `descontoRecompraAplicado` (boolean) e `valorDescontoRecompra` (number) — só permitido enquanto o orçamento está `aberto`.

---

### DELETE /orcamentos/:id

**Response 204**

**Erro 422** se status for `fechado`

## critérios de aceitação

- [ ] Criar orçamento sem itens retorna 400
- [ ] `total` é calculado pelo servidor
- [ ] `vencido: true` quando data atual > `validade` e status ainda `aberto`
- [ ] Alterar status de `fechado` → `aberto` retorna 422
- [ ] Alterar status de `fechado` → `perdido` retorna 422
- [ ] Marcar como `perdido` sem `motivo` (ou com motivo fora da lista) retorna 422 com `MOTIVO_PERDA_INVALIDO`
- [ ] Reabrir um orçamento `perdido` limpa o `motivoPerda`
- [ ] Converter cria venda e atualiza orçamento com `vendaId` e `status: fechado`
- [ ] Converter orçamento já convertido retorna 422
- [ ] Deletar orçamento `fechado` retorna 422
- [ ] Listar com `status=aberto` retorna apenas abertos
- [ ] GET /orcamentos/:id retorna `vencido` calculado dinamicamente

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Sem itens | 400 | `VALIDATION_ERROR` |
| Cliente não encontrado | 404 | `NOT_FOUND` |
| Transição de status inválida | 422 | `INVALID_STATUS_TRANSITION` |
| Motivo de perda ausente/inválido | 422 | `MOTIVO_PERDA_INVALIDO` |
| Já convertido | 422 | `ALREADY_CONVERTED` |
| Deletar fechado | 422 | `CANNOT_DELETE_CONVERTED` |
| Orçamento não encontrado | 404 | `NOT_FOUND` |

## fora de escopo (v1)

- Envio de orçamento por e-mail/WhatsApp
- Assinatura digital do cliente
- Versioning de orçamento (revisões)
- Desconto percentual global
- Vínculo automático de desconto de recompra por mesmo produto entre orçamentos do mesmo cliente (a regra ainda está sendo definida — por ora os campos são só para registro/consulta manual)
