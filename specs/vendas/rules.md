# Regras de Negócio — Vendas

- Toda venda deve ter ao menos um item (produto/serviço)
- Cliente é obrigatório; animal é opcional
- Data da venda não pode ser futura
- Valor unitário de cada item deve ser maior que zero (confirmação explícita se zero, conforme UX atual)
- Quantidade mínima por item: 1
- Uma venda registrada não pode ser editada — apenas excluída (auditoria)
- Exclusão de venda é física (hard delete) nesta versão, com confirmação
- Forma de pagamento aceita: `Pix`, `Dinheiro`, `Cartão Crédito`, `Cartão Débito`, `Boleto`
- Total da venda é calculado pelo servidor (soma de `qtd * valorUnitario` de todos os itens)
- Produtos nos itens são gravados como snapshot (nome + valor) — alteração futura do produto não afeta vendas passadas
