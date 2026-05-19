# feature: Animais

## requisitos

- CRUD completo de animais vinculados a clientes
- Busca por nome, raça e espécie
- Exibição de idade calculada a partir da data de nascimento

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /animais

**Query params:** `clienteId`, `especie`, `q`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Thor",
      "especie": "Cão",
      "raca": "Golden Retriever",
      "sexo": "M",
      "nascimento": "2022-03-15",
      "idadeCalculada": "2 anos",
      "peso": 28.5,
      "clienteId": "uuid",
      "clienteNome": "Maria Silva"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 10 }
}
```

---

### POST /animais

**Request:**
```json
{
  "nome": "Thor",
  "clienteId": "uuid",
  "especie": "Cão",
  "raca": "Golden Retriever",
  "sexo": "M",
  "nascimento": "2022-03-15",
  "peso": 28.5,
  "obs": ""
}
```

**Response 201:** objeto do animal criado

---

### GET /animais/:id

**Response 200:** objeto completo do animal + dados do cliente

---

### PUT /animais/:id

**Request:** campos parciais aceitos

**Response 200:** objeto atualizado

---

### DELETE /animais/:id

**Response 204** — soft delete

**Erro 422** se animal tiver vendas vinculadas

## critérios de aceitação

- [ ] Listar animais filtrando por `clienteId` retorna apenas animais daquele cliente
- [ ] Filtrar por `especie=Gato` retorna apenas gatos
- [ ] Criar animal sem `clienteId` retorna 400
- [ ] Criar animal com `clienteId` inexistente retorna 404
- [ ] Criar animal com `nascimento` no futuro retorna 400
- [ ] Espécie fora do domínio aceito retorna 400
- [ ] `idadeCalculada` é retornado corretamente no GET
- [ ] Deletar animal com vendas retorna 422
- [ ] Deletar animal sem vínculos retorna 204

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Nome ausente | 400 | `VALIDATION_ERROR` |
| `clienteId` ausente | 400 | `VALIDATION_ERROR` |
| Cliente não encontrado | 404 | `CLIENT_NOT_FOUND` |
| Nascimento futuro | 400 | `INVALID_DATE` |
| Espécie inválida | 400 | `INVALID_SPECIES` |
| Animal com vendas | 422 | `ANIMAL_HAS_SALES` |
| Animal não encontrado | 404 | `NOT_FOUND` |

## fora de escopo (v1)

- Prontuário veterinário / histórico médico
- Foto do animal
- Múltiplos donos por animal
