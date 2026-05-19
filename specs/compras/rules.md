# Regras de Negócio — Compras (Pedidos a Fornecedores)

- Compra representa um pedido de reposição feito pelo pet shop a um fornecedor
- Toda compra deve ter ao menos um item
- Fornecedor é obrigatório (referência à tabela de fornecedores, fora de escopo v1 — usar string livre)
- Status possíveis: `pendente`, `confirmado`, `recebido`, `cancelado`
- Transições de status permitidas:
  - `pendente` → `confirmado`
  - `confirmado` → `recebido`
  - `pendente` → `cancelado`
  - `confirmado` → `cancelado`
  - `recebido` e `cancelado` são estados finais — sem transição
- Ao marcar como `recebido`, a data de recebimento real é registrada
- Compra `recebido` não pode ser editada nem excluída
- Compra `cancelado` não pode ser editada
- Valor total é calculado pelo servidor: soma de `qtd * valorUnitario` dos itens
- O campo `valorUnitario` nos itens representa o custo de compra (não o preço de venda)
