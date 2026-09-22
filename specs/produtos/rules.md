# Regras de Negócio — Produtos

- Nome do produto é obrigatório e único no catálogo
- `valorVenda` deve ser maior que zero
- `valorCusto` deve ser maior ou igual a zero
- Margem de lucro é calculada pelo servidor: `(valorVenda - valorCusto) / valorVenda * 100`
- Espécie aceita: `Cão`, `Gato`, `Cão e Gato`
- Categoria aceita: `Ração`, `Petisco`, `Medicamento`, `Acessório`, `Higiene`, `Serviço`
- Produto inativo (soft delete) não aparece nas buscas de venda/orçamento
- Atualização de preço não afeta vendas/orçamentos já registrados
- Estoque não é controlado nesta versão (fora de escopo v1)
- Para produtos `categoria = "Ração"`, o campo `nome` pode ser composto automaticamente
  pelo frontend como `[Nome da Ração] [Espécie] [Fase da Vida] PORTE [Porte] SABOR [Sabor] [Peso][Unidade]`
  (segmentos vazios são omitidos); o campo permanece editável livremente após a
  composição, e o backend não impõe nem valida essa fórmula (ver spec-v2.md)
- Código de barras é um campo do produto (não do lote de estoque); `codigoBarras` e
  `semCodigoBarras` são mutuamente exclusivos — marcar um limpa o outro (ver spec-v3.md)
