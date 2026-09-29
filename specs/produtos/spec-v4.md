# feature: Produtos (v4 — Busca por SKU e por palavras em qualquer ordem)

## contexto

Estende [spec-v1.md](spec-v1.md) (busca `q` em GET /produtos). Na v1 o texto inteiro de `q`
precisava aparecer junto e na mesma ordem em nome, marca ou subcategoria: "fresh frango" não
encontrava "FN Fresh Meat Cão Adulto PORTE Mini e Pequeno SABOR Frango 10.1kg", e o SKU
(ex. `RAC-0100`) não era pesquisável.

## requisitos

- `q` é dividido em palavras (separadas por espaço). Um produto é retornado quando **todas** as
  palavras aparecem, em qualquer ordem e em qualquer posição (não só no começo), em pelo menos
  um destes campos: `nome`, `marca`, `subCategoria`, `sku`, `codigoBarras`.
- A comparação ignora maiúsculas/minúsculas e acentos ("racao" encontra "Ração").
- No SKU o hífen é opcional: `RAC-0100`, `rac0100`, `rac-01` e `0100` encontram `RAC-0100`.
- Caracteres `%` e `_` digitados pelo usuário são tratados como texto, não como curinga.
- Os demais filtros (`categoria`, `especie`, `fornecedor`, `marca`) continuam combinando com
  `q` por E, e produtos excluídos continuam fora do resultado.
- Todas as telas que buscam produto pelo backend (Produtos, itens de Venda, Estoque ›
  Adicionar, Recompra) passam a ter esse comportamento sem mudança própria.
- A busca local da listagem de Estoque (`estoque/page.tsx`) segue a mesma regra (palavras em
  qualquer ordem; nome, marca, SKU e código de barras; sem acento/caixa). Para isso a resposta
  de GET /estoque passa a incluir `produto.sku`.
- Os placeholders das caixas de busca de produto citam o SKU.

## endpoints (delta sobre v1)

### GET /produtos?q=...

Mesmo contrato; muda só a regra de correspondência descrita acima.

### GET /estoque — response (delta)

`produto` ganha `"sku"` (string).

## critérios de aceitação

- [ ] `q=RAC-0100` retorna o produto de SKU `RAC-0100`
- [ ] `q=rac0100` e `q=0100` também retornam o produto de SKU `RAC-0100`
- [ ] `q=fresh frango` retorna "FN Fresh Meat ... SABOR Frango 10.1kg" (palavras fora de ordem)
- [ ] `q=frango fresh` retorna o mesmo produto (ordem invertida)
- [ ] `q=fresh salmao` não retorna o produto de frango (todas as palavras são obrigatórias)
- [ ] `q=racao` encontra produto com "Ração" no nome (sem acento)
- [ ] `q=meat` encontra produto com "Meat" no meio do nome
- [ ] `q` com código de barras (ou parte dele) encontra o produto
- [ ] `q=100%` não trata `%` como curinga
- [ ] Produto excluído não aparece em nenhuma busca
- [ ] Busca local do Estoque encontra por SKU e por palavras fora de ordem

## casos de erro

Sem casos novos — `q` vazio ou só com espaços equivale a não enviar `q`.

## fora de escopo (v4)

- Tolerância a erro de digitação (busca aproximada/fuzzy)
- Ordenação por relevância (resultado segue ordenado por nome)
- Índices de busca textual (volume atual do catálogo não exige)
