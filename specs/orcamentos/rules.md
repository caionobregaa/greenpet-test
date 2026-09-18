# Regras de Negócio — Orçamentos

- Todo orçamento deve ter ao menos um item
- Cliente é obrigatório; animal é opcional
- Validade padrão: 7 dias corridos a partir da data de criação
- Status possíveis: `aberto`, `fechado`, `perdido`
- Um orçamento `fechado` ou `perdido` não pode ter status alterado de volta para `aberto` — exceto por ação explícita de "reabrir" (apenas de `perdido` → `aberto`)
- Um orçamento `fechado` não pode ser reaberto
- Marcar como `perdido` exige um `motivoPerda` válido dentre: `Preço`, `Cliente desistiu`, `Comprou concorrente`, `Sem estoque`, `Produto indisponível`, `Frete/prazo`, `Parou de responder`, `Outro`
- Reabrir um orçamento `perdido` limpa o `motivoPerda`
- Converter em venda cria uma nova Venda e marca o orçamento como `fechado` e preenche `vendaId`
- Orçamento já convertido (`vendaId` preenchido) não pode ser convertido novamente
- Exclusão só permitida para orçamentos `aberto` ou `perdido`; orçamentos `fechado` são imutáveis
- Itens são snapshot (nome + valor) — alteração de produto não afeta orçamentos existentes
- Orçamento vencido (data atual > `validade`) permanece `aberto`, mas é sinalizado na resposta como `vencido: true`
- `descontoRecompraAplicado`/`valorDescontoRecompra` são campos informativos, setados manualmente via `PUT /orcamentos/:id` enquanto o orçamento está `aberto`; não há vínculo automático com o histórico de compras do cliente (trabalho futuro — ver "fora de escopo" em spec-v1.md)
