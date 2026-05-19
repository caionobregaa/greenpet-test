# feature: Produtos

## requisitos

- CRUD completo do catálogo de produtos
- Busca por nome, marca, categoria e espécie
- Retorno de margem calculada pelo servidor
- Listagem paginada para o frontend

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### GET /produtos

**Query params:** `q`, `categoria`, `especie`, `marca`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Royal Canin Mini Adult 2,5kg",
      "categoria": "Ração",
      "especie": "Cão",
      "subCategoria": "Adulto",
      "marca": "Royal Canin",
      "fornecedor": "Basso Pancotte",
      "pesoEmbalagem": 2.5,
      "valorCusto": 88.38,
      "valorVenda": 140.00,
      "margem": 36.87,
      "margemCartao": 6.09,
      "margemImposto": 5.0,
      "margemOperacao": 2.0,
      "margemLucro": 45.0,
      "descricao": "Ração adulta para cães de raças pequenas."
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 174 }
}
```

---

### POST /produtos

**Request:**
```json
{
  "nome": "Royal Canin Mini Adult 2,5kg",
  "categoria": "Ração",
  "especie": "Cão",
  "subCategoria": "Adulto",
  "marca": "Royal Canin",
  "fornecedor": "Basso Pancotte",
  "pesoEmbalagem": 2.5,
  "valorCusto": 88.38,
  "valorVenda": 140.00,
  "margemCartao": 6.09,
  "margemImposto": 5.0,
  "margemOperacao": 2.0,
  "margemLucro": 45.0,
  "descricao": ""
}
```

**Response 201:** objeto do produto criado com `margem` calculada

---

### GET /produtos/:id

**Response 200:** objeto completo do produto

---

### PUT /produtos/:id

**Request:** campos parciais aceitos

**Response 200:** objeto atualizado com `margem` recalculada

---

### DELETE /produtos/:id

**Response 204** — soft delete (inativa o produto)

## critérios de aceitação

- [ ] Listar produtos filtrando por `categoria=Ração` retorna apenas rações ativas
- [ ] Filtrar por `especie=Gato` retorna apenas produtos para gatos e ambos
- [ ] Busca por `q=royal` retorna produtos com "Royal" no nome (case-insensitive)
- [ ] Criar produto sem nome retorna 400
- [ ] Criar produto com nome duplicado retorna 409
- [ ] `valorVenda` menor ou igual a zero retorna 400
- [ ] `margem` é calculada e retornada pelo servidor (não enviada pelo cliente)
- [ ] Produto inativado não aparece em GET /produtos sem parâmetro especial
- [ ] PUT atualiza `margem` automaticamente ao alterar preços

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| Nome ausente | 400 | `VALIDATION_ERROR` |
| Nome duplicado | 409 | `PRODUCT_ALREADY_EXISTS` |
| Preço de venda ≤ 0 | 400 | `INVALID_PRICE` |
| Categoria inválida | 400 | `INVALID_CATEGORY` |
| Espécie inválida | 400 | `INVALID_SPECIES` |
| Produto não encontrado | 404 | `NOT_FOUND` |

## fora de escopo (v1)

- Controle de estoque e movimentações
- Variações (tamanhos/sabores) de um mesmo produto
- Importação do catálogo via planilha
- Foto do produto
