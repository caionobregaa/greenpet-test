# Regras de Negócio — Orçamentos

- Todo orçamento deve ter ao menos um item
- Cliente é obrigatório; animal é opcional
- Validade padrão: 7 dias corridos a partir da data de criação
- Status possíveis: `pendente`, `aprovado`, `recusado`
- Um orçamento `aprovado` ou `recusado` não pode ter status alterado de volta para `pendente` — exceto por ação explícita de "reabrir" (apenas de `recusado` → `pendente`)
- Um orçamento `aprovado` não pode ser reaberto
- Converter em venda cria uma nova Venda e marca o orçamento como `aprovado` e preenche `vendaId`
- Orçamento já convertido (`vendaId` preenchido) não pode ser convertido novamente
- Exclusão só permitida para orçamentos `pendente` ou `recusado`; orçamentos `aprovado` são imutáveis
- Itens são snapshot (nome + valor) — alteração de produto não afeta orçamentos existentes
- Orçamento vencido (data atual > `validade`) permanece `pendente`, mas é sinalizado na resposta como `vencido: true`
