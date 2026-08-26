# Regras de Negócio — Curva ABC de Vendas

- A curva é um dado **calculado** — não existe tabela própria; é derivada de `Venda`/`VendaItem`
- Critério de classificação: **receita total** (`VendaItem.total`), não quantidade
- Passos do cálculo:
  1. Somar a receita (`total`) e a quantidade (`qtd`) de cada produto a partir dos itens de venda, dentro do período informado (ou todo o histórico, se nenhum período for informado)
  2. Ordenar os produtos por receita total **decrescente**
  3. Calcular `percentualReceita = receitaTotal / receitaGeral * 100` para cada produto
  4. Calcular `percentualAcumulado` como a soma progressiva de `percentualReceita` na ordenação acima
- Classificação por `percentualAcumulado`:
  - 🟢 **A**: `percentualAcumulado <= 80%`
  - 🟡 **B**: `80% < percentualAcumulado <= 95%`
  - 🔴 **C**: `percentualAcumulado > 95%`
- Produtos sem nenhuma venda no período são **excluídos** do resultado (não recebem curva "vazia")
- Produtos deletados (soft-delete, `Produto.deletedAt` preenchido) são excluídos do resultado
- Itens de venda sem `produtoId` (produto avulso/excluído da venda) são ignorados na agregação
