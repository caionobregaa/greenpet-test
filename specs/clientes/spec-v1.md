# feature: Clientes

## requisitos

- CRUD completo de clientes
- Busca por nome, telefone e e-mail
- Listagem paginada com total de animais e compras por cliente
- Visualização de animais e histórico de compras vinculados ao cliente

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /clientes

**Query params:** `q`, `page`, `limit`, `cidade`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Maria Silva",
      "telefone": "(92) 9 9999-1234",
      "email": "maria@email.com",
      "cidade": "Manaus",
      "totalAnimais": 2,
      "totalCompras": 5,
      "createdAt": "2026-01-10"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

---

### POST /clientes

**Request:**
```json
{
  "nome": "Maria Silva",
  "telefone": "(92) 9 9999-1234",
  "email": "maria@email.com",
  "cpf": "000.000.000-00",
  "endereco": "Rua das Flores, 10",
  "cidade": "Manaus",
  "obs": ""
}
```

**Response 201:** objeto do cliente criado

---

### GET /clientes/:id

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "nome": "Maria Silva",
    "telefone": "(92) 9 9999-1234",
    "email": "maria@email.com",
    "cpf": "000.000.000-00",
    "endereco": "Rua das Flores, 10",
    "cidade": "Manaus",
    "obs": "",
    "animais": [ { "id": "uuid", "nome": "Thor", "especie": "Cão" } ],
    "totalGasto": 850.00,
    "createdAt": "2026-01-10"
  }
}
```

---

### PUT /clientes/:id

**Request:** mesmos campos do POST (parcial aceito)

**Response 200:** objeto atualizado

---

### DELETE /clientes/:id

**Response 204** — soft delete

**Erro 422** se cliente tiver vendas ou orçamentos ativos

---

### GET /clientes/:id/animais

**Response 200:** lista de animais do cliente

---

### GET /clientes/:id/vendas

**Query params:** `page`, `limit`

**Response 200:** lista paginada de vendas do cliente

---

### GET /clientes/:id/orcamentos

**Query params:** `status`, `page`, `limit`

**Response 200:** lista paginada de orçamentos do cliente

## critérios de aceitação

- [ ] Listar clientes retorna dados paginados
- [ ] Busca por nome parcial retorna resultados case-insensitive
- [ ] Criar cliente sem nome retorna 400
- [ ] Criar cliente com e-mail duplicado retorna 409
- [ ] Criar cliente com CPF inválido retorna 400
- [ ] Buscar cliente inexistente retorna 404
- [ ] Atualizar cliente atualiza apenas os campos enviados
- [ ] Deletar cliente com vendas retorna 422
- [ ] Deletar cliente sem vínculos retorna 204 e marca `deletedAt`
- [ ] GET /clientes/:id retorna `totalGasto` correto (soma das vendas)

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Nome ausente | 400 | `VALIDATION_ERROR` |
| E-mail duplicado | 409 | `EMAIL_ALREADY_EXISTS` |
| CPF inválido | 400 | `INVALID_CPF` |
| Cliente não encontrado | 404 | `NOT_FOUND` |
| Cliente com vendas | 422 | `CLIENT_HAS_SALES` |

## fora de escopo (v1)

- Importação em lote (CSV)
- Merge de clientes duplicados
- Histórico de alterações (audit log)
