# Regras de Negócio — Clientes

- CPF é opcional, mas se informado deve ser válido (algoritmo de validação padrão)
- E-mail é opcional, mas se informado deve ser único no sistema
- Telefone é obrigatório: aceita exatamente 11 dígitos numéricos e é armazenado no formato `(XX) X XXXX-XXXX`
- Nome completo é obrigatório (mínimo 3 caracteres)
- Clientes não podem ser excluídos se possuírem vendas ou orçamentos vinculados
- Exclusão lógica (soft delete) — campo `deletedAt`
- Busca por nome é case-insensitive e aceita termos parciais
- Cidade padrão: Manaus/AM
