# feature: Estoque

## requisitos

- Listar os lotes de estoque agrupados por produto, em **ordem alfabética do nome do produto**
- Buscar e filtrar como na tela de Produtos: texto livre + Distribuidora + Categoria + Espécie + "Limpar filtros"
- Adicionar, editar e remover lotes (quantidade, validade, lote, preço de compra)

## regras de negócio

- Ordem da listagem: nome do produto (A→Z), depois validade (mais próxima primeiro), depois lotes mais recentes
- Na tela, a ordem alfabética ignora acento e maiúscula (regra do português)
- Busca de texto: mesma regra da busca de produtos ([produtos/spec-v4](../produtos/spec-v4.md)) — toda palavra digitada precisa aparecer, em qualquer ordem e posição, em nome, marca, SKU (hífen opcional) ou código de barras, sem diferenciar acento nem maiúscula
- Filtros de Distribuidora, Categoria e Espécie comparam o valor exato do produto e se combinam com a busca (E lógico)
- A filtragem é feita na tela, sobre a lista carregada, para responder a cada tecla sem esperar o servidor

## endpoints

### GET /api/v1/estoque

**Query params:** `produtoId` (opcional), `page` (default 1), `limit` (default 100, máximo 1000)

**Response 200:** cada item traz `produto` com `id`, `nome`, `categoria`, `especie`, `fornecedor`, `marca`, `sku`, `codigoBarras`, `semCodigoBarras`, `imagemUrl`, `valorVenda`, `valorCusto`.

```json
{
  "data": [
    { "id": "uuid", "produtoId": "uuid", "produto": { "nome": "Bravecto 500mg (10 a 20kg)", "categoria": "Medicamento", "especie": "Cão", "fornecedor": "Market" }, "quantidade": 3, "validade": "2027-01-10", "lote": null, "precoCompra": 227.00 }
  ],
  "meta": { "page": 1, "limit": 1000, "total": 42 }
}
```

### POST / PUT / DELETE /api/v1/estoque

Sem mudanças de comportamento; as respostas trazem o mesmo formato de `produto` do GET.

## critérios de aceitação

- [ ] GET retorna os lotes ordenados pelo nome do produto (A→Z); lotes do mesmo produto por validade
- [ ] GET inclui `especie` e `fornecedor` do produto
- [ ] `limit` acima de 1000 retorna 400 `VALIDATION_ERROR`
- [ ] Tela lista os produtos em ordem alfabética
- [ ] Busca "brav 500" encontra "Bravecto 500mg (10 a 20kg)"
- [ ] Filtros de Distribuidora, Categoria e Espécie restringem a lista e se combinam com a busca
- [ ] "Limpar filtros" aparece só com algum filtro ativo e zera todos

## fora de escopo (v1)

- Paginação na tela de estoque
- Movimentação automática de estoque pelas vendas
