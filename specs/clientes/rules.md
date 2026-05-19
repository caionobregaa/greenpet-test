# Regras de Negócio — Clientes

- CPF é opcional, mas se informado deve ser válido (algoritmo de validação padrão)
- E-mail é opcional, mas se informado deve ser único no sistema
- Telefone é obrigatório, no formato brasileiro: `(99) 9 9999-9999` ou `(99) 9999-9999`
- Nome completo é obrigatório (mínimo 3 caracteres)
- Clientes não podem ser excluídos se possuírem vendas ou orçamentos vinculados
- Exclusão lógica (soft delete) — campo `deletedAt`
- Busca por nome é case-insensitive e aceita termos parciais
- Cidade padrão: Manaus/AM
