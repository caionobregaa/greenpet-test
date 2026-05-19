# Regras de Negócio — Animais

- Todo animal deve estar vinculado a um cliente existente e ativo
- Espécie aceita: `Cão`, `Gato` (lista extensível em versões futuras)
- Peso em kg, número decimal positivo; zero é aceito (não informado)
- Data de nascimento não pode ser futura
- Nome do animal é obrigatório (mínimo 2 caracteres)
- Animais não podem ser excluídos se possuírem vendas vinculadas
- Exclusão lógica (soft delete)
- Sexo aceita: `M`, `F`, `Indefinido`
