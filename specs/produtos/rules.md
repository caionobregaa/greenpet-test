# Regras de Negócio — Produtos

- Nome do produto é obrigatório e único no catálogo
- `valorVenda` deve ser maior que zero
- `valorCusto` deve ser maior ou igual a zero
- Margem de lucro é calculada pelo servidor: `(valorVenda - valorCusto) / valorVenda * 100`
- Espécie aceita: `Cão`, `Gato`, `Ambos`
- Categoria aceita: `Ração`, `Petisco`, `Medicamento`, `Acessório`, `Higiene`, `Serviço`
- Produto inativo (soft delete) não aparece nas buscas de venda/orçamento
- Atualização de preço não afeta vendas/orçamentos já registrados
- Estoque não é controlado nesta versão (fora de escopo v1)
