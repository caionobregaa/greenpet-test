# feature: Produtos — v11 (correções de cadastro: rações úmidas de Petisco, Simparic e Golden)

Revisão da [spec-v10](spec-v10.md). Tudo da v10 continua valendo (usuário, 09/11/2026). Tudo é feito por migração no banco, que roda quando o backend é implantado.

## rações úmidas cadastradas como Petisco

- PET-0020, PET-0021, PET-0022, PET-0023, PET-0024 e PET-0025 passam para `Ração Úmida`, com SKU novo `RUM-…`, na ordem do SKU antigo, continuando do maior RUM existente
- O nome ganha "Ração Úmida " no início, no formato das demais rações úmidas ("Ração Úmida Matisse…"); o resto do nome não muda
- Nome que já começa com "Ração Úmida" não recebe o prefixo de novo
- Se o nome com prefixo já existir em outro produto ativo, o produto troca de SKU e categoria, mas mantém o nome

## Simparic

- Os produtos Simparic (nome ou marca) em `Suplemento` passam para `Medicamento`, com SKU novo `MED-…`, na ordem do SKU antigo, continuando do maior MED existente

## Golden

- "Gonden" é erro de digitação de "Golden": corrigido no nome e na marca, mantendo maiúsculas e minúsculas. Nome que ficaria igual ao de outro produto ativo fica como está

## sequências

- Ao final, as sequências RUM e MED continuam depois do maior código existente

## critérios de aceitação

- [ ] Os seis PET viram `RUM-…`, em `Ração Úmida`, com "Ração Úmida " no início do nome
- [ ] Simparic sai de Suplemento para Medicamento, com SKU `MED-…`
- [ ] "Gonden" vira "Golden" no nome e na marca
- [ ] Vendas, orçamentos e estoque continuam ligados aos produtos
- [ ] Outros produtos não mudam; a migração roda sem erro
